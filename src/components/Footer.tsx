import React from 'react';
import { ShieldCheck, Lock, Globe, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#06080d] py-8 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800/50">
          
          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Core Security Mission</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              "Generic tools detect spam. ScamBhasha explains the threat."
              <br />
              "Same scam. Different language. Different detection."
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm mb-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Zero PII Guarantee</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              All scanned text is ephemeral and never saved to any database. Scams submitted via community reporting are strictly anonymized with zero personally identifiable data.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm mb-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Indic Linguistic Scalability</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Engineered with a modular normalization & transliteration architecture extensible to Punjabi, Bengali, Marathi, Tamil, Telugu, and Gujarati.
            </p>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} ScamBhasha — Cybersecurity That Understands How India Talks.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
              <Sparkles className="w-3 h-3 mr-1" />
              Hackathon Demo Prototype
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
