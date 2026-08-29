import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, 
  Flag, ArrowLeft, CheckCircle2, XCircle, Info, Link2, 
  Sparkles, FileText, Globe2, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { ScamAnalysisResult } from '../types/scam';

interface ResultScreenProps {
  result: ScamAnalysisResult;
  onScanAnother: () => void;
  onOpenReportModal: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onScanAnother,
  onOpenReportModal
}) => {
  const [showNormalizedToggle, setShowNormalizedToggle] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHighRisk = result.risk_level === 'HIGH';
  const isMediumRisk = result.risk_level === 'MEDIUM';
  const isLowRisk = result.risk_level === 'LOW';

  const riskColorClasses = isHighRisk 
    ? {
        border: 'border-rose-500/40',
        bg: 'bg-rose-950/20',
        badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        glow: 'cyber-glow-red',
        text: 'text-rose-400',
        bar: 'bg-rose-500'
      }
    : isMediumRisk
    ? {
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/20',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        glow: 'cyber-glow-amber',
        text: 'text-amber-400',
        bar: 'bg-amber-500'
      }
    : {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/20',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        glow: 'cyber-glow-green',
        text: 'text-emerald-400',
        bar: 'bg-emerald-500'
      };

  const handleCopyExplanation = () => {
    const summary = `[ScamBhasha Threat Alert] Verdict: ${result.risk_level} RISK (${result.risk_score}%)\nType: ${result.scam_type}\nWhy: ${result.explanation}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left animate-fade-in pb-12">
      
      {/* Top Navigation / Back Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onScanAnother}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Another Message</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">
            Engine: <span className="text-cyan-400 font-semibold">{result.engine_used === 'gemini_contextual' ? 'Gemini AI + Transliteration Layer' : 'Deterministic Linguistic & Pattern Engine'}</span>
          </span>
        </div>
      </div>

      {/* Main Threat Header Card */}
      <div className={`rounded-2xl p-6 sm:p-8 border ${riskColorClasses.border} ${riskColorClasses.bg} ${riskColorClasses.glow} relative overflow-hidden backdrop-blur-xl`}>
        
        {/* Background ambient accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Left info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Risk Level Badge */}
              <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${riskColorClasses.badge}`}>
                {isHighRisk && <ShieldAlert className="w-4 h-4" />}
                {isMediumRisk && <AlertTriangle className="w-4 h-4" />}
                {isLowRisk && <ShieldCheck className="w-4 h-4" />}
                <span>{result.risk_level} RISK VERDICT</span>
              </div>

              {/* Language & Script Metadata Pill */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-700 text-slate-300">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lang: <strong className="text-white">{result.language}</strong></span>
                <span className="text-slate-600">|</span>
                <span>Script: <strong className="text-white">{result.script}</strong></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {result.scam_type}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {/* Right Risk Score Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 min-w-[170px] flex-shrink-0 text-center shadow-inner">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
              Scam Probability
            </span>
            <div className={`text-4xl sm:text-5xl font-black font-mono ${riskColorClasses.text}`}>
              {result.risk_score}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`${riskColorClasses.bar} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${result.risk_score}%` }}
              ></div>
            </div>
          </div>

        </div>

      </div>

      {/* Language Normalization Details Dropdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowNormalizedToggle(!showNormalizedToggle)}
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Hindi / Hinglish Transliteration Intelligence: <span className="text-cyan-300">{result.normalization_applied ? 'Canonical Normalization Applied' : 'Standard Linguistic Pattern'}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Resolved Roman Hindi variants, slang, and phonetic spelling before AI classification.
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {showNormalizedToggle ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showNormalizedToggle && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <p className="text-slate-400 mb-1 font-semibold uppercase text-[10px]">Original Input:</p>
              <p className="text-slate-200 whitespace-pre-wrap">{result.raw_message}</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
              <p className="text-cyan-400 mb-1 font-semibold uppercase text-[10px]">Normalized Canonical Representation:</p>
              <p className="text-cyan-200 whitespace-pre-wrap">{result.normalized_text || result.raw_message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Signals Breakdown & URL Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section: Why Was This Flagged? (Signals) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>🔍 Why Was This Flagged?</span>
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {result.signals.length} Signals Detected
            </span>
          </div>

          <div className="space-y-3">
            {result.signals.length > 0 ? (
              result.signals.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <span>{sig.emoji}</span>
                      <span>{sig.label}</span>
                    </span>
                  </div>
                  {sig.excerpt && (
                    <div className="mt-1 text-xs">
                      <span className="text-slate-400 text-[11px]">Exact Excerpt: </span>
                      <span className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 font-mono text-xs">
                        "{sig.excerpt}"
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl">
                No overt scam trigger patterns detected in this message.
              </div>
            )}
          </div>
        </div>

        {/* Section: URL Intelligence & Heuristics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span>URL & Endpoint Intelligence</span>
            </h2>
            {result.url_analysis.url_present ? (
              <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${result.url_analysis.url_risk_score >= 70 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                URL Risk: {result.url_analysis.url_risk_score}%
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                No Link Found
              </span>
            )}
          </div>

          {result.url_analysis.url_present ? (
            <div className="space-y-3 text-xs">
              
              {/* Sanitized URL preview */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">Detected Link (Sanitized):</span>
                <span className="text-amber-300 break-all">{result.url_analysis.url}</span>
              </div>

              {/* Heuristic Checks */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                  <span className="text-slate-400">Shortened URL:</span>{' '}
                  <strong className={result.url_analysis.is_shortened ? 'text-rose-400' : 'text-slate-300'}>
                    {result.url_analysis.is_shortened ? 'YES (Obfuscated)' : 'NO'}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                  <span className="text-slate-400">HTTPS Secure:</span>{' '}
                  <strong className={result.url_analysis.https_present ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.url_analysis.https_present ? 'YES' : 'NO (Insecure)'}
                  </strong>
                </div>
              </div>

              {/* Brand Mismatch / Notes */}
              {result.url_analysis.notes && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/30 text-rose-300 text-[11px]">
                  <strong>Heuristic Findings:</strong> {result.url_analysis.notes}
                </div>
              )}

              {/* Heuristic disclaimer */}
              <p className="text-[10px] text-slate-500 italic">
                * Note: Evaluated via deterministic domain heuristics and brand keyword analysis. No live external threat intelligence lookups are made.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto" />
              <p>No suspicious web links or shortened redirection URLs were detected in this message.</p>
            </div>
          )}

          {/* Message vs URL Risk Comparison */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Message Text Risk: <strong className="text-white">{result.message_risk_score}%</strong></span>
            <span className="text-slate-400">URL Threat Risk: <strong className="text-white">{result.url_analysis.url_present ? `${result.url_analysis.url_risk_score}%` : 'N/A'}</strong></span>
          </div>
        </div>

      </div>

      {/* Recommended Action Section */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-[#0b0f19] p-6 space-y-4 cyber-card">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Recommended Safety Actions</h2>
            <p className="text-xs text-slate-400">Immediate protective measures tailored to this scam pattern</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.recommended_actions.map((action, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 flex items-start space-x-2.5"
            >
              <div className="flex-1 font-medium leading-relaxed">
                {action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={handleCopyExplanation}
          className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all w-full sm:w-auto justify-center"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Threat Summary!' : 'Copy Threat Summary'}</span>
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onOpenReportModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-600/40 text-xs font-bold transition-all shadow-lg shadow-rose-950/30"
          >
            <Flag className="w-4 h-4 text-rose-400" />
            <span>Report Scam (Help Community)</span>
          </button>

          <button
            onClick={onScanAnother}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

    </div>
  );
};
