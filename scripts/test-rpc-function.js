const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRPCFunction() {
  try {
    console.log('🧪 Testing RPC function availability...\n')

    // Test if the function exists by trying to call it with minimal parameters
    console.log('📞 Testing update_user_project function...')

    const { data, error } = await supabase.rpc('update_user_project', {
      p_project_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_title: 'Test Title',
      p_retailer: 'Test Retailer',
      p_items: [],
    })

    console.log('📊 Response:', { data, error })

    if (error) {
      console.log('❌ Function call failed:', error.message)
      console.log('📋 This could mean:')
      console.log("1. The function doesn't exist in the database")
      console.log('2. The function parameters are incorrect')
      console.log("3. There's an authentication issue")

      // Test if we can call any RPC function
      console.log('\n🧪 Testing if any RPC functions work...')
      const { data: testData, error: testError } =
        await supabase.rpc('get_user_projects')
      console.log('📊 get_user_projects test:', {
        data: testData,
        error: testError,
      })
    } else {
      console.log('✅ Function exists and can be called!')
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testRPCFunction()
