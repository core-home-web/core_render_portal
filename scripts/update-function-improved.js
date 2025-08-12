const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateFunctionImproved() {
  try {
    console.log('🚀 Updating project update function with improved error handling...\n')

    // Improved SQL function for updating projects with access control
    const updateFunctionSQL = `
-- Improved Update Project Access Control
-- This version handles errors more gracefully and provides better debugging

-- Function to update a project with access control
CREATE OR REPLACE FUNCTION update_user_project(
  p_project_id UUID,
  p_title TEXT,
  p_retailer TEXT,
  p_items JSONB
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  items JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_permission_level TEXT;
  v_is_owner BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user has access to this project and get their permission level
  SELECT 
    CASE 
      WHEN p.user_id = v_user_id THEN 'admin'
      ELSE pc.permission_level
    END as permission_level,
    CASE 
      WHEN p.user_id = v_user_id THEN true
      ELSE false
    END as is_owner
  INTO v_permission_level, v_is_owner
  FROM projects p
  LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = v_user_id
  WHERE p.id = p_project_id AND (
    p.user_id = v_user_id OR 
    (pc.user_id = v_user_id AND pc.permission_level IN ('edit', 'admin'))
  );

  -- If no access found, raise exception with more details
  IF v_permission_level IS NULL THEN
    RAISE EXCEPTION 'Access denied: Project % not found or user % has insufficient permissions', p_project_id, v_user_id;
  END IF;

  -- Update the project
  UPDATE projects 
  SET 
    title = p_title,
    retailer = p_retailer,
    items = p_items,
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Return the updated project
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.id = p_project_id;
END;
$$;
    `

    console.log('📝 Updating update_user_project function...')
    
    // Since we can't use exec_sql, we'll provide manual instructions
    console.log('📋 Manual Setup Required:')
    console.log('Please run the following SQL in your Supabase SQL Editor:')
    console.log('\n' + updateFunctionSQL)
    
    console.log('\n✅ Instructions provided!')
    console.log('\n📋 After running the SQL:')
    console.log('1. ✅ The function will have better error handling')
    console.log('2. ✅ More detailed error messages will be shown')
    console.log('3. ✅ Authentication checks will be clearer')
    console.log('4. 🧪 Test the edit functionality again')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n📋 Manual Setup Required:')
    console.log('Please run the SQL function manually in your Supabase SQL Editor.')
  }
}

updateFunctionImproved()
