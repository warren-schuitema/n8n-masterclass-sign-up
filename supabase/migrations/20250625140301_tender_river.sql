/*
  # Create registrations table for masterclass signups

  1. New Tables
    - `registrations`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required) 
      - `email` (text, required, unique)
      - `phone` (text, optional)
      - `company` (text, optional)
      - `registration_date` (timestamp)
      - `stripe_session_id` (text, optional for tracking payments)
      - `payment_status` (text, default 'free')

  2. Security
    - Enable RLS on `registrations` table
    - Add policy for public insert (since no auth required)
    - Add policy for service role to read all data

  3. Indexes
    - Index on email for fast lookups
    - Index on registration_date for reporting
*/

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  company text,
  registration_date timestamptz DEFAULT now(),
  stripe_session_id text,
  payment_status text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for registration (no auth required)
CREATE POLICY "Allow public registration inserts"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow service role to read all registrations (for admin purposes)
CREATE POLICY "Service role can read all registrations"
  ON registrations
  FOR SELECT
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();