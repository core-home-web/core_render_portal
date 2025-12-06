import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(
  process.env.RESEND_API_KEY || 're_CzgaWp7P_3BwTmwjaMXCzZ4T6xuQwPsEK'
)

interface NotifyCollaboratorsData {
  projectId: string
  projectTitle: string
  action: string
  details: string
  changedBy: string
  changedByEmail: string
}

export async function POST(request: NextRequest) {
  try {
    const {
      projectId,
      projectTitle,
      action,
      details,
      changedBy,
      changedByEmail,
    }: NotifyCollaboratorsData = await request.json()

    // Validate required fields
    if (
      !projectId ||
      !projectTitle ||
      !action ||
      !changedBy ||
      !changedByEmail
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get project collaborators (excluding the person who made the change)
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Try RPC function first (more reliable)
    let collaborators: any[] = []
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_project_collaborators_with_users',
      { p_project_id: projectId }
    )

    if (!rpcError && rpcData) {
      collaborators = rpcData.filter((c: any) => c.user_email !== changedByEmail)
    } else {
      // Fallback to view (may fail with 406, that's okay)
      const { data: viewData, error: viewError } = await supabase
        .from('project_collaborators_with_users')
        .select('user_email, user_full_name')
        .eq('project_id', projectId)
        .neq('user_email', changedByEmail)

      if (viewError && viewError.code !== '406') {
        console.error('Error fetching collaborators:', viewError)
        return NextResponse.json(
          { error: 'Failed to fetch collaborators' },
          { status: 500 }
        )
      }

      if (viewData) {
        collaborators = viewData
      }
    }

    if (!collaborators || collaborators.length === 0) {
      return NextResponse.json(
        { message: 'No collaborators to notify' },
        { status: 200 }
      )
    }

    // Send email to each collaborator
    const emailPromises = collaborators.map(async (collaborator) => {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0; font-size: 24px;">📢 Project Update Notification</h1>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Project:</strong> ${projectTitle}
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <p style="color: #555; font-size: 16px; margin: 10px 0;">
                <strong>Action:</strong> ${action}
              </p>
              <p style="color: #555; font-size: 16px; margin: 10px 0;">
                <strong>Details:</strong> ${details}
              </p>
              <p style="color: #555; font-size: 16px; margin: 10px 0;">
                <strong>Changed by:</strong> ${changedBy} (${changedByEmail})
              </p>
              <p style="color: #555; font-size: 16px; margin: 10px 0;">
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block;
                        font-size: 16px;
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                🔍 View Project
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                📧 This is an automated notification from Core Render Portal
              </p>
            </div>
          </div>
        </div>
      `

      try {
        await resend.emails.send({
          from: 'Core Render Portal <noreply@renderportal.swftstudios.com>',
          to: [collaborator.user_email],
          subject: `Project Update: ${projectTitle}`,
          html: emailHtml,
        })
        console.log(`✅ Notification sent to ${collaborator.user_email}`)
        return { success: true, email: collaborator.user_email }
      } catch (emailError) {
        console.error(
          `❌ Failed to send email to ${collaborator.user_email}:`,
          emailError
        )
        return {
          success: false,
          email: collaborator.user_email,
          error: emailError,
        }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    return NextResponse.json({
      message: `Notifications sent to ${successful.length} collaborators`,
      successful: successful.length,
      failed: failed.length,
      details: {
        successful: successful.map((r) => r.email),
        failed: failed.map((r) => ({ email: r.email, error: r.error })),
      },
    })
  } catch (error) {
    console.error('Error in notify-collaborators:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
