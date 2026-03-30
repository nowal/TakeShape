import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What if my clients are older or have trouble with technology?",
    a: "Groundwork is designed to be incredibly simple. Homeowners just record a quick video walkthrough on their phone — no app download required. Our customers find that even their least tech-savvy clients can do it easily.",
  },
  {
    q: "What happens after I sign up?",
    a: "Our team customizes Groundwork for your business within one business day. Once complete, you'll have access and be ready to capture project walkthrough videos from prospects immediately.",
  },
  {
    q: "How does Groundwork get on my website?",
    a: "We provide a simple embed code or direct link that integrates seamlessly with your existing website. Setup takes just minutes and our team handles it for you.",
  },
  {
    q: "Does Groundwork integrate with other software tools?",
    a: "Yes! We integrate with popular tools like Jobber, ArboStar, SingleOps, CompanyCam, Zapier, and many more. Connect your existing CRM and scheduling tools effortlessly.",
  },
  {
    q: "I sell premium services — won't a virtual process diminish value?",
    a: "Not at all. Groundwork actually enhances the premium experience. Homeowners love the convenience, and you can deliver a polished, professional first impression through video — before you ever set foot on the property.",
  },
  {
    q: "What if someone does not submit a video?",
    a: "Groundwork includes automated follow-up sequences to re-engage leads who haven't completed their video. Plus, the video submission process is so simple that the vast majority of homeowners complete it.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-muted/40">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            FAQ
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary mt-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-background border border-border/60 rounded-2xl px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left font-display text-lg font-semibold text-secondary hover:text-primary py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}