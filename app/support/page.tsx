'use client';

import { FormEvent } from 'react';

const email = 'quintin@takeshapehome.com';
const phone = '615-987-9575';

export default function SupportPage() {
  function submitSupportRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(
      'TakeShape Support: ' + String(data.get('category') || 'App issue')
    );
    const body = encodeURIComponent(
      [
        'Name: ' + String(data.get('name') || ''),
        'Email: ' + String(data.get('email') || ''),
        'Phone: ' + String(data.get('phone') || 'Not provided'),
        'Issue type: ' + String(data.get('category') || 'App issue'),
        '',
        'How can we help?',
        String(data.get('message') || ''),
      ].join('\\n')
    );
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
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
            Complete the form below. Your email app will open with the details ready to send.
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

            <button
              className="w-full rounded-xl bg-pink px-6 py-4 text-lg font-bold text-white transition hover:bg-pink-1 focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2"
              type="submit"
            >
              Prepare support email
            </button>

            <p className="text-center text-xs font-medium leading-relaxed text-black-6">
              The information you enter is only placed into the support email prepared on your device.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
