-- Check the current structure of project_invitations table
-- Run this in your Supabase SQL Editor

-- 1. Check what columns exist in project_invitations
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'project_invitations' 
ORDER BY ordinal_position;

-- 2. Check if the table exists and has data
SELECT COUNT(*) as row_count FROM project_invitations;

-- 3. Show sample data if any exists
SELECT * FROM project_invitations LIMIT 5; 