import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section id="cta" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-secondary/5" />

      <div className="relative max-w-4xl mx-auto px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground">
            Start Closing More of the Right Jobs
          </h2>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Join home service pros across the country who are quoting faster, winning more, and getting their time back with TakeShape.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://calendly.com/hellogroundwork/groundwork-sales-system-demo-1"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-secondary text-secondary-foreground text-lg font-bold rounded-full hover:bg-secondary/90 transition-all shadow-xl"
            >
              Book a Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-sm text-primary-foreground/60">
              Free • No credit card required • Setup in 1 day
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}