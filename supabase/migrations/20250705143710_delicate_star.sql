/*
  # Create meals table

  1. New Tables
    - `meals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbohydrates` (numeric)
      - `fat` (numeric)
      - `meal_type` (text, nullable)
      - `date` (text) - stored as YYYY-MM-DD format
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `meals` table
    - Add policies for users to manage their own meals
*/

CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbohydrates numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  meal_type text,
  date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own meals"
  ON meals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS meals_user_id_date_idx ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS meals_created_at_idx ON meals(created_at DESC);