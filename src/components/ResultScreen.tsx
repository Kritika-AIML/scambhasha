import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, 
  Flag, ArrowLeft, CheckCircle2, Link2, 
  Sparkles, Globe2, ChevronDown, ChevronUp, Copy, Check,
  Share2, Download, ArrowDown, X, MessageSquare
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
  const [showXRayView, setShowXRayView] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;
    setIsExporting(true);

    try {
      const html2canvas = (window as any).html2canvas;
      if (html2canvas) {
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: '#06080d',
          scale: 2,
          useCORS: true,
          logging: false
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `scambhasha-alert-${result.scam_type.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
        link.click();
      } else {
        // Direct Canvas Fallback if html2canvas is not present
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#06080d';
          ctx.fillRect(0, 0, 1080, 1080);
          ctx.fillStyle = isHighRisk ? '#e11d48' : '#d97706';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText('🚨 CYBER THREAT ADVISORY', 60, 100);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 52px sans-serif';
          ctx.fillText(result.scam_type, 60, 200);
          ctx.fillStyle = isHighRisk ? '#f43f5e' : '#f59e0b';
          ctx.font = 'bold 44px monospace';
          ctx.fillText(`${result.risk_score}% ${result.risk_level} RISK VERDICT`, 60, 280);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '28px sans-serif';
          ctx.fillText(result.explanation.substring(0, 80), 60, 360);
          ctx.fillText(result.explanation.substring(80, 160), 60, 400);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '22px monospace';
          ctx.fillText('Scanned with ScamBhasha • Cybersecurity That Understands How India Talks', 60, 1000);
          
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `scambhasha-alert.png`;
          link.click();
        }
      }
    } catch (e) {
      console.error('Export card error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    const textToShare = `🚨 *CYBER THREAT WARNING - PLEASE BE CAREFUL!* 🚨\n\n*Threat Detected:* ${result.scam_type}\n*Risk Level:* ${result.risk_level} (${result.risk_score}% Scam Probability)\n\n*Why:* ${result.explanation}\n\n*Safety Actions:*\n• ${result.recommended_actions.slice(0, 2).join('\n• ')}\n\n🛡️ _Scanned and verified via ScamBhasha (Indic Cybersecurity Intelligence)_`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Scam Alert: ${result.scam_type}`,
          text: textToShare
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to whatsapp link
      }
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(waUrl, '_blank');
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

      {/* 2. ADVANCED UPGRADE: NORMALIZATION X-RAY VIEW */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowXRayView(!showXRayView)}
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <span>See how we understood this message (Normalization X-Ray)</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  {result.normalization_applied ? 'Transliteration Normalized' : 'Linguistic Analysis'}
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Inspect the 3-step transformation trail: Raw Input → Canonical Hindi/Hinglish → Plain English Gloss.
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1 flex items-center space-x-1 text-xs">
            <span>{showXRayView ? 'Hide' : 'Inspect'}</span>
            {showXRayView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showXRayView && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 text-xs font-mono animate-fade-in">
            
            {/* Step 1: Raw Input */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  01. Raw Input Message
                </span>
                <span className="text-[10px] text-slate-500">Unfiltered Text</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed break-words font-sans">
                "{result.raw_message}"
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="flex justify-center text-cyan-400 text-xs">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>

            {/* Step 2: Canonical Normalized */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  02. Normalized Representation
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">Slang & Phonetic Variants Resolved</span>
              </div>
              <p className="text-cyan-200 text-xs leading-relaxed break-words font-sans">
                "{result.normalized_text || result.raw_message}"
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="flex justify-center text-emerald-400 text-xs">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>

            {/* Step 3: English Gloss */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  03. Literal English Gloss (Semantic Translation)
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">Contextual Meaning</span>
              </div>
              <p className="text-emerald-200 text-xs leading-relaxed break-words font-sans font-medium">
                "{result.english_gloss || 'Scam communication attempting credential harvesting under urgency.'}"
              </p>
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
                    {sig.points && (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                        +{sig.points}%
                      </span>
                    )}
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
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleCopyExplanation}
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all justify-center"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
          </button>

          {/* 3. ADVANCED UPGRADE: SHARE WARNING CARD BUTTON */}
          {!isLowRisk && (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Warning Card</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onOpenReportModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-600/40 text-xs font-bold transition-all shadow-lg shadow-rose-950/30"
          >
            <Flag className="w-4 h-4 text-rose-400" />
            <span>Report Scam</span>
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

      {/* 3. ADVANCED UPGRADE: SHAREABLE WARNING CARD MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#0b0f19] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative cyber-glow-amber">
            
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Shareable Security Warning Card</h3>
                <p className="text-xs text-slate-400">Forward on WhatsApp to protect family & elders</p>
              </div>
            </div>

            {/* The 1080x1080 Aspect Ratio Social Share Card Element */}
            <div
              ref={shareCardRef}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#0a0d14] via-[#0f1422] to-[#06080d] border-2 border-rose-500/60 shadow-2xl space-y-4 text-left my-2 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase tracking-widest text-rose-400">
                      CYBER THREAT ADVISORY
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ScamBhasha Indic Security Alert
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {result.risk_score}% {result.risk_level} RISK
                </span>
              </div>

              {/* Threat Title */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Detected Threat Pattern:
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {result.scam_type}
                </h3>
              </div>

              {/* Explanation (Zero raw scam text to prevent re-spreading malicious links) */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                <strong>Why this is dangerous:</strong> {result.explanation}
              </div>

              {/* Key Protective Checklist */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                  Family Protection Checklist:
                </span>
                {result.recommended_actions.slice(0, 3).map((act, i) => (
                  <div key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-xs flex-shrink-0">•</span>
                    <span className="font-medium text-[11px] leading-tight">{act}</span>
                  </div>
                ))}
              </div>

              {/* Footer Watermark */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="text-cyan-400 font-semibold">
                  🛡️ Scanned with ScamBhasha
                </span>
                <span>Cybersecurity for India</span>
              </div>
            </div>

            {/* Share Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3">
              <button
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-all shadow"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating...' : 'Download Image (PNG)'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
