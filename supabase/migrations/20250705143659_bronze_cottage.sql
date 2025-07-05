/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `user_first_name` (text)
      - `user_goal` (text)
      - `user_current_activity_level` (text)
      - `user_activity_factor_value` (numeric)
      - `user_gender` (text)
      - `user_dob` (text)
      - `user_age` (integer)
      - `user_height` (numeric)
      - `user_height_unit` (text)
      - `user_current_weight` (numeric)
      - `user_current_weight_unit` (text)
      - `user_goal_weight` (numeric)
      - `user_goal_weight_unit` (text)
      - `user_caloric_goal_intensity_value` (numeric)
      - `user_calculated_bmr` (numeric)
      - `user_calculated_tdee` (numeric)
      - `user_caloric_goal` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_first_name text NOT NULL,
  user_goal text NOT NULL,
  user_current_activity_level text NOT NULL,
  user_activity_factor_value numeric NOT NULL,
  user_gender text NOT NULL,
  user_dob text NOT NULL,
  user_age integer NOT NULL,
  user_height numeric NOT NULL,
  user_height_unit text NOT NULL,
  user_current_weight numeric NOT NULL,
  user_current_weight_unit text NOT NULL,
  user_goal_weight numeric NOT NULL,
  user_goal_weight_unit text NOT NULL,
  user_caloric_goal_intensity_value numeric NOT NULL,
  user_calculated_bmr numeric NOT NULL,
  user_calculated_tdee numeric NOT NULL,
  user_caloric_goal numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();