import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendClaimEmail({ to, text, zipBuffer }) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: 'SLA Credit Request Package',
    text,
    attachments: [
      { filename: 'claim.zip', content: zipBuffer }
    ]
  });
} 