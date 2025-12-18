# Chapter 13: API Routes

This chapter covers the Next.js API routes that handle server-side operations like sending emails, file uploads, and operations requiring elevated permissions.

---

## API Routes in Next.js App Router

API routes in the App Router are created using `route.ts` files:

```
app/
└── api/
    └── example/
        └── route.ts    # Handles /api/example
```

Each route exports functions for HTTP methods:

```typescript
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
export async function PUT(request: Request) { ... }
export async function DELETE(request: Request) { ... }
```

---

## Route: Send Invitation Email

Sends invitation emails to collaborators using Resend.

```typescript
// File: app/api/send-invitation/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { to, invitationUrl, permissionLevel, projectId, projectTitle } =
      await request.json()

    // Log for debugging
    console.log('📧 Email API called with:', {
      to,
      invitationUrl,
      permissionLevel,
      projectId,
      projectTitle,
    })

    // Validate required fields
    if (!to || !invitationUrl || !permissionLevel) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build email HTML
    const emailData = {
      from: 'Core Home Render Portal <noreply@renderportal.swftstudios.com>',
      to: [to],
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

              <!-- Permission Level -->
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

    // Send email via Resend
    const result = await resend.emails.send(emailData)

    console.log('✅ Email sent successfully:', result)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
```

### Usage from Client

```typescript
const response = await fetch('/api/send-invitation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    invitationUrl: `${window.location.origin}/project/invite/${token}`,
    permissionLevel: 'edit',
    projectId: projectId,
    projectTitle: 'My Project',
  }),
})

const result = await response.json()
if (result.success) {
  // Email sent successfully
}
```

---

## Route: File Upload

Handles file uploads with validation.

```typescript
// File: app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supaAdmin'

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string || 'project-images'
    const path = formData.get('path') as string || ''

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Storage error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

---

## Route: Notify Collaborators

Sends notifications to project collaborators.

```typescript
// File: app/api/notify-collaborators/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supaAdmin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { projectId, action, actorEmail, details } = await request.json()

    // Validate required fields
    if (!projectId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('title, user_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get collaborators
    const { data: collaborators, error: collabError } = await supabaseAdmin
      .from('project_collaborators')
      .select('user_id')
      .eq('project_id', projectId)

    if (collabError) {
      throw collabError
    }

    // Get owner email
    const { data: owner } = await supabaseAdmin
      .from('auth.users')
      .select('email')
      .eq('id', project.user_id)
      .single()

    // Collect all user IDs (owner + collaborators)
    const userIds = [
      project.user_id,
      ...(collaborators?.map(c => c.user_id) || []),
    ]

    // Get emails for all users
    const { data: users } = await supabaseAdmin
      .rpc('get_user_emails', { user_ids: userIds })

    const emails = users?.map((u: any) => u.email).filter(Boolean) || []

    // Don't notify the actor
    const recipientEmails = emails.filter((email: string) => email !== actorEmail)

    if (recipientEmails.length === 0) {
      return NextResponse.json({ success: true, notified: 0 })
    }

    // Build notification email
    const actionMessages: Record<string, string> = {
      'project_updated': 'has been updated',
      'item_added': 'has a new item',
      'collaborator_added': 'has a new collaborator',
      'due_date_changed': 'due date has been changed',
    }

    const message = actionMessages[action] || 'has been modified'

    // Send notification emails
    await resend.emails.send({
      from: 'Core Home Render Portal <noreply@renderportal.swftstudios.com>',
      to: recipientEmails,
      subject: `Project Update: ${project.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #38bdbb;">Project Update</h2>
          <p>The project <strong>${project.title}</strong> ${message}.</p>
          ${details ? `<p style="color: #666;">${details}</p>` : ''}
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/project/${projectId}" 
               style="background-color: #38bdbb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Project
            </a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      notified: recipientEmails.length,
    })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
```

---

## Route: Request Access

Handles access requests for projects.

```typescript
// File: app/api/request-access/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supaAdmin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { projectId, requesterEmail, requesterName, message } = await request.json()

    if (!projectId || !requesterEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get project and owner
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('title, user_id')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get owner email
    const { data: ownerData } = await supabaseAdmin.auth.admin.getUserById(
      project.user_id
    )

    const ownerEmail = ownerData.user?.email

    if (!ownerEmail) {
      return NextResponse.json(
        { error: 'Could not find project owner' },
        { status: 500 }
      )
    }

    // Send request email to owner
    await resend.emails.send({
      from: 'Core Home Render Portal <noreply@renderportal.swftstudios.com>',
      to: [ownerEmail],
      subject: `Access Request: ${project.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #38bdbb;">Project Access Request</h2>
          
          <p><strong>${requesterName || requesterEmail}</strong> is requesting access to your project:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Project:</strong> ${project.title}</p>
            <p style="margin: 8px 0 0;"><strong>Requester:</strong> ${requesterEmail}</p>
          </div>
          
          ${message ? `
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 10px; border-left: 3px solid #38bdbb;">
            ${message}
          </p>
          ` : ''}
          
          <p style="margin-top: 20px;">
            To grant access, open the project and invite this user from the collaboration panel.
          </p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/project/${projectId}" 
             style="display: inline-block; background-color: #38bdbb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">
            Open Project
          </a>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Request access error:', error)
    return NextResponse.json(
      { error: 'Failed to send request' },
      { status: 500 }
    )
  }
}
```

---

## API Error Handling Pattern

Standard error handling for API routes:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json()
    
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      )
    }

    // Perform operation
    const result = await someOperation(body)

    // Return success
    return NextResponse.json({ success: true, data: result })
    
  } catch (error) {
    // Log for debugging
    console.error('API Error:', error)
    
    // Return error response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    )
  }
}
```

---

## Chapter Summary

API routes handle server-side operations:

1. **send-invitation** - Email invitations via Resend
2. **upload** - File uploads with validation
3. **notify-collaborators** - Project update notifications
4. **request-access** - Access request handling

Key patterns:
- Always validate input before processing
- Use admin client for elevated operations
- Log errors for debugging
- Return appropriate HTTP status codes
- Handle edge cases gracefully

---

*Next: [Chapter 14: Context Providers](./chapter-14-context-providers.md) - Global state management*
