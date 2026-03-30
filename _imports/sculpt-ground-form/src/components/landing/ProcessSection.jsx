import React from "react";
import { motion } from "framer-motion";
import { Video, ClipboardCheck, Trophy } from "lucide-react";

const steps = [
  {
    icon: Video,
    title: "Capture",
    desc: "Your client films a quick walkthrough of the space on their phone — no app needed, no scheduling back-and-forth.",
  },
  {
    icon: ClipboardCheck,
    title: "Review",
    desc: "Watch the video on your own time, understand the full scope of the job, and build an accurate quote before ever showing up.",
  },
  {
    icon: Trophy,
    title: "Win",
    desc: "Show up prepared, set clear expectations, and close more jobs — because you already know exactly what you're walking into.",
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary mt-4">
            Three Steps to a Smarter Sales Process
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From first inquiry to signed contract — TakeShape keeps you in control without the wasted windshield time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="group relative"
            >
              <div className="relative bg-background border border-border/60 rounded-3xl p-8 md:p-10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500">
                {/* Step number */}
                <span className="absolute -top-4 -left-2 font-display text-8xl font-bold text-primary/8 select-none">
                  {i + 1}
                </span>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-secondary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}