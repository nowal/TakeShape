import { NextRequest, NextResponse } from 'next/server';

type SessionRequestBody = {
  integrationId?: string;
  userId?: string;
  userEmail?: string | null;
};

const getNangoSecretKey = (): string | null => {
  return (
    process.env.NANGO_SECRET_KEY_DEV ||
    process.env.NANGO_SECRET_KEY ||
    null
  );
};

const getNangoBaseUrl = (): string => {
  return process.env.NANGO_BASE_URL || 'https://api.nango.dev';
};

export async function POST(request: NextRequest) {
  try {
    const secretKey = getNangoSecretKey();
    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            'Missing NANGO secret key. Set NANGO_SECRET_KEY_DEV or NANGO_SECRET_KEY.',
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SessionRequestBody;
    const integrationId = body.integrationId?.trim();
    const userId = body.userId?.trim();

    if (!integrationId) {
      return NextResponse.json(
        { error: 'integrationId is required.' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${getNangoBaseUrl()}/connect/sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          end_user: {
            id: userId,
            email: body.userEmail || undefined,
          },
          allowed_integrations: [integrationId],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to create Nango connect session.',
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error creating Nango connect session.';

    return NextResponse.json(
      {
        error: 'Unexpected error creating Nango connect session.',
        details: message,
      },
      { status: 500 }
    );
  }
}
