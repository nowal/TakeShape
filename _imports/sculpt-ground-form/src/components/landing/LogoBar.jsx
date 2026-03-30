import React from "react";
import { motion } from "framer-motion";

const LOGOS = [
  "Joseph Tree", "DeVos", "Brawner", "Sunny Coast", "Eden Trees",
  "Woodland", "Ryan Amato Painting", "Valiant", "Wellnitz", "Arise",
];

export default function LogoBar() {
  return (
    <section className="py-16 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="text-center text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-10">
          Trusted by home service pros across the country
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {LOGOS.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              className="text-secondary/30 font-display text-lg font-bold tracking-tight whitespace-nowrap"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}