-- SQL commands to fix RLS policies for the assets table
-- Run these in your Supabase Dashboard -> SQL Editor

-- 1. First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'assets';

-- 2. Drop existing policies if they're too restrictive (optional)
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assets;
-- DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON assets;

-- 3. Enable RLS on the assets table (if not already enabled)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for assets table

-- Allow authenticated users to insert assets
CREATE POLICY "Allow authenticated users to insert assets" 
ON assets FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to read all assets
CREATE POLICY "Allow authenticated users to read assets" 
ON assets FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to update their own assets
CREATE POLICY "Allow users to update their own assets" 
ON assets FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own assets
CREATE POLICY "Allow users to delete their own assets" 
ON assets FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'assets';