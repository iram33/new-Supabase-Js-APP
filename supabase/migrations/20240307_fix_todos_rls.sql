-- Fix RLS policy for todos table
-- Allow anonymous users to perform all operations on todos table

-- Add this to the TOP of your migration file
CREATE TABLE IF NOT EXISTS todos (
  id bigint primary key generated always as identity,
  task text not null,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all operations for todos table" ON todos;

-- Create a simple policy that allows all operations for demo purposes
CREATE POLICY "Enable all operations for todos table" ON todos
    FOR ALL USING (true) WITH CHECK (true);
