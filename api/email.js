import sgMail from '@sendgrid/mail';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
if(!SENDGRID_KEY){
  throw new Error('SENDGRID_API_KEY env var required');
}
sgMail.setApiKey(SENDGRID_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL;

export async function sendClaimEmail({ to, text, zipBuffer }) {
  const msg = {
    to,
    from: FROM_EMAIL,
    subject: 'SLA Credit Request Package',
    text,
    attachments: [
      {
        content: zipBuffer.toString('base64'),
        filename: 'claim.zip',
        type: 'application/zip',
        disposition: 'attachment'
      }
    ]
  };
  await sgMail.send(msg);
} 