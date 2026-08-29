import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Sparkles, Trash2, 
  ArrowRight, Globe2, Zap
} from 'lucide-react';
import { SAMPLE_SCAMS } from '../engine/ruleAnalyzer';
import { normalizeHindiText } from '../engine/normalizer';
import { OcrDropzone } from './OcrDropzone';
import { SampleScam } from '../types/scam';

interface ScannerHomeProps {
  inputText: string;
  setInputText: (text: string) => void;
  onScan: () => void;
  isLoading: boolean;
}

export const ScannerHome: React.FC<ScannerHomeProps> = ({
  inputText,
  setInputText,
  onScan,
  isLoading
}) => {
  const [liveNorm, setLiveNorm] = useState(() => normalizeHindiText(inputText));

  useEffect(() => {
    setLiveNorm(normalizeHindiText(inputText));
  }, [inputText]);

  const handleSelectSample = (sample: SampleScam) => {
    setInputText(sample.text);
  };

  const handleClearText = () => {
    setInputText('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
      
      {/* Hero Branding Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>India's 1st Indic Scam Intelligence Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Cybersecurity That Understands <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            How India Talks.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300">
          Generic filters miss transliterated Roman Hindi and Hinglish threats. ScamBhasha explains the risk, extracts signals, and protects you in real-time.
        </p>

        {/* Dual Positioning Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            "Generic tools detect spam. ScamBhasha explains the threat."
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            "Same scam. Different language. Different detection."
          </span>
        </div>
      </div>

      {/* Main Input Box Area */}
      <div className="p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-[#0b0f19] to-[#06080d] shadow-2xl cyber-glow-cyan space-y-5">
        
        {/* Textarea Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white flex items-center space-x-2">
            <span>Paste Suspicious Message</span>
            <span className="text-[11px] font-normal text-slate-400 font-mono">
              (Hindi, Hinglish, Roman Hindi, English)
            </span>
          </label>

          {inputText && (
            <button
              onClick={handleClearText}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update..."
            rows={5}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-sans leading-relaxed resize-y"
          />
        </div>

        {/* Live Linguistic Preview Strip */}
        {inputText.trim().length > 0 && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Detected: <strong className="text-cyan-300">{liveNorm.language}</strong> ({liveNorm.script})</span>
            </div>

            {liveNorm.normalization_applied && (
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-[10px]">
                ✓ Transliteration Normalization Active
              </span>
            )}
          </div>
        )}

        {/* OCR Dropzone */}
        <div className="pt-2">
          <OcrDropzone onTextExtracted={(text) => setInputText(text)} />
        </div>

        {/* Scan Message CTA Button */}
        <button
          onClick={onScan}
          disabled={isLoading || !inputText.trim()}
          className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShieldAlert className="w-5 h-5 text-slate-950" />
          <span>Scan Message for Threats</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>

      </div>

      {/* "Try Sample Scam" Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Try Sample Scams (Instant Demo Fixtures)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click any card to populate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_SCAMS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-900/90 cursor-pointer transition-all duration-200 group text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <span>{sample.icon}</span>
                    <span>{sample.title}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {sample.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono line-clamp-2 leading-relaxed">
                  "{sample.text}"
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 font-semibold group-hover:text-cyan-300">
                <span>Load into scanner</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
