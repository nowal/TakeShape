'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Lock,
  Mail,
  Phone,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { getCommunicationDashboardPath } from '@/lib/provider-dashboard/links';
import { takeshapeAppSupabaseBrowser } from '@/lib/supabase/takeshape-app-browser';

export type ProviderAuthMode = 'login' | 'signup';

export type ProviderAuthProfile = {
  id: string;
  business_name: string;
  city: string | null;
  email: string | null;
  logo_url: string | null;
  phone: string | null;
  service_types: string[] | null;
  state: string | null;
  zip: string | null;
};

type Props = {
  initialProvider: ProviderAuthProfile | null;
  mode: ProviderAuthMode;
  providerId: string | null;
};

type CompleteAuthResponse = {
  ok?: boolean;
  dashboardPath?: string;
  error?: string;
  providerId?: string;
};

const clean = (value: string | null | undefined) => (value || '').trim();

const getCounterpartPath = (mode: ProviderAuthMode, providerId: string | null) => {
  const path = mode === 'login' ? '/signup' : '/login';
  return providerId ? `${path}?provider=${encodeURIComponent(providerId)}` : path;
};

export const ProviderAuthClient = ({
  initialProvider,
  mode,
  providerId,
}: Props) => {
  const router = useRouter();
  const [email, setEmail] = useState(initialProvider?.email || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(initialProvider?.phone || '');
  const [businessName, setBusinessName] = useState(
    initialProvider?.business_name || ''
  );
  const [zip, setZip] = useState(initialProvider?.zip || '');
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [failedLogo, setFailedLogo] = useState(false);

  const isSignup = mode === 'signup';
  const title = isSignup ? 'Create provider account' : 'Provider login';
  const submitLabel = isSubmitting
    ? isSignup
      ? 'Creating account...'
      : 'Logging in...'
    : isSignup
      ? 'Create account'
      : 'Login';
  const counterpartText = isSignup
    ? 'Already have an account?'
    : 'Need an account?';
  const counterpartAction = isSignup ? 'Login' : 'Create account';
  const market = [initialProvider?.city, initialProvider?.state]
    .map(clean)
    .filter(Boolean)
    .join(', ');
  const requiresBusinessDetails = isSignup && !initialProvider;

  const providerSummary = useMemo(() => {
    if (!initialProvider) return null;

    return {
      market: market || 'Market not set',
      services: initialProvider.service_types?.length
        ? initialProvider.service_types.join(', ')
        : 'Services not set',
    };
  }, [initialProvider, market]);

  const completeProviderAuth = async (accessToken: string) => {
    const response = await fetch('/api/provider-auth/complete', {
      body: JSON.stringify({
        businessName,
        fullName,
        phone,
        providerId,
        zip,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const result = (await response.json()) as CompleteAuthResponse;

    if (!response.ok || !result.ok || !result.dashboardPath) {
      throw new Error(result.error || 'Provider account setup failed.');
    }

    return result.dashboardPath;
  };

  const getCurrentAccessToken = async () => {
    const { data, error } = await takeshapeAppSupabaseBrowser.auth.getSession();
    if (error) throw error;
    return data.session?.access_token || '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (isSignup && !clean(fullName)) {
        throw new Error('Please enter your full name.');
      }
      if (requiresBusinessDetails && !clean(businessName)) {
        throw new Error('Please enter your business name.');
      }

      let accessToken = '';

      if (isSignup) {
        const { data, error } = await takeshapeAppSupabaseBrowser.auth.signUp({
          email,
          password,
          options: {
            data: {
              business_name: clean(businessName),
              full_name: clean(fullName),
              role: 'provider',
            },
          },
        });
        if (error) throw error;
        accessToken = data.session?.access_token || '';
      } else {
        const { data, error } =
          await takeshapeAppSupabaseBrowser.auth.signInWithPassword({
            email,
            password,
          });
        if (error) throw error;
        accessToken = data.session?.access_token || '';
      }

      accessToken = accessToken || (await getCurrentAccessToken());
      if (!accessToken) {
        setMessage(
          'Check your email to confirm the account, then log in to open your dashboard.'
        );
        return;
      }

      const dashboardPath = await completeProviderAuth(accessToken);
      router.replace(dashboardPath);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Provider account setup failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[hsl(var(--app-bg-hsl))] px-4 py-8 text-[#202020] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.72fr)]">
        <section className="rounded-lg border border-black-08 bg-white p-6 shadow-09 sm:p-8">
          <p className="text-sm font-semibold text-pink">Provider portal</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-black-1 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-black-3">
            {isSignup
              ? 'Activate your referral dashboard and use the same provider account for Lidar AI jobs.'
              : 'Open your referral dashboard with your provider account.'}
          </p>

          {initialProvider ? (
            <div className="mt-6 rounded-lg border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/35%)] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-black-08 bg-white p-3">
                  {initialProvider.logo_url && !failedLogo ? (
                    <Image
                      alt={`${initialProvider.business_name} logo`}
                      className="max-h-full max-w-full object-contain"
                      height={96}
                      onError={() => setFailedLogo(true)}
                      src={initialProvider.logo_url}
                      unoptimized
                      width={144}
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-pink" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black-1">
                    {initialProvider.business_name}
                  </h2>
                  {providerSummary ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-black-2">
                      <span className="rounded-md bg-white px-2.5 py-1.5">
                        {providerSummary.market}
                      </span>
                      <span className="rounded-md bg-white px-2.5 py-1.5">
                        {providerSummary.services}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-black-08 bg-white p-5 shadow-09">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {isSignup ? (
              <AuthField
                icon={UserRound}
                label="Full name"
                onChange={setFullName}
                placeholder="Full name"
                required
                value={fullName}
              />
            ) : null}

            {requiresBusinessDetails ? (
              <>
                <AuthField
                  icon={Building2}
                  label="Business name"
                  onChange={setBusinessName}
                  placeholder="Business name"
                  required
                  value={businessName}
                />
                <AuthField
                  label="ZIP"
                  onChange={setZip}
                  placeholder="ZIP"
                  value={zip}
                />
              </>
            ) : null}

            <AuthField
              icon={Mail}
              label="Email"
              onChange={setEmail}
              placeholder="Email address"
              required
              type="email"
              value={email}
            />
            {isSignup ? (
              <AuthField
                icon={Phone}
                label="Phone"
                onChange={setPhone}
                placeholder="Phone"
                type="tel"
                value={phone}
              />
            ) : null}
            <AuthField
              icon={Lock}
              label="Password"
              minLength={6}
              onChange={setPassword}
              placeholder="Password"
              required
              type="password"
              value={password}
            />

            {message ? (
              <div className="rounded-md border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/35%)] px-3 py-2 text-sm font-bold text-black-2">
                {message}
              </div>
            ) : null}

            <button
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[hsl(var(--primary-hsl))] px-4 text-sm font-bold text-white transition hover:bg-pink-1 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {submitLabel}
            </button>
          </form>

          <div className="mt-4 text-center text-sm font-semibold text-black-3">
            {counterpartText}{' '}
            <Link
              className="font-bold text-pink hover:underline"
              href={getCounterpartPath(mode, providerId)}
            >
              {counterpartAction}
            </Link>
          </div>

          {initialProvider ? (
            <div className="mt-3 text-center text-xs font-semibold text-black-3">
              <Link
                className="hover:underline"
                href={getCommunicationDashboardPath(initialProvider.id)}
              >
                Back to dashboard
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
};

const AuthField = ({
  icon: Icon,
  label,
  onChange,
  value,
  ...props
}: {
  icon?: LucideIcon;
  label: string;
  minLength?: number;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase text-black-3">
      {label}
    </span>
    <span className="relative block">
      {Icon ? (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-3" />
      ) : null}
      <input
        className={`h-11 w-full rounded-md border border-black-08 bg-[hsl(var(--app-bg-hsl))] ${
          Icon ? 'pl-10' : 'pl-3'
        } pr-3 text-sm font-semibold text-black-1 placeholder:text-black-3`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
        {...props}
      />
    </span>
  </label>
);
