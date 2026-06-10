import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIREBASE_WEB_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
  'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA';

const verifyFirebasePassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
      FIREBASE_WEB_API_KEY
    )}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
      cache: 'no-store',
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return null;
  }

  return {
    firebaseUid: String(payload?.localId || '').trim() || null,
    email: String(payload?.email || email).trim().toLowerCase(),
  };
};

const findSupabaseUserByEmail = async (email: string) => {
  const perPage = 200;
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;

    const users = data?.users || [];
    const match = users.find(
      (user) =>
        String(user?.email || '').trim().toLowerCase() ===
        email.toLowerCase()
    );
    if (match) return match;

    if (users.length < perPage) {
      break;
    }
  }
  return null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'email and password are required' },
        { status: 400 }
      );
    }

    const firebaseVerified = await verifyFirebasePassword({
      email,
      password,
    });

    if (!firebaseVerified) {
      return NextResponse.json(
        { ok: false, error: 'Invalid login credentials' },
        { status: 401 }
      );
    }

    const user = await findSupabaseUserByEmail(email);

    if (!user?.id) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Supabase user not found for this email. Run user import first.',
        },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabaseServer.auth.admin.updateUserById(
      user.id,
      {
        password,
        email_confirm: true,
      }
    );
    if (updateError) throw updateError;

    if (firebaseVerified.firebaseUid) {
      await supabaseServer
        .from('providers')
        .update({ user_id: user.id })
        .eq('user_id', firebaseVerified.firebaseUid);
    }

    return NextResponse.json({
      ok: true,
      migrated: true,
      userId: user.id,
    });
  } catch (error) {
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
