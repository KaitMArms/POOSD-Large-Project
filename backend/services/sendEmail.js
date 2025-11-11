const { Resend } = require('resend');

const FROM = process.env.MAIL_FROM;
const API_KEY = process.env.RESEND_API_KEY;

async function sendEmail({ to, subject, text, html }) {
  if (!API_KEY) {
    console.log('⚠️ [DEV MODE] Resend API key missing — email not actually sent.');
    console.log(`To: ${to}\nSubject: ${subject}\n${text}`);
    return; // Skip real send
  }

  const resend = new Resend(API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to, subject, text, html });
  if (error) {
    console.error('Resend error:', error);
    throw new Error('Email send failed.');
  }
  console.log(`✅ Email sent to ${to}`);
}

module.exports = { sendEmail };
