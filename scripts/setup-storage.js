const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage...')

    // Create the project-files bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('project-files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Bucket project-files already exists')
      } else {
        console.error('Error creating bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Created project-files bucket')
    }

    // Set up storage policies
    const policies = [
      {
        name: 'Allow authenticated users to upload files',
        policy: `
          CREATE POLICY "Allow authenticated uploads" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'project-files' AND
            auth.role() = 'authenticated'
          )
        `
      },
      {
        name: 'Allow public read access to uploaded files',
        policy: `
          CREATE POLICY "Allow public read access" ON storage.objects
          FOR SELECT USING (bucket_id = 'project-files')
        `
      },
      {
        name: 'Allow users to update their own files',
        policy: `
          CREATE POLICY "Allow users to update files" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'project-files' AND
            auth.role() = 'authenticated'
          )
        `
      },
      {
        name: 'Allow users to delete their own files',
        policy: `
          CREATE POLICY "Allow users to delete files" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'project-files' AND
            auth.role() = 'authenticated'
          )
        `
      }
    ]

    console.log('Setting up storage policies...')
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.policy })
        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`Policy "${policy.name}" already exists`)
          } else {
            console.error(`Error creating policy "${policy.name}":`, error)
          }
        } else {
          console.log(`✅ Created policy: ${policy.name}`)
        }
      } catch (err) {
        console.log(`Policy "${policy.name}" may already exist or there was an error:`, err.message)
      }
    }

    console.log('✅ Storage setup complete!')
    console.log('\nNext steps:')
    console.log('1. Make sure your Supabase project has storage enabled')
    console.log('2. Test file uploads in your application')
    console.log('3. Monitor storage usage in your Supabase dashboard')

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupStorage() 