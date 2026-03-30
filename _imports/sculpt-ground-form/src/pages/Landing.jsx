import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import LogoBar from "../components/landing/LogoBar";
import ProcessSection from "../components/landing/ProcessSection";
import BenefitsSection from "../components/landing/BenefitsSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import IntegrationsSection from "../components/landing/IntegrationsSection";
import FAQSection from "../components/landing/FAQSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LogoBar />
      <ProcessSection />
      <BenefitsSection />
      <TestimonialsSection />
      <IntegrationsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}