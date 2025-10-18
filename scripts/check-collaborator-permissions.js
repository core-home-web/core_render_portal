const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCollaboratorPermissions() {
  try {
    console.log('🔍 Checking collaborator permissions...\n')

    const projectId = '9678a1a5-86f5-46ea-b371-d4523e749130' // From your logs

    console.log('📋 Project ID:', projectId)

    // Check project details
    console.log('\n📊 Project Details:')
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('❌ Error fetching project:', projectError)
    } else {
      console.log('✅ Project found:', {
        id: projectData.id,
        title: projectData.title,
        user_id: projectData.user_id,
        created_at: projectData.created_at,
      })
    }

    // Check collaborators
    console.log('\n👥 Collaborators:')
    const { data: collaboratorsData, error: collaboratorsError } =
      await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', projectId)

    if (collaboratorsError) {
      console.error('❌ Error fetching collaborators:', collaboratorsError)
    } else {
      console.log('✅ Collaborators found:', collaboratorsData?.length || 0)
      collaboratorsData?.forEach((collab, index) => {
        console.log(`  ${index + 1}. User ID: ${collab.user_id}`)
        console.log(`     Permission: ${collab.permission_level}`)
        console.log(`     Joined: ${collab.joined_at}`)
        console.log(`     Invited by: ${collab.invited_by}`)
        console.log('')
      })
    }

    // Check if there's a collaborator with admin permission
    const adminCollaborator = collaboratorsData?.find(
      (c) => c.permission_level === 'admin'
    )
    if (adminCollaborator) {
      console.log(
        '✅ Found admin collaborator with user ID:',
        adminCollaborator.user_id
      )
    } else {
      console.log('❌ No admin collaborators found')
    }

    // Check if there are any collaborators with edit permission
    const editCollaborators = collaboratorsData?.filter(
      (c) => c.permission_level === 'edit'
    )
    if (editCollaborators && editCollaborators.length > 0) {
      console.log('✅ Found edit collaborators:', editCollaborators.length)
      editCollaborators.forEach((collab) => {
        console.log(`  - User ID: ${collab.user_id}`)
      })
    } else {
      console.log('❌ No edit collaborators found')
    }

    // Check if there are any collaborators with view permission
    const viewCollaborators = collaboratorsData?.filter(
      (c) => c.permission_level === 'view'
    )
    if (viewCollaborators && viewCollaborators.length > 0) {
      console.log('✅ Found view collaborators:', viewCollaborators.length)
      viewCollaborators.forEach((collab) => {
        console.log(`  - User ID: ${collab.user_id}`)
      })
    } else {
      console.log('❌ No view collaborators found')
    }
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkCollaboratorPermissions()
