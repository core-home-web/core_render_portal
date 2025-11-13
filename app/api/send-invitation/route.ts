import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend('re_CzgaWp7P_3BwTmwjaMXCzZ4T6xuQwPsEK')

export async function POST(request: NextRequest) {
  try {
    const { to, invitationUrl, permissionLevel, projectId, projectTitle } =
      await request.json()

    console.log('📧 Email API called with:', {
      to,
      invitationUrl,
      permissionLevel,
      projectId,
      projectTitle,
    })

    if (!to || !invitationUrl || !permissionLevel) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email with invitation link
    const emailData = {
      from: 'Core Home Render Portal <noreply@renderportal.swftstudios.com>',
      to: [to], // Send to actual recipient
      subject: `Project Collaboration Invitation${projectTitle ? ': ' + projectTitle : ''}`,
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
                🎉 You've Been Invited!
              </h2>
              <p style="color: #595d60; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                You've been invited to collaborate on a render project${projectTitle ? ': <strong style="color: #ffffff;">' + projectTitle + '</strong>' : ''}.
              </p>

              <!-- Project Details -->
              <div style="background-color: #0d1117; border: 1px solid #374151; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                  <span style="color: #595d60; font-size: 14px;">Permission Level:</span>
                  <span style="color: #ffffff; font-size: 14px; margin-left: 8px; font-weight: 600; text-transform: capitalize;">${permissionLevel}</span>
                </div>
                <div style="font-size: 13px; color: #595d60;">
                  ${permissionLevel === 'view' ? '• Can view project details and history' : ''}
                  ${permissionLevel === 'edit' ? '• Can view and edit project details' : ''}
                  ${permissionLevel === 'admin' ? '• Can view, edit, and manage collaborators' : ''}
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${invitationUrl}" 
                   style="background-color: #38bdbb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Accept Invitation →
                </a>
              </div>

              <p style="color: #595d60; font-size: 13px; text-align: center; margin: 0;">
                Or copy this link:<br>
                <a href="${invitationUrl}" style="color: #38bdbb; word-break: break-all; font-size: 12px;">${invitationUrl}</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center;">
              <p style="color: #595d60; font-size: 12px; margin: 0 0 8px 0;">
                This invitation will expire in 7 days.
              </p>
              <p style="color: #595d60; font-size: 12px; margin: 0;">
                Core Home Render Portal • Professional 3D Rendering Workflow
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    console.log('📤 Sending email with data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
    })

    // Send the email using Resend
    const result = await resend.emails.send(emailData)

    console.log('✅ Email sent successfully:', result)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
