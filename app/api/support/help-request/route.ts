import { NextResponse } from "next/server"
import { Resend } from "resend"
import { env } from "@/lib/env"

export async function POST(request: Request) {
  try {
    const { username, email, subject, message } = await request.json()

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required" },
        { status: 400 }
      )
    }

    // Initialize Resend if API key is available
    if (env.RESEND_API_KEY) {
      const resend = new Resend(env.RESEND_API_KEY)

      // Send email to support
      await resend.emails.send({
        from: env.FROM_EMAIL || "noreply@mirro2.com",
        to: "mirrosocial@gmail.com",
        replyTo: email,
        subject: `[Ivory Support] ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">New Help Request</h1>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <div style="margin-bottom: 20px;">
                  <strong style="color: #667eea;">From:</strong> ${username || "Unknown User"}
                </div>
                
                <div style="margin-bottom: 20px;">
                  <strong style="color: #667eea;">Email:</strong> 
                  <a href="mailto:${email}" style="color: #333;">${email}</a>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <strong style="color: #667eea;">Subject:</strong> ${subject}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                  <strong style="color: #667eea; display: block; margin-bottom: 10px;">Message:</strong>
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-size: 15px;">
${message}
                  </div>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                  <a href="mailto:${email}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; font-size: 14px;">
                    Reply to User
                  </a>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      // Send confirmation email to user
      await resend.emails.send({
        from: env.FROM_EMAIL || "noreply@mirro2.com",
        to: email,
        subject: "We received your help request",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">We're Here to Help! 💜</h1>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hi ${username || "there"}! 👋
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Thank you for reaching out to us. We've received your help request and our support team will get back to you within 24-48 hours.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <strong style="color: #667eea; display: block; margin-bottom: 10px;">Your Request:</strong>
                  <div style="margin-bottom: 10px;">
                    <strong>Subject:</strong> ${subject}
                  </div>
                  <div style="white-space: pre-wrap; font-size: 14px; color: #666;">
${message}
                  </div>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  In the meantime, you can also reach us directly at 
                  <a href="mailto:mirrosocial@gmail.com" style="color: #667eea;">mirrosocial@gmail.com</a>
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                  Best regards,<br>
                  The Ivory Support Team
                </p>
              </div>
            </body>
          </html>
        `,
      })
    } else {
      // Fallback: Log to console if Resend is not configured
      console.log("Help Request Received:")
      console.log("From:", username, `(${email})`)
      console.log("Subject:", subject)
      console.log("Message:", message)
      console.warn("Resend API key not configured. Email not sent.")
    }

    return NextResponse.json({
      success: true,
      message: "Help request sent successfully",
    })
  } catch (error) {
    console.error("Error sending help request:", error)
    return NextResponse.json(
      { error: "Failed to send help request" },
      { status: 500 }
    )
  }
}
