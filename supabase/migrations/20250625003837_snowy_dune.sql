/*
  # Create user information table for CRM and email marketing

  1. New Tables
    - `user_info`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `company` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_info` table
    - Add policy for authenticated users to read/write their own data

  3. Indexes
    - Add index on user_id for faster lookups
    - Add index on email for CRM integration
*/

CREATE TABLE IF NOT EXISTS user_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own info"
  ON user_info
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own info"
  ON user_info
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own info"
  ON user_info
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_info_user_id ON user_info(user_id);
CREATE INDEX IF NOT EXISTS idx_user_info_email ON user_info(email);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_info_updated_at
    BEFORE UPDATE ON user_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();