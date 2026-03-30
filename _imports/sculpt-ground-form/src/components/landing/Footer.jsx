import React from "react";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
        {/* Philosophy statement */}
        <p className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight max-w-4xl">
          See the job before you show up. Close more. Waste less.
        </p>

        <div className="mt-16 pt-10 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-secondary-foreground mb-2">
              TAKESHAPE
            </p>
            <p className="text-sm text-secondary-foreground/50">
              Video-first quoting for home service professionals.
            </p>
          </div>

          {/* Coordinates anchor */}
          <div className="flex items-center gap-3 text-secondary-foreground/40">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-mono tracking-widest">
              36.1627° N, 86.7816° W — Nashville, TN
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-secondary-foreground/30">
          <p>© {new Date().getFullYear()} TakeShape. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://www.hellogroundwork.com/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Terms of Use
            </a>
            <a href="https://www.hellogroundwork.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}