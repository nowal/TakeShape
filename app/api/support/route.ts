import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORT_EMAIL = 'quintin@takeshapehome.com';
const EMAIL_FROM_FALLBACK = 'takeshapehome@gmail.com';
const CATEGORIES = new Set([
  'App issue',
  'Account or sign-in',
  'Billing',
  'Feature question',
  'Other',
]);

const normalize = (value: unknown, maxLength: number) =>
  String(value || '').trim().slice(0, maxLength);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const resolveTransport = () => {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const secureRaw = process.env.SMTP_SECURE?.trim();

  if (host && user && pass) {
    const port = Number(portRaw || '587');
    return nodemailer.createTransport({
      host,
      port,
      secure: secureRaw === 'true' || port === 465,
      auth: { user, pass },
    });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailAppPassword) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailAppPassword },
    });
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = normalize(body.name, 120);
    const email = normalize(body.email, 254);
    const phone = normalize(body.phone, 40);
    const requestedCategory = normalize(body.category, 80);
    const category = CATEGORIES.has(requestedCategory)
      ? requestedCategory
      : 'Other';
    const message = normalize(body.message, 5000);
    const website = normalize(body.website, 200);

    // Quietly accept bot submissions that fill the hidden honeypot field.
    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const transport = resolveTransport();
    if (!transport) {
      console.error('Support email transport is not configured.');
      return NextResponse.json(
        { ok: false, error: 'Support is temporarily unavailable. Please call 615-987-9575.' },
        { status: 503 }
      );
    }

    const emailFrom =
      normalize(process.env.EMAIL_FROM, 254) ||
      normalize(process.env.SMTP_USER, 254) ||
      normalize(process.env.GMAIL_USER, 254) ||
      EMAIL_FROM_FALLBACK;

    const subject = '[TakeShape Support] ' + category;
    const text = [
      'New TakeShape support request',
      '',
      'Name: ' + name,
      'Email: ' + email,
      'Phone: ' + (phone || 'Not provided'),
      'Issue type: ' + category,
      '',
      'Message:',
      message,
    ].join('\n');

    const html = [
      '<div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">',
      '<h2>New TakeShape support request</h2>',
      '<p><strong>Name:</strong> ' + escapeHtml(name) + '</p>',
      '<p><strong>Email:</strong> ' + escapeHtml(email) + '</p>',
      '<p><strong>Phone:</strong> ' + escapeHtml(phone || 'Not provided') + '</p>',
      '<p><strong>Issue type:</strong> ' + escapeHtml(category) + '</p>',
      '<h3>Message</h3>',
      '<p style="white-space:pre-wrap">' + escapeHtml(message) + '</p>',
      '</div>',
    ].join('');

    await transport.sendMail({
      from: emailFrom,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending support request:', error);
    return NextResponse.json(
      { ok: false, error: 'Unable to send your request. Please try again or call 615-987-9575.' },
      { status: 500 }
    );
  }
}
