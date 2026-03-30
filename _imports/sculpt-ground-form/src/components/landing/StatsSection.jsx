import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "80%", label: "of the buying process is complete before a salesperson is involved" },
  { value: "76%", label: "of buyers prefer a seller-free buying experience" },
  { value: "70%", label: "of prospects choose the first company they meet" },
  { value: "15%", label: "average increase in close rates with Groundwork" },
];

export default function StatsSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary" />
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/5" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            The Numbers Don't Lie
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mt-4">
            Are you frustrating your potential customers?
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <p className="font-display text-6xl md:text-7xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="mt-4 text-secondary-foreground/70 leading-relaxed text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}