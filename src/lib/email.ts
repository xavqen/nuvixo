import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  await transporter.sendMail({
    from: `"Nuvixo" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
}

export function getVerificationEmailHtml(name: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Verify your email</title></head>
    <body style="font-family: Inter, Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #3b82f6, #7c3aed); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Nuvixo</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Premium NCERT Notes Platform</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Verify your email address</h2>
          <p style="color: #64748b; margin: 0 0 24px;">Hi ${name},<br/>Thanks for signing up! Please verify your email to activate your account.</p>
          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email</a>
          <p style="color: #94a3b8; font-size: 14px; margin: 24px 0 0;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Reset your password</title></head>
    <body style="font-family: Inter, Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #3b82f6, #7c3aed); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Nuvixo</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Reset your password</h2>
          <p style="color: #64748b; margin: 0 0 24px;">Hi ${name},<br/>We received a request to reset your password.</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
          <p style="color: #94a3b8; font-size: 14px; margin: 24px 0 0;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPurchaseConfirmationHtml(
  name: string,
  notes: { title: string }[],
  amount: number,
  invoiceId: string
): string {
  const notesList = notes.map((n) => `<li style="color: #334155; padding: 6px 0;">${n.title}</li>`).join("");
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Purchase Confirmed</title></head>
    <body style="font-family: Inter, Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #3b82f6, #7c3aed); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Nuvixo</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 18px;">Payment Confirmed ✓</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin: 0 0 8px;">Thank you, ${name}!</h2>
          <p style="color: #64748b; margin: 0 0 24px;">Your purchase was successful. Here's what you bought:</p>
          <ul style="padding: 0 0 0 20px; margin: 0 0 24px;">${notesList}</ul>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #475569;">Invoice: <strong>#${invoiceId}</strong></p>
            <p style="margin: 4px 0 0; color: #475569;">Amount Paid: <strong>₹${amount}</strong></p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/dashboard/notes" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Reading</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
