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

async function setupUpdateFunction() {
  try {
    console.log('🚀 Setting up project update function with access control...\n')

    // SQL function for updating projects with access control
    const updateFunctionSQL = `
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
BEGIN
  -- Check if user has access to this project and get their permission level
  SELECT 
    CASE 
      WHEN p.user_id = auth.uid() THEN 'admin'
      ELSE pc.permission_level
    END as permission_level,
    CASE 
      WHEN p.user_id = auth.uid() THEN true
      ELSE false
    END as is_owner
  INTO v_permission_level, v_is_owner
  FROM projects p
  LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = auth.uid()
  WHERE p.id = p_project_id AND (
    p.user_id = auth.uid() OR 
    (pc.user_id = auth.uid() AND pc.permission_level IN ('edit', 'admin'))
  );

  -- If no access found, raise exception
  IF v_permission_level IS NULL THEN
    RAISE EXCEPTION 'Access denied: Project not found or insufficient permissions';
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

    console.log('📝 Creating update_user_project function...')
    const { error } = await supabase.rpc('exec_sql', { sql: updateFunctionSQL })

    if (error) {
      console.error('❌ Error creating function:', error.message)
      console.log('\n📋 Manual Setup Required:')
      console.log('Please run the following SQL in your Supabase SQL Editor:')
      console.log('\n' + updateFunctionSQL)
      return
    }

    console.log('✅ Successfully created update_user_project function')
    console.log('\n🎉 Setup complete!')
    console.log('\n📋 The function now provides:')
    console.log('1. ✅ Access control for project updates')
    console.log('2. ✅ Support for collaborators with edit/admin permissions')
    console.log('3. ✅ Proper error handling for unauthorized access')
    console.log('4. ✅ Automatic timestamp updates')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n📋 Manual Setup Required:')
    console.log('Please run the SQL function manually in your Supabase SQL Editor.')
  }
}

setupUpdateFunction()
