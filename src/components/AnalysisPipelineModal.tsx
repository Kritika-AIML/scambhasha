import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldAlert, Cpu } from 'lucide-react';
import { ScamAnalysisResult } from '../types/scam';

interface AnalysisPipelineModalProps {
  onComplete: () => void;
  analysisResult: ScamAnalysisResult | null;
}

const PIPELINE_STEPS = [
  { id: 1, title: 'Message processed', desc: 'Sanitizing input & tokenizing structure' },
  { id: 2, title: 'Language detected', desc: 'Checking Devanagari, Hinglish & Roman Hindi' },
  { id: 3, title: 'Hindi/Hinglish normalized', desc: 'Mapping transliteration variants & slang' },
  { id: 4, title: 'Scam patterns analysed', desc: 'Evaluating 11 threat signal categories' },
  { id: 5, title: 'URL/signals checked', desc: 'Inspecting lookalikes, TLDs & brand mismatches' },
  { id: 6, title: 'Risk calculated', desc: 'Synthesizing explainable risk profile' }
];

export const AnalysisPipelineModal: React.FC<AnalysisPipelineModalProps> = ({
  onComplete,
  analysisResult
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Step timings totaling ~2.0s
    const stepIntervals = [300, 320, 320, 350, 350, 350];
    let timeoutId: any;

    const advanceStep = (stepIdx: number) => {
      if (stepIdx < PIPELINE_STEPS.length) {
        timeoutId = setTimeout(() => {
          setCurrentStep(stepIdx + 1);
          advanceStep(stepIdx + 1);
        }, stepIntervals[stepIdx]);
      } else {
        // Complete
        timeoutId = setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    advanceStep(0);

    return () => clearTimeout(timeoutId);
  }, [onComplete]);

  const progressPercent = Math.round((currentStep / PIPELINE_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left cyber-glow-cyan">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>ScamBhasha Intelligence Pipeline</span>
            </h3>
            <p className="text-xs text-cyan-400/80 font-mono">
              Analyzing linguistic patterns & scam vectors...
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Pipeline Execution</span>
            <span className="text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {PIPELINE_STEPS.map((step, idx) => {
            const isFinished = currentStep > idx;
            const isRunning = currentStep === idx;

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-2.5 rounded-xl border transition-all duration-200 ${
                  isFinished
                    ? 'bg-slate-900/60 border-cyan-500/30 text-slate-200'
                    : isRunning
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white scale-[1.02]'
                    : 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isFinished ? (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 transition-all duration-300" />
                  ) : isRunning ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                      {step.id}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${isRunning ? 'text-cyan-300' : isFinished ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    {isFinished && (
                      <span className="text-[10px] font-mono text-cyan-400/90 uppercase">Done</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
