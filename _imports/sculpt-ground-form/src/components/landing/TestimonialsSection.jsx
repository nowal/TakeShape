import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Our whole estimating process changed. We're closing more jobs and spending a fraction of the time driving around.",
    name: "David Joseph",
    company: "Joseph Tree",
  },
  {
    quote: "I used to do 16-20 site visits just to book a handful of jobs. Now I handle most of it from my laptop — and my close rate is up 15%.",
    name: "Ryan Amato",
    company: "Ryan Amato Painting",
  },
  {
    quote: "I'm pacing toward $1.5M-$2M this year. A huge chunk of that came from video leads I never would have converted the old way.",
    name: "Stew Kranitzky",
    company: "Joseph Tree",
  },
  {
    quote: "We've added $30,000 to $40,000 in monthly revenue since switching to a video-first quoting approach.",
    name: "Ray Rueda",
    company: "Nature's Dream Landscape",
  },
  {
    quote: "I got 15 hours a week back and stopped burning money on gas. I didn't need to hire another salesperson after all.",
    name: "Mike Thomas",
    company: "Mike's Lawn and Landscape",
  },
  {
    quote: "Honestly, any business that sells services should be doing this. It's a complete game changer.",
    name: "Jaclyn Rogers",
    company: "AI Painting Plus",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 md:py-32 bg-muted/40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            What Our Customers Say
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary mt-4">
            Real Results from Real Contractors
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-background border border-border/60 rounded-3xl p-8 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-secondary/90 leading-relaxed flex-1 text-lg italic">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-primary">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}