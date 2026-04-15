import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { getProviderByIdSupabase } from '@/lib/data/supabase/providers';
import {
  getAdminAuth,
  getAdminFirestore,
} from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type EstimateChoice =
  | 'uploadVideo'
  | 'requestLiveVideoEstimate'
  | 'requestInPersonEstimate';

type LiveVideoCallPreference = 'asap' | 'scheduled' | null;

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type NotificationPayload = {
  providerId: string;
  contact: ContactPayload;
  estimateChoice: EstimateChoice;
  liveVideoCallPreference?: LiveVideoCallPreference;
  videoCallSchedule?: {
    date: string;
    time: string;
  } | null;
  videoUrl?: string;
  videoFileName?: string;
};

const EMAIL_FROM_FALLBACK = 'takeshapehome@gmail.com';

const estimateChoiceLabel = (choice: EstimateChoice) => {
  if (choice === 'uploadVideo') return 'Upload Video';
  if (choice === 'requestLiveVideoEstimate') {
    return 'Live Video Call';
  }
  return 'In-Person Estimate';
};

const normalizeText = (value: unknown) =>
  String(value || '').trim();

const buildAppBaseUrl = (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  return (
    process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    `${requestUrl.protocol}//${requestUrl.host}`
  );
};

const resolveTransport = () => {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = String(process.env.SMTP_PASS || '').replace(
    /\s+/g,
    ''
  );
  const secureRaw = process.env.SMTP_SECURE?.trim();

  if (host && user && pass) {
    const port = Number(portRaw || '587');
    const secure =
      secureRaw === 'true' ||
      (Number.isFinite(port) && port === 465);

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailAppPassword) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
  }

  return null;
};

const resolveProviderRecipient = async (providerId: string) => {
  let providerName = '';
  let userId = '';
  let recipientEmail = '';

  const firestore = getAdminFirestore();
  const painterSnap = await firestore
    .collection('painters')
    .doc(providerId)
    .get();

  if (painterSnap.exists) {
    const painterData = painterSnap.data() || {};
    if (!providerName) {
      providerName = normalizeText(painterData.businessName);
    }
    if (!recipientEmail) {
      recipientEmail = normalizeText(painterData.email);
    }
    if (!userId) {
      userId = normalizeText(painterData.userId);
    }
  }

  if (!recipientEmail && userId) {
    try {
      const auth = getAdminAuth();
      const user = await auth.getUser(userId);
      recipientEmail = normalizeText(user.email);
    } catch {
      // no-op
    }
  }

  if (!recipientEmail || !providerName || !userId) {
    try {
      const provider = await getProviderByIdSupabase(providerId);
      if (!providerName) {
        providerName = normalizeText(
          (provider as Record<string, unknown> | null)
            ?.business_name
        );
      }
      if (!userId) {
        userId = normalizeText(
          (provider as Record<string, unknown> | null)?.user_id
        );
      }
      if (!recipientEmail) {
        const supabaseEmail = normalizeText(
          (provider as Record<string, unknown> | null)?.email
        );
        if (supabaseEmail) {
          recipientEmail = supabaseEmail;
        }
      }
    } catch {
      // no-op; Firebase-first path above handles primary source.
    }
  }

  return {
    recipientEmail,
    providerName,
  };
};

