import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const HERO_IMG = "https://media.base44.com/images/public/69c68a58ac34c871608cac79/a9575008e_generated_7e062d3a.png";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16 lg:py-0">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-8">
            Video-Based Quoting for Home Services
          </span>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-secondary">
            Quote Smarter.{" "}
            <span className="relative">
              <span className="relative z-10">Win Faster.</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-primary/20 -z-0 rounded-sm" />
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
            TakeShape lets homeowners send you a video of their project — so you can quote confidently, skip unnecessary site visits, and focus on work that actually converts.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Close 15% more of the leads you already have",
              "Give clients a frictionless, modern experience",
              "Win back 10+ hours a week lost to dead-end visits",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-secondary/80 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-base font-semibold rounded-full hover:bg-primary/90 transition-all"
            >
              Book a Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#process"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-secondary/15 text-secondary text-base font-semibold rounded-full hover:border-primary/40 hover:text-primary transition-all"
            >
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Hero imagery */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative">
            {/* Main arch shape */}
            <div className="relative w-full aspect-[3/4] rounded-t-full overflow-hidden shadow-2xl shadow-secondary/10">
              <img
                src={HERO_IMG}
                alt="Contractor reviewing video estimate on tablet in beautiful outdoor space"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -left-12 bottom-32 bg-background/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-border"
            >
              <p className="font-display text-4xl font-bold text-primary">15%</p>
              <p className="text-sm text-muted-foreground mt-1">Higher close rate</p>
            </motion.div>

            {/* Floating card top */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -right-8 top-24 bg-background/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-border"
            >
              <p className="font-display text-4xl font-bold text-secondary">10h+</p>
              <p className="text-sm text-muted-foreground mt-1">Saved per week</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom architectural line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}