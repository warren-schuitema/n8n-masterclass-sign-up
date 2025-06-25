/*
  # Fix Stripe Integration for Unauthenticated Flow

  1. Database Schema Changes
    - Make user_id nullable in stripe_customers table
    - Remove foreign key constraint to auth.users
    - Update RLS policies to handle null user_id
    - Add customer_id to registrations table for direct linking

  2. Security Updates
    - Update RLS policies for unauthenticated flow
    - Ensure data integrity without auth dependency

  3. Data Linking
    - Link registrations directly to stripe customers
    - Maintain existing subscription and order functionality
*/

-- First, make user_id nullable in stripe_customers and remove foreign key constraint
DO $$
BEGIN
  -- Drop the foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'stripe_customers_user_id_fkey' 
    AND table_name = 'stripe_customers'
  ) THEN
    ALTER TABLE stripe_customers DROP CONSTRAINT stripe_customers_user_id_fkey;
  END IF;
  
  -- Make user_id nullable
  ALTER TABLE stripe_customers ALTER COLUMN user_id DROP NOT NULL;
END $$;

-- Add customer_id to registrations table for direct linking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN customer_id text;
  END IF;
END $$;

-- Update RLS policies for stripe_customers to handle null user_id
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) AND (deleted_at IS NULL));

-- Add policy for service role to manage all customer data
CREATE POLICY "Service role can manage all customer data"
  ON stripe_customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update RLS policies for stripe_subscriptions to handle customers without user_id
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING ((customer_id IN ( 
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL))
  )) AND (deleted_at IS NULL));

-- Add policy for service role to manage all subscription data
CREATE POLICY "Service role can manage all subscription data"
  ON stripe_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update RLS policies for stripe_orders to handle customers without user_id
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING ((customer_id IN ( 
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL))
  )) AND (deleted_at IS NULL));

-- Add policy for service role to manage all order data
CREATE POLICY "Service role can manage all order data"
  ON stripe_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index on registrations.customer_id for performance
CREATE INDEX IF NOT EXISTS idx_registrations_customer_id ON registrations(customer_id);