'use client';

import { FormEvent, useState } from 'react';

const email = 'quintin@takeshapehome.com';
const phone = '615-987-9575';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

export default function SupportPage() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  async function submitSupportRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitState('sending');
    setStatusMessage('');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          category: data.get('category'),
          message: data.get('message'),
          website: data.get('website'),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Unable to send your request.');
      }

      form.reset();
      setSubmitState('success');
      setStatusMessage(
        'Your support request has been sent. We will get back to you as soon as possible.'
      );
    } catch (error) {
      setSubmitState('error');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Unable to send your request. Please try again or call 615-987-9575.'
      );
    }
  }

  const field =
    'mt-2 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-base font-medium text-black outline-none transition focus:border-pink focus:ring-2 focus:ring-pink/20';

  return (
    <main className="w-full bg-white px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] bg-pink p-8 text-white shadow-pink-bottom-08 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
            TakeShape Support
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-5 text-lg font-medium leading-relaxed text-white/90">
            Tell us what is happening and we will help you get back to shaping your space.
          </p>

          <div className="mt-10 space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/70">Email</p>
              <a
                className="mt-1 inline-block text-lg font-bold underline decoration-white/50 underline-offset-4"
                href={'mailto:' + email}
              >
                {email}
              </a>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/70">Phone</p>
              <a
                className="mt-1 inline-block text-lg font-bold underline decoration-white/50 underline-offset-4"
                href="tel:+16159879575"
              >
                {phone}
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black-08 bg-white p-8 shadow-08 sm:p-10">
          <h2 className="text-3xl font-bold text-black">Contact support</h2>
          <p className="mt-2 text-base font-medium text-black-6">
            Complete the form below and click Submit. Your request will be sent directly to our support team.
          </p>

          <form className="mt-8 space-y-5" onSubmit={submitSupportRequest}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-black">
                Name
                <input className={field} name="name" autoComplete="name" required />
              </label>
              <label className="block text-sm font-bold text-black">
                Email
                <input className={field} name="email" type="email" autoComplete="email" required />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-black">
                Phone number (optional)
                <input className={field} name="phone" type="tel" autoComplete="tel" />
              </label>
              <label className="block text-sm font-bold text-black">
                What do you need help with?
                <select className={field} name="category" defaultValue="App issue">
                  <option>App issue</option>
                  <option>Account or sign-in</option>
                  <option>Billing</option>
                  <option>Feature question</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-bold text-black">
              Tell us what happened
              <textarea
                className={field + ' min-h-40 resize-y'}
                name="message"
                placeholder="Include any steps, error messages, or details that may help us understand the issue."
                required
              />
            </label>

            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button
              className="w-full rounded-xl bg-pink px-6 py-4 text-lg font-bold text-white transition hover:bg-pink-1 focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={submitState === 'sending'}
            >
              {submitState === 'sending' ? 'Sending...' : 'Submit'}
            </button>

            {statusMessage && (
              <div
                className={
                  'rounded-xl border px-4 py-3 text-center text-sm font-semibold ' +
                  (submitState === 'success'
                    ? 'border-green-600/30 bg-green-50 text-green-800'
                    : 'border-red/30 bg-red/5 text-red')
                }
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </div>
            )}

            <p className="text-center text-xs font-medium leading-relaxed text-black-6">
              Your information is sent securely to TakeShape support and used to respond to your request.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
