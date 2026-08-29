import React, { useState } from 'react';
import { 
  Scale, XCircle, Sparkles, ShieldCheck, Globe
} from 'lucide-react';

export const CompareScreen: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<'kyc' | 'job' | 'lottery'>('kyc');

  const examples = {
    kyc: {
      input: 'Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update',
      lang: 'Roman Hindi + Hinglish',
      generic: {
        verdict: '❌ Spam (or Missed as Safe)',
        risk: 'Binary Flag',
        signals: 'None (Blackbox classification)',
        action: 'None (User is left confused)',
        failsOn: 'Fails to understand "hone wala hai", "band hone se pehle", transliterated Hindi urgency'
      },
      scambhasha: {
        verdict: '🔴 96% HIGH RISK',
        type: 'Fake KYC Scam',
        signals: [
          '⚠️ Urgency: "abhi update karein"',
          '😨 Threat: "Account band hone se pehle"',
          '🏦 Fake Banking: "Aapka KYC expire"',
          '🔗 Phishing URL: "bit.ly/sbi-kyc-update"'
        ],
        action: '❌ Don\'t click link • ❌ Don\'t share OTP/PAN • 📢 Verify at official sbi.co.in'
      }
    },
    job: {
      input: 'Work from home job available. ₹30,000 monthly. Registration fee only ₹499. WhatsApp: 9876543210',
      lang: 'Hinglish + English',
      generic: {
        verdict: '⚠️ Promotional / Unknown',
        risk: 'Low Confidence',
        signals: 'Basic keyword match',
        action: 'None',
        failsOn: 'Misses advance-fee job traps common in Tier 2/3 Indian job seeker markets'
      },
      scambhasha: {
        verdict: '🔴 92% HIGH RISK',
        type: 'Fake Work From Home Scam',
        signals: [
          '💼 Fake Job: "Work from home job available"',
          '💰 Upfront Fee: "Registration fee only ₹499"',
          '🎁 Unrealistic Pay: "₹30,000 monthly"',
          '🚨 Off-platform CTA: "WhatsApp: 9876543210"'
        ],
        action: '❌ Never pay registration fee • ❌ Don\'t join unverified WhatsApp groups'
      }
    },
    lottery: {
      input: 'Badhai ho! Aapne ₹5,00,000 jeete hain KBC lucky draw mein. Claim karne ke liye bank details aur ₹1,500 fee bhejein: bit.ly/kbc-claim',
      lang: 'Roman Hindi',
      generic: {
        verdict: '❌ Spam',
        risk: 'Binary Flag',
        signals: 'Unknown (Treats "Badhai ho" as arbitrary Latin characters)',
        action: 'None',
        failsOn: 'English tokenizers do not understand transliterated cultural bait terms like "Badhai ho", "jeete hain"'
      },
      scambhasha: {
        verdict: '🔴 98% HIGH RISK',
        type: 'Lottery/Reward Scam',
        signals: [
          '🎁 Reward Bait: "Badhai ho! Aapne ₹5,00,000 jeete"',
          '👮 Impersonation: "KBC lucky draw"',
          '📱 Personal Info: "bank details"',
          '💰 Fee Demand: "₹1,500 fee bhejein"'
        ],
        action: '❌ Never pay fees to claim prizes • 📢 Genuine lotteries never ask for SMS fee transfers'
      }
    }
  };

  const current = examples[selectedExample];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Scale className="w-3.5 h-3.5" />
          <span>Architectural Advantage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Why Generic Spam Filters Fail in India
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Traditional cybersecurity tools were built for standard English. They fail when threats are written in Roman Hindi, mixed Hinglish, and regional transliterations.
        </p>
      </div>

      {/* Example Selector Tabs */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 flex space-x-2 text-xs font-semibold">
          <button
            onClick={() => setSelectedExample('kyc')}
            className={`px-4 py-2 rounded-lg transition-all ${selectedExample === 'kyc' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Example 1: Fake KYC Threat
          </button>
          <button
            onClick={() => setSelectedExample('job')}
            className={`px-4 py-2 rounded-lg transition-all ${selectedExample === 'job' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Example 2: Work From Home Trap
          </button>
          <button
            onClick={() => setSelectedExample('lottery')}
            className={`px-4 py-2 rounded-lg transition-all ${selectedExample === 'lottery' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Example 3: KBC Lottery Bait
          </button>
        </div>
      </div>

      {/* Selected Input Preview */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
        <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1">
          Test Message ({current.lang}):
        </span>
        <p className="text-slate-200 font-mono text-sm">
          "{current.input}"
        </p>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Generic English Spam Filter */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-5 opacity-90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase block">Legacy Architecture</span>
              <h3 className="text-lg font-bold text-slate-300">Generic Spam Detector</h3>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] mb-1">Verdict Output:</span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-slate-300">
                {current.generic.verdict}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] mb-1">Threat Explanation:</span>
              <p className="text-slate-400 italic">None provided. Returns an unhelpful binary flag without context.</p>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] mb-1">Extracted Signals:</span>
              <p className="text-slate-400 font-mono">{current.generic.signals}</p>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] mb-1">Why It Fails:</span>
              <p className="text-rose-400/90 leading-relaxed">{current.generic.failsOn}</p>
            </div>
          </div>
        </div>

        {/* Right Card: ScamBhasha */}
        <div className="p-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900/90 to-[#0b0f19] space-y-5 cyber-card cyber-glow-cyan">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase block">Linguistic AI Engine</span>
              <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
                <span>ScamBhasha</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-cyan-400/80 block text-[11px] font-mono mb-1">Explainable Threat Verdict:</span>
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 font-bold text-rose-300 flex items-center justify-between">
                <span>{current.scambhasha.verdict}</span>
                <span className="text-xs font-normal text-white">{current.scambhasha.type}</span>
              </div>
            </div>

            <div>
              <span className="text-cyan-400/80 block text-[11px] font-mono mb-1">Granular Signal Excerpts:</span>
              <div className="space-y-1.5">
                {current.scambhasha.signals.map((sig, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 font-mono text-slate-200 text-[11px]">
                    {sig}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-cyan-400/80 block text-[11px] font-mono mb-1">Actionable Protection:</span>
              <p className="text-emerald-300 font-medium leading-relaxed">{current.scambhasha.action}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Positioning Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-teal-950/80 border border-cyan-500/30 text-center space-y-2">
        <p className="text-lg sm:text-xl font-extrabold text-white">
          "Generic tools detect spam. ScamBhasha explains the threat."
        </p>
        <p className="text-xs text-cyan-300 font-mono">
          "Same scam. Different language. Different detection."
        </p>
      </div>

      {/* Multi-Language Scalability Roadmap */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Globe className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">
            Architecture Scalability & Indic Language Roadmap
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The ScamBhasha transliteration and normalization architecture is modular and decoupled from the classification engine. Support for additional Indian regional languages requires zero architectural rewrites:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
          {[
            { lang: 'Punjabi', script: 'Gurmukhi / Roman', status: 'Ready to Map' },
            { lang: 'Bengali', script: 'Bangla / Roman', status: 'Ready to Map' },
            { lang: 'Marathi', script: 'Devanagari / Roman', status: 'Ready to Map' },
            { lang: 'Tamil', script: 'Tamil / Tanglish', status: 'Ready to Map' },
            { lang: 'Telugu', script: 'Telugu / Tenglish', status: 'Ready to Map' },
            { lang: 'Gujarati', script: 'Gujarati / Roman', status: 'Ready to Map' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-white block mb-0.5">{item.lang}</span>
              <span className="text-[10px] text-slate-400 block mb-1">{item.script}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
