const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugPermissionIssue() {
  try {
    console.log('🔧 Debugging permission issue...\n')

    const projectId = '9678a1a5-86f5-46ea-b371-d4523e749130'
    const collaboratorUserId = 'edcfb17b-5806-4f69-adc5-30a3e9c35981'
    
    console.log('📋 Project ID:', projectId)
    console.log('📋 Collaborator User ID:', collaboratorUserId)
    
    console.log('\n🔍 Current situation:')
    console.log('1. ✅ Project exists and has 1 collaborator')
    console.log('2. ✅ Collaborator has admin permissions')
    console.log('3. ❓ Need to verify if collaborator is test@test.com')
    
    console.log('\n📋 Manual verification steps:')
    console.log('1. Go to Supabase Dashboard > Authentication > Users')
    console.log('2. Find user with ID:', collaboratorUserId)
    console.log('3. Check if the email is test@test.com')
    
    console.log('\n🔧 If the collaborator is NOT test@test.com:')
    console.log('1. Find the correct user ID for test@test.com')
    console.log('2. Update the collaborator record with the correct user ID')
    console.log('3. Or add test@test.com as a new collaborator')
    
    console.log('\n🔧 If the collaborator IS test@test.com:')
    console.log('1. The issue might be a session mismatch')
    console.log('2. Try logging out and back in as test@test.com')
    console.log('3. Clear browser cache and cookies')
    
    console.log('\n📝 SQL to check current collaborators:')
    console.log(`SELECT * FROM project_collaborators WHERE project_id = '${projectId}';`)
    
    console.log('\n📝 SQL to add test@test.com as admin (if needed):')
    console.log(`-- First, get the user ID for test@test.com from auth.users`)
    console.log(`-- Then run this (replace USER_ID with actual user ID):`)
    console.log(`INSERT INTO project_collaborators (project_id, user_id, permission_level, invited_by)`)
    console.log(`VALUES ('${projectId}', 'USER_ID', 'admin', '3d4acbc5-df26-4439-b77a-8b064f98a470');`)
    
    console.log('\n📝 SQL to update existing collaborator permission:')
    console.log(`UPDATE project_collaborators`)
    console.log(`SET permission_level = 'admin'`)
    console.log(`WHERE project_id = '${projectId}' AND user_id = 'USER_ID';`)

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

debugPermissionIssue()
