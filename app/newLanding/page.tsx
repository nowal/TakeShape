'use client';

import { type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Quote,
  Target,
  Trophy,
  Video,
  Zap,
  MapPin,
  Plug,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/auth/provider';

const HERO_IMG =
  'https://media.base44.com/images/public/69c68a58ac34c871608cac79/a9575008e_generated_7e062d3a.png';
const FEATURE_IMG =
  'https://media.base44.com/images/public/69c68a58ac34c871608cac79/ce7641541_generated_89f6d830.png';

const logos = [
  'Joseph Tree',
  'DeVos',
  'Brawner',
  'Sunny Coast',
  'Eden Trees',
  'Woodland',
  'Ryan Amato Painting',
  'Valiant',
  'Wellnitz',
  'Arise',
];

const processSteps = [
  {
    icon: Video,
    title: 'Capture',
    desc: 'Your client films a quick walkthrough of the space on their phone. No app needed, no scheduling back-and-forth.',
  },
  {
    icon: ClipboardCheck,
    title: 'Review',
    desc: 'Watch the video on your own time, understand scope, and build an accurate quote before ever showing up.',
  },
  {
    icon: Trophy,
    title: 'Win',
    desc: "Show up prepared, set clear expectations, and close more jobs because you already know what you're walking into.",
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Get Your Weekends Back',
    points: [
      'Skip the drive-by estimate and let the video do the legwork',
      'Spend your time on booked jobs, not tire-kickers',
      'Automated follow-ups so no lead slips through the cracks',
    ],
  },
  {
    icon: Target,
    title: 'Be Ready Before You Arrive',
    points: [
      'Know the project before your first conversation',
      'Spot red flags early and quote with confidence',
      'Move fast on the right opportunities while others are still scheduling',
    ],
  },
  {
    icon: Zap,
    title: 'Win More of the Right Jobs',
    points: [
      'Filter out low-budget leads before they waste your afternoon',
      'Build trust upfront with a polished, professional process',
      'Close more jobs because you show up already understanding the scope',
    ],
  },
];

const testimonials = [
  {
    quote:
      "Our whole estimating process changed. We're closing more jobs and spending a fraction of the time driving around.",
    name: 'David Joseph',
    company: 'Joseph Tree',
  },
  {
    quote:
      'I used to do 16-20 site visits just to book a handful of jobs. Now I handle most of it from my laptop and my close rate is up 15%.',
    name: 'Ryan Amato',
    company: 'Ryan Amato Painting',
  },
  {
    quote:
      "I'm pacing toward $1.5M-$2M this year. A huge chunk came from video leads I never would have converted the old way.",
    name: 'Stew Kranitzky',
    company: 'Joseph Tree',
  },
  {
    quote:
      "We've added $30,000 to $40,000 in monthly revenue since switching to a video-first quoting approach.",
    name: 'Ray Rueda',
    company: "Nature's Dream Landscape",
  },
  {
    quote:
      "I got 15 hours a week back and stopped burning money on gas. I didn't need to hire another salesperson.",
    name: 'Mike Thomas',
    company: "Mike's Lawn and Landscape",
  },
  {
    quote:
      "Any business that sells services should be doing this. It's a complete game changer.",
    name: 'Jaclyn Rogers',
    company: 'AI Painting Plus',
  },
];

const integrations = [
  'Jobber',
  'ArboStar',
  'Zapier',
  'SingleOps',
  'CompanyCam',
  'Real Green',
  'Service Autopilot',
  'Aspire',
];

const faqs = [
  {
    q: 'What if my clients are older or have trouble with technology?',
    a: 'The flow is simple. Homeowners just record a quick video walkthrough on their phone with no app download required.',
  },
  {
    q: 'What happens after I sign up?',
    a: 'Your team can be configured quickly so you can start collecting project walkthrough videos right away.',
  },
  {
    q: 'How does this get on my website?',
    a: 'It can be embedded or shared as a direct link while fitting your existing website experience.',
  },
  {
    q: 'Does it integrate with other software tools?',
    a: 'Yes. It can connect into common CRM, scheduling, and workflow tools used by home service teams.',
  },
  {
    q: 'What if someone does not submit a video?',
    a: 'Automated follow-up keeps leads engaged and helps increase completion rates.',
  },
];

export default function NewLandingPage() {
  const { signIn } = useAuth();

  const onDummyLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
  };

  const onLoginClick = () => {
    signIn.onSignInButtonClick();
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--app-bg-hsl))] text-[#2f3334]">
      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary-hsl)/5%)]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[hsl(var(--secondary-bg-hsl)/10%)]" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-2 lg:gap-20 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10"
          >
            <span className="mb-8 inline-block rounded-full bg-[hsl(var(--primary-hsl)/10%)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[hsl(var(--primary-hsl))]">
              Video-Based Quoting for Home Services
            </span>

            <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Quote Smarter. <span className="relative">Win Faster.</span>
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#6f766f] md:text-xl">
              TakeShape lets homeowners send you a video of their project so
              you can quote confidently, skip unnecessary site visits, and focus
              on work that actually converts.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Close 15% more of the leads you already have',
                'Give clients a frictionless, modern experience',
                'Win back 10+ hours a week lost to dead-end visits',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[hsl(var(--primary-hsl))]" />
                  <span className="font-medium text-[#2f3334]/80">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onLoginClick}
                className="group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary-hsl))] px-8 py-4 text-base font-semibold text-[hsl(var(--app-bg-hsl))] transition-all hover:bg-[hsl(var(--primary-hsl)/90%)]"
              >
                Login
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#"
                onClick={onDummyLinkClick}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#2f3334]/20 px-8 py-4 text-base font-semibold transition-all hover:border-[hsl(var(--primary-hsl)/40%)] hover:text-[hsl(var(--primary-hsl))]"
              >
                See How It Works
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-full shadow-2xl shadow-[#2f3334]/10">
                <Image
                  src={HERO_IMG}
                  alt="Contractor reviewing video estimate on tablet"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2f3334]/20 to-transparent" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -left-12 bottom-32 rounded-2xl border border-[#d8cec0] bg-[hsl(var(--app-bg-hsl)/95%)] p-5 shadow-xl backdrop-blur-sm"
              >
                <p className="text-4xl font-bold text-[hsl(var(--primary-hsl))]">15%</p>
                <p className="mt-1 text-sm text-[#6f766f]">Higher close rate</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -right-8 top-24 rounded-2xl border border-[#d8cec0] bg-[hsl(var(--app-bg-hsl)/95%)] p-5 shadow-xl backdrop-blur-sm"
              >
                <p className="text-4xl font-bold text-[#2f3334]">10h+</p>
                <p className="mt-1 text-sm text-[#6f766f]">Saved per week</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d8cec0] to-transparent" />
      </section>

      <section className="border-y border-[#d8cec0]/60 py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-[#6f766f]">
            Trusted by home service pros across the country
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="whitespace-nowrap text-lg font-bold tracking-tight text-[#2f3334]/30"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary-hsl))]">
              How It Works
            </span>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Three Steps to a Smarter Sales Process
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6f766f]">
              From first inquiry to signed contract, TakeShape keeps you in
              control without the wasted windshield time.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="group relative"
              >
                <div className="relative rounded-3xl border border-[#d8cec0]/60 bg-[hsl(var(--app-bg-hsl))] p-8 transition-all duration-500 hover:border-[hsl(var(--primary-hsl)/30%)] hover:shadow-lg hover:shadow-[hsl(var(--primary-hsl)/5%)] md:p-10">
                  <span className="absolute -left-2 -top-4 select-none text-8xl font-bold text-[hsl(var(--primary-hsl)/10%)]">
                    {i + 1}
                  </span>

                  <div className="relative z-10">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary-hsl)/10%)] transition-colors group-hover:bg-[hsl(var(--primary-hsl)/15%)]">
                      <step.icon className="h-7 w-7 text-[hsl(var(--primary-hsl))]" />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                    <p className="leading-relaxed text-[#6f766f]">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary-hsl))]">
              Why TakeShape
            </span>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Work Smarter Without Losing the Human Touch
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6f766f]">
              Remote quoting works when it is done right. TakeShape gives you
              what you need to assess jobs accurately without being there in
              person.
            </p>
          </motion.div>

          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl shadow-2xl shadow-[#2f3334]/10">
                <Image
                  src={FEATURE_IMG}
                  alt="Aerial view of landscaped residential property"
                  width={1200}
                  height={900}
                  className="h-auto w-full"
                />
              </div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full border-4 border-[hsl(var(--primary-hsl)/10%)]" />
            </motion.div>

            <div className="space-y-10">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary-hsl)/10%)]">
                      <benefit.icon className="h-6 w-6 text-[hsl(var(--primary-hsl))]" />
                    </div>
                    <h3 className="text-2xl font-bold">{benefit.title}</h3>
                  </div>
                  <ul className="ml-16 space-y-3">
                    {benefit.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[hsl(var(--primary-hsl))]" />
                        <span className="leading-relaxed text-[#6f766f]">{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--app-surface)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary-hsl))]">
              What Our Customers Say
            </span>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Real Results from Real Contractors
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex flex-col rounded-3xl border border-[#d8cec0]/60 bg-[hsl(var(--app-bg-hsl))] p-8 transition-all duration-500 hover:border-[hsl(var(--primary-hsl)/20%)] hover:shadow-lg hover:shadow-[hsl(var(--primary-hsl)/5%)]"
              >
                <Quote className="mb-4 h-8 w-8 text-[hsl(var(--primary-hsl)/30%)]" />
                <p className="flex-1 text-lg leading-relaxed text-[#2f3334]/90">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="mt-6 border-t border-[#d8cec0]/60 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--primary-hsl)/10%)]">
                      <span className="text-lg font-bold text-[hsl(var(--primary-hsl))]">
                        {testimonial.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-[#6f766f]">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary-hsl))]">
                Integrations
              </span>
              <h2 className="mt-4 text-4xl font-bold md:text-5xl">
                Fits Into the Way You Already Work
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[#6f766f]">
                TakeShape plugs into the tools you already use so you can add a
                smarter front end to your existing process.
              </p>
              <a
                href="#"
                onClick={onDummyLinkClick}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary-hsl))] px-8 py-4 text-base font-semibold text-[hsl(var(--app-bg-hsl))] transition-colors hover:bg-[hsl(var(--primary-hsl)/90%)]"
              >
                <Plug className="h-5 w-5" />
                See All Integrations
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
            >
              {integrations.map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-center rounded-2xl border border-[#d8cec0]/60 bg-[hsl(var(--app-bg-hsl))] p-6 transition-all duration-300 hover:border-[hsl(var(--primary-hsl)/30%)] hover:shadow-md"
                >
                  <span className="text-center text-sm font-bold text-[#2f3334]/60">
                    {name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--app-surface)] py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary-hsl))]">
              FAQ
            </span>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <motion.details
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-[#d8cec0]/70 bg-[hsl(var(--app-bg-hsl))] px-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-left text-lg font-semibold marker:content-none">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-[#6f766f] transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-5 leading-relaxed text-[#6f766f]">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[hsl(var(--primary-hsl))]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#2f3334]/10" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[#2f3334]/5" />

        <div className="relative mx-auto max-w-4xl px-6 text-center md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[hsl(var(--app-bg-hsl))] md:text-6xl">
              Start Closing More of the Right Jobs
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[hsl(var(--app-bg-hsl)/80%)] md:text-xl">
              Join teams that are quoting faster, winning more, and getting
              their time back with TakeShape.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onLoginClick}
                className="group inline-flex items-center gap-2 rounded-full bg-[#2f3334] px-10 py-5 text-lg font-bold text-[hsl(var(--app-bg-hsl))] shadow-xl transition-all hover:bg-[#252829]"
              >
                Login
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-sm text-[hsl(var(--app-bg-hsl)/60%)]">
                Free • No credit card required • Setup in 1 day
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#2f3334] text-[hsl(var(--app-bg-hsl))]">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className="max-w-4xl text-3xl font-bold leading-tight text-[hsl(var(--primary-hsl))] md:text-5xl lg:text-6xl">
            See the job before you show up. Close more. Waste less.
          </p>

          <div className="mt-16 flex flex-col items-start justify-between gap-8 border-t border-[hsl(var(--app-bg-hsl)/10%)] pt-10 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-xl font-bold tracking-tight">TAKESHAPE</p>
              <p className="text-sm text-[hsl(var(--app-bg-hsl)/50%)]">
                Video-first quoting for home service professionals.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[hsl(var(--app-bg-hsl)/40%)]">
              <MapPin className="h-4 w-4" />
              <span className="font-mono text-xs tracking-widest">
                36.1627° N, 86.7816° W — Nashville, TN
              </span>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 text-xs text-[hsl(var(--app-bg-hsl)/30%)] sm:flex-row">
            <p>© {new Date().getFullYear()} TakeShape. All rights reserved.</p>
            <div className="flex gap-6">
              <a
                href="#"
                onClick={onDummyLinkClick}
                className="transition-colors hover:text-[hsl(var(--primary-hsl))]"
              >
                Terms of Use
              </a>
              <a
                href="#"
                onClick={onDummyLinkClick}
                className="transition-colors hover:text-[hsl(var(--primary-hsl))]"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
