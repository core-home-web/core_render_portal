const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUpload() {
  try {
    console.log('🧪 Testing Supabase storage upload...\n')

    // Test 1: Check bucket exists and is accessible
    console.log('1. Checking bucket access...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }

    const projectFilesBucket = buckets.find(b => b.name === 'project-files')
    if (!projectFilesBucket) {
      console.error('❌ project-files bucket not found!')
      console.log('Available buckets:', buckets.map(b => b.name))
      return
    }

    console.log('✅ project-files bucket found:')
    console.log('   - Public:', projectFilesBucket.public)
    console.log('   - File size limit:', projectFilesBucket.file_size_limit)
    console.log('   - Allowed MIME types:', projectFilesBucket.allowed_mime_types)

    // Test 2: Try to list files in bucket (check permissions)
    console.log('\n2. Testing bucket permissions...')
    const { data: files, error: listError } = await supabase.storage
      .from('project-files')
      .list('uploads', { limit: 1 })

    if (listError) {
      console.error('❌ Error listing files:', listError.message)
    } else {
      console.log('✅ Can list files in bucket')
    }

    // Test 3: Create a small test file and try to upload
    console.log('\n3. Testing file upload...')
    const testContent = 'Hello, this is a test file for upload verification.'
    const testFileName = `test-${Date.now()}.txt`
    const testPath = `uploads/${testFileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message)
      console.error('Error details:', uploadError)
    } else {
      console.log('✅ Upload test successful!')
      console.log('   - Path:', uploadData.path)
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('project-files')
        .remove([testPath])
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test file:', deleteError.message)
      } else {
        console.log('✅ Test file cleaned up')
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testUpload()
