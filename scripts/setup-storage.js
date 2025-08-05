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

async function setupStorage() {
  try {
    console.log('🚀 Setting up Supabase storage...\n')

    // Create the project-files bucket
    console.log('📦 Creating project-files bucket...')
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('project-files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket project-files already exists')
      } else {
        console.error('❌ Error creating bucket:', bucketError.message)
        console.log('\n📋 Manual Setup Required:')
        console.log('1. Go to your Supabase Dashboard > Storage')
        console.log('2. Create a bucket named "project-files"')
        console.log('3. Set it as public')
        console.log('4. Set file size limit to 50MB')
        console.log('5. Set allowed MIME types to image/*')
        return
      }
    } else {
      console.log('✅ Created project-files bucket')
    }

    console.log('\n🔐 Setting up storage policies...')
    
    // Note: Policies need to be set up manually in the Supabase Dashboard
    console.log('📋 Manual Policy Setup Required:')
    console.log('\nGo to your Supabase Dashboard > Storage > Policies and add these policies:')
    
    console.log('\n1. Allow authenticated uploads:')
    console.log(`CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' AND
  auth.role() = 'authenticated'
);`)
    
    console.log('\n2. Allow public read access:')
    console.log(`CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'project-files');`)
    
    console.log('\n3. Allow users to update files:')
    console.log(`CREATE POLICY "Allow users to update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-files' AND
  auth.role() = 'authenticated'
);`)
    
    console.log('\n4. Allow users to delete files:')
    console.log(`CREATE POLICY "Allow users to delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' AND
  auth.role() = 'authenticated'
);`)

    console.log('\n✅ Storage setup instructions complete!')
    console.log('\n📋 Next steps:')
    console.log('1. ✅ Create the project-files bucket (if not already done)')
    console.log('2. ⏳ Add the storage policies manually in Supabase Dashboard')
    console.log('3. 🧪 Test file uploads in your application')
    console.log('4. 📊 Monitor storage usage in your Supabase dashboard')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n📋 Manual Setup Required:')
    console.log('Please follow the manual setup instructions above.')
  }
}

setupStorage() 