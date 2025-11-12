// services/sendEmail.js
const { Resend } = require('resend');

const FROM = process.env.MAIL_FROM || 'no-reply@playedit.games';
const API_KEY = process.env.RESEND_API_KEY;

async function sendEmail({ to, subject, text, html }) {
  const toStr = Array.isArray(to) ? to.filter(Boolean).map(String) : [String(to || '')];
  const toClean = toStr.map(s => s.trim()).filter(Boolean);

  if (!toClean.length) {
    console.error('sendEmail(): missing or empty "to"', { rawTo: to });
    throw new Error('Email "to" is required');
  }
  if (!subject) {
    console.error('sendEmail(): missing "subject"');
    throw new Error('Email "subject" is required');
  }

  if (!API_KEY) {
    console.log('⚠️ [DEV MODE] RESEND_API_KEY missing — not sending email.');
    console.log(`From: ${FROM}\nTo: ${toClean.join(', ')}\nSubject: ${subject}\n\n${text || html || ''}`);
    return;
  }

  try {
    const resend = new Resend(API_KEY);
    const result = await resend.emails.send({
      from: FROM,
      to: toClean, // always an array of trimmed strings
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {})
    });
    console.log(`✅ Email sent to ${toClean.join(', ')}`);
    return result;
  } catch (err) {
    console.error('Resend error:', {
      statusCode: err?.statusCode,
      name: err?.name,
      message: err?.message,
      details: err?.response?.data
    });
    throw new Error('Email send failed.');
  }
}

module.exports = { sendEmail };
