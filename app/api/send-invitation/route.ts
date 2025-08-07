import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend('re_E86Xgpvv_4dn42ZbgbF2M9Hs3H2Y2Y6J9')

export async function POST(request: NextRequest) {
  try {
    const { to, invitationUrl, permissionLevel, projectId } = await request.json()

    if (!to || !invitationUrl || !permissionLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email with invitation link
    const emailData = {
      from: 'noreply@core-render-portal.com', // You can change this to your verified domain
      to: [to],
      subject: 'Project Collaboration Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Project Collaboration Invitation</h2>
          <p>You have been invited to collaborate on a project with <strong>${permissionLevel}</strong> permissions.</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${invitationUrl}">${invitationUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This invitation will expire in 7 days.
          </p>
        </div>
      `
    }

    // Send the email using Resend
    const result = await resend.emails.send(emailData)
    
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 