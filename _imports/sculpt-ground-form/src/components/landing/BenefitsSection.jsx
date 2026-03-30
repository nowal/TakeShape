import React from "react";
import { motion } from "framer-motion";
import { Clock, Target, Zap, CheckCircle2 } from "lucide-react";

const FEATURE_IMG = "https://media.base44.com/images/public/69c68a58ac34c871608cac79/ce7641541_generated_89f6d830.png";

const benefits = [
  {
    icon: Clock,
    title: "Get Your Weekends Back",
    points: [
      "Skip the drive-by estimate — let the video do the legwork",
      "Spend your time on booked jobs, not tire-kickers",
      "Automated follow-ups so no lead slips through the cracks",
    ],
  },
  {
    icon: Target,
    title: "Be Ready Before You Arrive",
    points: [
      "Know the project inside and out before your first conversation",
      "Spot red flags early and quote with confidence",
      "Move fast on the right opportunities while others are still scheduling",
    ],
  },
  {
    icon: Zap,
    title: "Win More of the Right Jobs",
    points: [
      "Filter out low-budget leads before they waste your afternoon",
      "Build trust upfront with a process that feels polished and professional",
      "Close more jobs because you show up already knowing the scope",
    ],
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            Why TakeShape
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary mt-4">
            Work Smarter Without<br className="hidden md:block" /> Losing the Human Touch
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Remote quoting only works when it's done right. TakeShape gives you everything you need to assess a job accurately — without being there in person.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-secondary/10">
              <img
                src={FEATURE_IMG}
                alt="Aerial view of beautifully landscaped modern residential property"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border-4 border-primary/10 pointer-events-none" />
          </motion.div>

          {/* Benefits */}
          <div className="space-y-10">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-secondary">
                    {b.title}
                  </h3>
                </div>
                <ul className="space-y-3 ml-16">
                  {b.points.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}