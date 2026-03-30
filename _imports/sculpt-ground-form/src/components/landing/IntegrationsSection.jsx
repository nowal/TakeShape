import React from "react";
import { motion } from "framer-motion";
import { Plug } from "lucide-react";

const integrations = [
  "Jobber", "ArboStar", "Zapier", "SingleOps", "CompanyCam",
  "Real Green", "Service Autopilot", "Aspire",
];

export default function IntegrationsSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">
              Integrations
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary mt-4">
              Fits Into the Way You Already Work
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              TakeShape plugs into the tools you're already using — your CRM, scheduling software, and communication stack. No overhaul needed, just a smarter front end on your existing process.
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-primary text-primary-foreground text-base font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              <Plug className="w-5 h-5" />
              See All Integrations
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {integrations.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-background border border-border/60 rounded-2xl p-6 flex items-center justify-center hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <span className="font-display text-sm font-bold text-secondary/60 text-center">
                  {name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}