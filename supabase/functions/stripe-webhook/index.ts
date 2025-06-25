import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'N8N Masterclass',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  console.log('Processing webhook event:', event.type);
  
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    console.log('No data in webhook event');
    return;
  }

  // Handle checkout session completed for one-time payments
  if (event.type === 'checkout.session.completed') {
    const session = stripeData as Stripe.Checkout.Session;
    console.log('Processing checkout session completed:', session.id);
    
    if (session.mode === 'payment' && session.payment_status === 'paid') {
      console.log('Processing completed payment for session:', session.id);
      
      try {
        // Extract registration data from metadata
        const metadata = session.metadata;
        console.log('Session metadata:', metadata);
        
        if (metadata && metadata.firstName && metadata.lastName && metadata.email) {
          // Update or insert registration data
          const { error: registrationError } = await supabase
            .from('registrations')
            .upsert({
              first_name: metadata.firstName,
              last_name: metadata.lastName,
              email: metadata.email,
              phone: metadata.phone || null,
              company: metadata.company || null,
              customer_id: session.customer as string,
              stripe_session_id: session.id,
              payment_status: 'completed',
            }, {
              onConflict: 'email',
              ignoreDuplicates: false
            });

          if (registrationError) {
            console.error('Error upserting registration:', registrationError);
          } else {
            console.log('Registration updated successfully for:', metadata.email);
          }
        } else {
          console.error('Missing required metadata in session:', session.id);
        }

        // Ensure customer exists in stripe_customers table
        if (session.customer) {
          const customerId = session.customer as string;
          
          // Check if customer exists in our database
          const { data: existingCustomer, error: customerCheckError } = await supabase
            .from('stripe_customers')
            .select('customer_id')
            .eq('customer_id', customerId)
            .maybeSingle();

          if (customerCheckError) {
            console.error('Error checking existing customer:', customerCheckError);
          } else if (!existingCustomer) {
            // Customer doesn't exist, create it
            const { error: customerInsertError } = await supabase
              .from('stripe_customers')
              .insert({
                customer_id: customerId,
                user_id: null, // No authenticated user for this flow
              });

            if (customerInsertError) {
              console.error('Error inserting customer:', customerInsertError);
            } else {
              console.log('Customer created successfully:', customerId);
            }
          }

          // Insert order data into stripe_orders table
          const { error: orderError } = await supabase
            .from('stripe_orders')
            .insert({
              checkout_session_id: session.id,
              payment_intent_id: session.payment_intent as string,
              customer_id: customerId,
              amount_subtotal: session.amount_subtotal || 0,
              amount_total: session.amount_total || 0,
              currency: session.currency || 'usd',
              payment_status: session.payment_status || 'paid',
              status: 'completed',
            });

          if (orderError) {
            console.error('Error inserting order:', orderError);
          } else {
            console.log('Order saved successfully for session:', session.id);
          }
        }

      } catch (error) {
        console.error('Error processing checkout session:', error);
      }
    }
  }

  // Handle subscription events if needed (for future subscription products)
  if ('customer' in stripeData && event.type !== 'checkout.session.completed') {
    const { customer: customerId } = stripeData;

    if (customerId && typeof customerId === 'string') {
      let isSubscription = true;

      if (event.type === 'checkout.session.completed') {
        const { mode } = stripeData as Stripe.Checkout.Session;
        isSubscription = mode === 'subscription';
      }

      // Only process subscription events for actual subscription webhooks
      if (isSubscription) {
        console.info(`Starting subscription sync for customer: ${customerId}`);
        await syncCustomerFromStripe(customerId);
      }
    }
  }
}

// Handle subscription events (for future subscription products)
async function syncCustomerFromStripe(customerId: string) {
  try {
    // Ensure customer exists in stripe_customers table first
    const { data: existingCustomer, error: customerCheckError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (customerCheckError) {
      console.error('Error checking existing customer:', customerCheckError);
      return;
    }

    if (!existingCustomer) {
      // Customer doesn't exist, create it
      const { error: customerInsertError } = await supabase
        .from('stripe_customers')
        .insert({
          customer_id: customerId,
          user_id: null, // No authenticated user for this flow
        });

      if (customerInsertError) {
        console.error('Error inserting customer for subscription:', customerInsertError);
        return;
      } else {
        console.log('Customer created for subscription:', customerId);
      }
    }

    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
      return;
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}