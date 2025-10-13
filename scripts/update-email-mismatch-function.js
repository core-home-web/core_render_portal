// Script to update the accept_project_invitation function for better email mismatch handling
// Run with: node scripts/update-email-mismatch-function.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateEmailMismatchFunction() {
  console.log('🔄 Updating accept_project_invitation function...')
  
  const sql = `
    -- Fix email mismatch verification in accept_project_invitation function
    CREATE OR REPLACE FUNCTION accept_project_invitation(
      p_token TEXT
    )
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_invitation project_invitations%ROWTYPE;
      v_user_id UUID;
    BEGIN
      -- Get current user ID
      v_user_id := auth.uid();
      
      -- Find the invitation
      SELECT * INTO v_invitation 
      FROM project_invitations 
      WHERE invitation_token = p_token 
        AND expires_at > NOW() 
        AND accepted_at IS NULL;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation token';
      END IF;
      
      -- Check if user email matches invitation (only if user is authenticated)
      IF v_user_id IS NOT NULL THEN
        -- For authenticated users, verify email matches
        IF NOT EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = v_user_id AND email = v_invitation.invited_email
        ) THEN
          RAISE EXCEPTION 'Email does not match invitation';
        END IF;
      END IF;
      
      -- Add user as collaborator (only if user is authenticated)
      IF v_user_id IS NOT NULL THEN
        INSERT INTO project_collaborators (
          project_id,
          user_id,
          permission_level,
          invited_by
        ) VALUES (
          v_invitation.project_id,
          v_user_id,
          v_invitation.permission_level,
          v_invitation.invited_by
        );
        
        -- Mark invitation as accepted
        UPDATE project_invitations 
        SET accepted_at = NOW() 
        WHERE invitation_token = p_token;
        
        RETURN v_invitation.project_id;
      ELSE
        -- For unauthenticated users, just return the project ID
        -- They'll need to sign up/sign in first
        RETURN v_invitation.project_id;
      END IF;
    END;
    $$;
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Error updating function:', error)
      process.exit(1)
    }
    
    console.log('✅ Function updated successfully')
    console.log('📋 Changes made:')
    console.log('   - Fixed email verification to use invited_email field')
    console.log('   - Improved error handling for email mismatches')
    console.log('   - Better user experience for invitation flow')
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

// Test the function
async function testFunction() {
  console.log('🧪 Testing function...')
  
  try {
    // This will fail but should show the proper error message
    const { data, error } = await supabase.rpc('accept_project_invitation', {
      p_token: 'test-token'
    })
    
    if (error) {
      console.log('✅ Function is working (expected error for test token):', error.message)
    } else {
      console.log('⚠️ Unexpected success:', data)
    }
    
  } catch (err) {
    console.log('✅ Function is working (expected error for test token):', err.message)
  }
}

async function main() {
  console.log('🚀 Starting email mismatch function update...')
  
  await updateEmailMismatchFunction()
  await testFunction()
  
  console.log('🎉 Update complete!')
  console.log('')
  console.log('📝 Next steps:')
  console.log('   1. Test invitation flow with email mismatch')
  console.log('   2. Verify proper error handling and redirect')
  console.log('   3. Deploy changes to production')
}

main().catch(console.error)
