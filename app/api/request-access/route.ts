import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend('re_CzgaWp7P_3BwTmwjaMXCzZ4T6xuQwPsEK')

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectTitle, projectOwnerId, requesterEmail, action } =
      await request.json()

    console.log('📧 Access request API called with:', {
      projectId,
      projectTitle,
      projectOwnerId,
      requesterEmail,
      action,
    })

    if (!projectId || !projectTitle || !projectOwnerId || !requesterEmail) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get project owner's email
    let ownerEmail = requesterEmail // fallback

    if (supabase) {
      try {
        // Try to get email from auth.users (requires service role)
        const { data: ownerAuthData, error: authError } = await supabase.auth.admin.getUserById(
          projectOwnerId
        )

        if (!authError && ownerAuthData?.user?.email) {
          ownerEmail = ownerAuthData.user.email
        } else {
          // Fallback: try to get from user_profiles or project_collaborators_with_users
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('user_id', projectOwnerId)
            .single()

          // If that doesn't work, try the RPC function or view
          if (!profileData) {
            // Try RPC function first
            const { data: rpcData } = await supabase.rpc(
              'get_project_collaborators_with_users',
              { p_project_id: projectId }
            )

            if (rpcData) {
              const ownerData = rpcData.find((c: any) => c.user_id === projectOwnerId)
              if (ownerData?.user_email) {
                ownerEmail = ownerData.user_email
              }
            } else {
              // Fallback to view (may fail with 406, that's okay - silently handle)
              try {
                const { data: collaboratorData } = await supabase
                  .from('project_collaborators_with_users')
                  .select('user_email')
                  .eq('project_id', projectId)
                  .eq('user_id', projectOwnerId)
                  .single()

                if (collaboratorData?.user_email) {
                  ownerEmail = collaboratorData.user_email
                }
              } catch (e) {
                // 406 error is expected - view can't access auth.users
                // Silently continue
              }
            }
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch owner email, using fallback:', err)
      }
    }

    // Get requester's name if available
    let requesterName = requesterEmail
    if (supabase && requesterEmail) {
      try {
        const { data } = await supabase.auth.admin.listUsers()
        const requesterUser = data?.users?.find((u) => u.email === requesterEmail)
        if (requesterUser?.user_metadata?.full_name) {
          requesterName = requesterUser.user_metadata.full_name
        } else if (requesterUser?.user_metadata?.display_name) {
          requesterName = requesterUser.user_metadata.display_name
        }
      } catch (err) {
        // Ignore errors, just use email
      }
    }

    // Send email to project owner/admin
    const emailData = {
      from: 'Core Home Render Portal <noreply@renderportal.swftstudios.com>',
      to: [ownerEmail],
      subject: `Access Request: ${projectTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #070e0e; font-family: 'Inter', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #38bdbb; font-size: 32px; margin: 0 0 8px 0; font-weight: 700;">
                Core Home
              </h1>
              <div style="height: 4px; background: linear-gradient(to right, #38bdbb, #f9903c); border-radius: 2px; max-width: 200px; margin: 0 auto 8px auto;"></div>
              <p style="color: #ffffff; font-size: 18px; margin: 0;">Render Portal</p>
            </div>

            <!-- Main Card -->
            <div style="background-color: #1a1e1f; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
              <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">
                🔐 Access Request
              </h2>
              <p style="color: #595d60; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                <strong style="color: #ffffff;">${requesterName}</strong> (${requesterEmail}) is requesting editor access to your project:
              </p>

              <!-- Project Details -->
              <div style="background-color: #0d1117; border: 1px solid #374151; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                  <span style="color: #595d60; font-size: 14px;">Project:</span>
                  <span style="color: #ffffff; font-size: 16px; margin-left: 8px; font-weight: 600;">${projectTitle}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="color: #595d60; font-size: 14px;">Requested Action:</span>
                  <span style="color: #ffffff; font-size: 14px; margin-left: 8px;">${action || 'Make changes to the project'}</span>
                </div>
                <div style="font-size: 13px; color: #595d60;">
                  Current permission: <strong style="color: #f9903c;">View Only</strong>
                </div>
              </div>

              <!-- Info Box -->
              <div style="background-color: #f9903c/20; border: 1px solid #f9903c/30; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #f9903c; font-size: 14px; margin: 0; font-weight: 600; margin-bottom: 8px;">
                  📋 What to do:
                </p>
                <ol style="color: #595d60; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Log in to the Render Portal</li>
                  <li>Go to the project: <strong style="color: #ffffff;">${projectTitle}</strong></li>
                  <li>Open the Collaborators section</li>
                  <li>Find <strong style="color: #ffffff;">${requesterName}</strong> in the list</li>
                  <li>Change their permission level from "View Only" to "Can Edit" or "Admin"</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://renderportal.swftstudios.com'}/project/${projectId}" 
                   style="background-color: #38bdbb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Manage Project →
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center;">
              <p style="color: #595d60; font-size: 12px; margin: 0;">
                Core Home Render Portal • Professional 3D Rendering Workflow
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    console.log('📤 Sending access request email with data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
    })

    // Send the email using Resend
    const result = await resend.emails.send(emailData)

    console.log('✅ Access request email sent successfully:', result)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ Error sending access request email:', error)
    return NextResponse.json(
      { error: 'Failed to send access request' },
      { status: 500 }
    )
  }
}

