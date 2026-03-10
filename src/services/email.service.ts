import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification email
 */
export async function sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string
) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    try {
        await resend.emails.send({
            from: 'Portfolio Platform <onboarding@resend.dev>', // Change this later with your domain
            to: email,
            subject: 'Verify your email - Portfolio Platform',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #0a0a0f;
                color: #ffffff;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background: linear-gradient(135deg, #1a1a24 0%, #12121a 100%);
                border-radius: 16px;
                padding: 40px;
                border: 1px solid rgba(0, 240, 255, 0.2);
              }
              h1 {
                color: #00f0ff;
                font-size: 28px;
                margin-bottom: 20px;
              }
              p {
                color: #a0a0b8;
                line-height: 1.6;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #00f0ff 0%, #7b2ff7 100%);
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to Portfolio Platform! 🎉</h1>
              <p>Hi ${name},</p>
              <p>Thanks for signing up! Please verify your email address to get started building amazing portfolios.</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #00f0ff; word-break: break-all;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <div class="footer">
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <p>© 2024 Portfolio Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }
}