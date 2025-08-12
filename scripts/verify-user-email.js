const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyUserEmail() {
  try {
    console.log('🔍 Verifying user email for collaborator...\n')

    const collaboratorUserId = 'edcfb17b-5806-4f69-adc5-30a3e9c35981' // From the previous check
    
    console.log('📋 Collaborator User ID:', collaboratorUserId)
    
    // Try to get user details using the admin client
    console.log('\n📊 Checking user details...')
    
    // Use a direct SQL query to get user email
    const { data: userData, error: userError } = await supabase
      .rpc('get_user_email', { user_id: collaboratorUserId })
    
    if (userError) {
      console.log('❌ Could not get user email via RPC, trying alternative method...')
      
      // Alternative: Check if we can query the auth.users table directly
      const { data: authData, error: authError } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', collaboratorUserId)
        .single()
      
      if (authError) {
        console.log('❌ Could not access auth.users table:', authError.message)
        console.log('\n📋 Manual verification needed:')
        console.log('Please check in your Supabase Dashboard > Authentication > Users')
        console.log('Look for user ID:', collaboratorUserId)
        console.log('And verify if the email is test@test.com')
      } else {
        console.log('✅ User email found:', authData.email)
        if (authData.email === 'test@test.com') {
          console.log('✅ MATCH: The collaborator is test@test.com')
        } else {
          console.log('❌ MISMATCH: The collaborator is not test@test.com')
          console.log('Actual email:', authData.email)
        }
      }
    } else {
      console.log('✅ User email found:', userData)
      if (userData === 'test@test.com') {
        console.log('✅ MATCH: The collaborator is test@test.com')
      } else {
        console.log('❌ MISMATCH: The collaborator is not test@test.com')
        console.log('Actual email:', userData)
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

verifyUserEmail()
