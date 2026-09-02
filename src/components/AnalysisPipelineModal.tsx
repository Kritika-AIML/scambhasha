import React, { useEffect, useState } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { ScamAnalysisResult, ScamSignal } from '../types/scam';

interface AnalysisPipelineModalProps {
  onComplete: () => void;
  analysisResult: ScamAnalysisResult | null;
}

export const AnalysisPipelineModal: React.FC<AnalysisPipelineModalProps> = ({
  onComplete,
  analysisResult
}) => {
  const [revealedSignals, setRevealedSignals] = useState<ScamSignal[]>([]);
  const [runningScore, setRunningScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Derive signals to animate
  const signalsToAnimate: ScamSignal[] = (analysisResult && analysisResult.signals && analysisResult.signals.length > 0)
    ? analysisResult.signals
    : [
        { type: 'urgency', label: 'Linguistic Structure Check', emoji: '🔍', excerpt: 'Sanitizing Indic tokens', points: 5 },
        { type: 'fake_banking_kyc', label: 'Pattern Threat Evaluation', emoji: '🛡️', excerpt: 'Evaluating credential markers', points: 7 }
      ];

  const targetFinalScore = analysisResult ? analysisResult.risk_score : 12;

  useEffect(() => {
    let currentIndex = 0;
    let accumulatedScore = 0;
    const intervalMs = 420;

    const timer = setInterval(() => {
      if (currentIndex < signalsToAnimate.length) {
        const nextSig = signalsToAnimate[currentIndex];
        const addedPoints = nextSig.points || Math.max(10, Math.round(targetFinalScore / signalsToAnimate.length));
        
        accumulatedScore = Math.min(targetFinalScore, accumulatedScore + addedPoints);
        
        // On last signal ensure running score reaches exactly targetFinalScore
        if (currentIndex === signalsToAnimate.length - 1) {
          accumulatedScore = targetFinalScore;
        }

        setRevealedSignals(prev => [...prev, nextSig]);
        setRunningScore(accumulatedScore);
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsFinished(true);
        setTimeout(() => {
          onComplete();
        }, 600);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [signalsToAnimate, targetFinalScore, onComplete]);

  // Color theme based on running score
  const isHigh = runningScore >= 70;
  const isMedium = runningScore >= 40 && runningScore < 70;

  const scoreColor = isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400';
  const progressBg = isHigh 
    ? 'from-amber-500 via-rose-500 to-rose-400' 
    : isMedium 
    ? 'from-cyan-500 via-amber-400 to-amber-500' 
    : 'from-cyan-500 to-emerald-400';

  const glowClass = isHigh ? 'cyber-glow-red' : isMedium ? 'cyber-glow-amber' : 'cyber-glow-cyan';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className={`bg-[#0b0f19] border ${isHigh ? 'border-rose-500/50' : 'border-cyan-500/40'} rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left ${glowClass} transition-all duration-300`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${isHigh ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'} transition-all`}>
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Live Signal Threat Meter</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time Indic linguistic signal extraction & scoring
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
            Live Stream
          </span>
        </div>

        {/* Live Running Meter Display */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 mb-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Cumulative Risk Score
            </span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${scoreColor} transition-all duration-300`}>
                {runningScore}%
              </span>
              <span className="text-xs font-bold font-mono text-slate-400 uppercase">
                {isHigh ? '🔴 HIGH RISK' : isMedium ? '🟠 MEDIUM RISK' : '🟢 LOW / SAFE'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-cyan-400 block font-bold">
              {revealedSignals.length} / {signalsToAnimate.length}
            </span>
            <span className="text-[10px] text-slate-500">Signals Mapped</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mb-6 space-y-1.5">
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/80">
            <div
              className={`bg-gradient-to-r ${progressBg} h-2.5 rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${Math.min(100, runningScore)}%` }}
            ></div>
          </div>
        </div>

        {/* Sequential Signal Stream List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {revealedSignals.map((sig, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs animate-slide-in"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="text-base flex-shrink-0">{sig.emoji || '⚠️'}</span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-200 truncate">
                    {sig.label}
                  </p>
                  {sig.excerpt && (
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      "{sig.excerpt}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow">
                  +{sig.points || 18}%
                </span>
              </div>
            </div>
          ))}

          {revealedSignals.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500 font-mono animate-pulse">
              Parsing Roman Hindi tokens & threat vectors...
            </div>
          )}
        </div>

        {/* Footer Status */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            {isFinished ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Threat profile synthesized!</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1"></span>
                <span>Extracting transliterated indicators...</span>
              </>
            )}
          </span>
          <span>ScamBhasha Engine</span>
        </div>

      </div>
    </div>
  );
};
