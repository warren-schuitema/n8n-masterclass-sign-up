import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  experience: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse request body
    const registrationData: RegistrationData = await req.json();
    console.log('Received registration data:', {
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email ? '[REDACTED]' : 'missing',
      priceId: registrationData.priceId,
      hasPhone: !!registrationData.phone,
      hasCompany: !!registrationData.company,
      experience: registrationData.experience
    });

    // Validate required fields
    if (!registrationData.firstName || !registrationData.lastName || !registrationData.email || !registrationData.priceId) {
      const missingFields = [];
      if (!registrationData.firstName) missingFields.push('firstName');
      if (!registrationData.lastName) missingFields.push('lastName');
      if (!registrationData.email) missingFields.push('email');
      if (!registrationData.priceId) missingFields.push('priceId');
      
      console.error('Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Initialize Stripe
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Initializing Stripe...');
    const stripe = new Stripe(stripeSecret, {
      appInfo: {
        name: 'N8N Masterclass',
        version: '1.0.0',
      },
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find or create Stripe customer
    let customer;
    try {
      console.log('Looking for existing customer with email...');
      const existingCustomers = await stripe.customers.list({
        email: registrationData.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('Found existing customer:', customer.id);
      } else {
        console.log('Creating new customer...');
        customer = await stripe.customers.create({
          email: registrationData.email,
          name: `${registrationData.firstName} ${registrationData.lastName}`,
          phone: registrationData.phone || undefined,
          metadata: {
            company: registrationData.company || '',
            experience: registrationData.experience,
          },
        });
        console.log('Created new customer:', customer.id);
      }
    } catch (customerError: any) {
      console.error('Error handling customer:', customerError);
      const errorMessage = customerError.message || 'Failed to create or find customer';
      return new Response(
        JSON.stringify({ error: `Customer error: ${errorMessage}` }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Save or update customer in Supabase stripe_customers table (without user_id)
    try {
      console.log('Saving customer to Supabase...');
      const { error: customerError } = await supabase
        .from('stripe_customers')
        .upsert({
          customer_id: customer.id,
          user_id: null, // No authenticated user for this flow
        }, {
          onConflict: 'customer_id',
          ignoreDuplicates: false
        });

      if (customerError) {
        console.error('Error saving customer to Supabase:', customerError);
        // Continue with checkout even if this fails
      } else {
        console.log('Customer saved to Supabase successfully');
      }
    } catch (dbError: any) {
      console.error('Database error saving customer:', dbError);
      // Continue with checkout process
    }

    // Save or update registration data in database
    try {
      console.log('Saving registration data to database...');
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .upsert({
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phone || null,
          company: registrationData.company || null,
          customer_id: customer.id, // Link directly to Stripe customer
          payment_status: 'pending',
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (registrationError) {
        console.error('Error saving registration:', registrationError);
        // Continue with checkout even if registration save fails
        // We'll try to save it again in the webhook
      } else {
        console.log('Registration saved successfully:', registration?.id);
      }
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      // Continue with checkout process
    }

    // Create checkout session with registration data in metadata
    try {
      console.log('Creating checkout session with price ID:', registrationData.priceId);
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: registrationData.priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: registrationData.successUrl,
        cancel_url: registrationData.cancelUrl,
        metadata: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phone || '',
          company: registrationData.company || '',
          experience: registrationData.experience,
        },
      });

      console.log('Successfully created checkout session:', session.id);
      return new Response(
        JSON.stringify({ 
          sessionId: session.id, 
          url: session.url 
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (sessionError: any) {
      console.error('Error creating checkout session:', sessionError);
      
      // Enhanced error handling for Stripe-specific errors
      let errorMessage = 'Failed to create checkout session';
      
      if (sessionError.type) {
        switch (sessionError.type) {
          case 'StripeCardError':
            errorMessage = `Card error: ${sessionError.message}`;
            break;
          case 'StripeRateLimitError':
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 'StripeInvalidRequestError':
            errorMessage = `Invalid request: ${sessionError.message}`;
            break;
          case 'StripeAPIError':
            errorMessage = 'Payment service temporarily unavailable. Please try again.';
            break;
          case 'StripeConnectionError':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'StripeAuthenticationError':
            errorMessage = 'Payment service configuration error.';
            break;
          default:
            errorMessage = sessionError.message || errorMessage;
        }
      } else if (sessionError.message) {
        errorMessage = sessionError.message;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error in checkout session creation:', error);
    
    // Enhanced error message handling
    let errorMessage = 'Internal server error';
    
    if (error && typeof error === 'object') {
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString && typeof error.toString === 'function') {
        errorMessage = error.toString();
      } else {
        errorMessage = JSON.stringify(error);
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('Final error message being returned:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});