const buildCallLink = ({
  appBase,
  contact,
}: {
  appBase: string;
  contact: ContactPayload;
}) => {
  const url = new URL('/call', appBase);
  if (contact.phone) {
    url.searchParams.set('homeownerPhone', contact.phone);
  }
  if (contact.name) {
    url.searchParams.set('homeownerName', contact.name);
  }
  if (contact.email) {
    url.searchParams.set('homeownerEmail', contact.email);
  }
  if (contact.address) {
    url.searchParams.set('homeownerAddress', contact.address);
  }
  return url.toString();
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NotificationPayload;

    const providerId = normalizeText(body.providerId);
    const estimateChoice = body.estimateChoice;
    const contact = {
      name: normalizeText(body.contact?.name),
      email: normalizeText(body.contact?.email),
      phone: normalizeText(body.contact?.phone),
      address: normalizeText(body.contact?.address),
    };

    if (!providerId || !estimateChoice) {
      return NextResponse.json(
        {
          ok: false,
          error: 'providerId and estimateChoice are required',
        },
        { status: 400 }
      );
    }

    if (
      !contact.name ||
      !contact.email ||
      !contact.phone ||
      !contact.address
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'homeowner contact name/email/phone/address are required',
        },
        { status: 400 }
      );
    }

    const transport = resolveTransport();
    if (!transport) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'SMTP not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS (or GMAIL_USER/GMAIL_APP_PASSWORD).',
        },
        { status: 500 }
      );
    }

    const { recipientEmail, providerName } =
      await resolveProviderRecipient(providerId);

    if (!recipientEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Could not resolve provider email for this providerId',
        },
        { status: 404 }
      );
    }

    const appBase = buildAppBaseUrl(request);
    const quoteType = estimateChoiceLabel(estimateChoice);
    const livePreference =
      body.liveVideoCallPreference || null;
    const videoSchedule =
      body.videoCallSchedule && livePreference === 'scheduled'
        ? body.videoCallSchedule
        : null;
    const callLink = buildCallLink({ appBase, contact });
    const videoUrl = normalizeText(body.videoUrl);
    const videoFileName = normalizeText(body.videoFileName);

    const subject = `New homeowner intake request (${quoteType})`;

    const detailLines: string[] = [
      `Provider: ${providerName || providerId}`,
      `Quote Type: ${quoteType}`,
      '',
      'Homeowner Contact',
      `- Name: ${contact.name}`,
      `- Email: ${contact.email}`,
      `- Phone: ${contact.phone}`,
      `- Address: ${contact.address}`,
    ];

    if (estimateChoice === 'uploadVideo') {
      detailLines.push('', 'Upload Details');
      if (videoFileName) {
        detailLines.push(`- File: ${videoFileName}`);
      }
      if (videoUrl) {
        detailLines.push(`- Video Link: ${videoUrl}`);
      } else {
        detailLines.push(
          '- Video Link: unavailable (upload may have failed or been skipped).'
        );
      }
    }

    if (estimateChoice === 'requestLiveVideoEstimate') {
      detailLines.push('', 'Live Video Call Preference');
      if (livePreference === 'asap') {
        detailLines.push('- Option: ASAP');
      } else if (livePreference === 'scheduled' && videoSchedule) {
        detailLines.push('- Option: Next available date/time');
        detailLines.push(`- Date: ${videoSchedule.date}`);
        detailLines.push(`- Time: ${videoSchedule.time}`);
      } else {
        detailLines.push('- Option: Not specified');
      }
      detailLines.push('', 'Start Outgoing Call');
      detailLines.push(
        `- Open this link to load /call with the homeowner details prefilled:`
      );
      detailLines.push(`- ${callLink}`);
    }

    const text = detailLines.join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111111; line-height: 1.5;">
        <h2 style="margin: 0 0 14px;">New homeowner intake request</h2>
        <p style="margin: 0 0 8px;"><strong>Provider:</strong> ${providerName || providerId}</p>
        <p style="margin: 0 0 16px;"><strong>Quote Type:</strong> ${quoteType}</p>

        <h3 style="margin: 0 0 8px;">Homeowner Contact</h3>
        <p style="margin: 0 0 4px;"><strong>Name:</strong> ${contact.name}</p>
        <p style="margin: 0 0 4px;"><strong>Email:</strong> ${contact.email}</p>
        <p style="margin: 0 0 4px;"><strong>Phone:</strong> ${contact.phone}</p>
        <p style="margin: 0 0 16px;"><strong>Address:</strong> ${contact.address}</p>
        ${
          estimateChoice === 'uploadVideo'
            ? `<h3 style="margin: 0 0 8px;">Upload Details</h3>
               ${
                 videoFileName
                   ? `<p style="margin: 0 0 4px;"><strong>File:</strong> ${videoFileName}</p>`
                   : ''
               }
               <p style="margin: 0 0 16px;"><strong>Video Link:</strong> ${
                 videoUrl
                   ? `<a href="${videoUrl}" target="_blank" rel="noopener noreferrer">Open uploaded video</a>`
                   : 'Unavailable (upload may have failed or been skipped).'
               }</p>`
            : ''
        }
        ${
          estimateChoice === 'requestLiveVideoEstimate'
            ? `<h3 style="margin: 0 0 8px;">Live Video Call Preference</h3>
               <p style="margin: 0 0 4px;"><strong>Option:</strong> ${
                 livePreference === 'asap'
                   ? 'ASAP'
                   : livePreference === 'scheduled'
                     ? 'Next available date/time'
                     : 'Not specified'
               }</p>
               ${
                 livePreference === 'scheduled' && videoSchedule
                   ? `<p style="margin: 0 0 4px;"><strong>Date:</strong> ${videoSchedule.date}</p>
                      <p style="margin: 0 0 16px;"><strong>Time:</strong> ${videoSchedule.time}</p>`
                   : '<div style="height: 12px;"></div>'
               }
               <h3 style="margin: 0 0 8px;">Start Outgoing Call</h3>
               <p style="margin: 0 0 0;">
                 <a href="${callLink}" target="_blank" rel="noopener noreferrer">
                   Open Call Page with Homeowner Prefilled
                 </a>
               </p>`
            : ''
        }
      </div>
    `;

    await transport.sendMail({
      from: emailFrom,
      to: recipientEmail,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      ok: true,
      recipientEmail,
    });
  } catch (error) {
    console.error('Error sending embed intake provider notification:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
    const emailFrom =
      normalizeText(process.env.EMAIL_FROM) ||
      normalizeText(process.env.SMTP_USER) ||
      EMAIL_FROM_FALLBACK;
