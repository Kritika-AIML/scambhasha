import React from 'react';
import { 
  LayoutDashboard, ShieldAlert, 
  ArrowRight, Clock, Shield, Flame
} from 'lucide-react';
import { ScamAnalysisResult } from '../types/scam';
import { SEEDED_CAMPAIGNS } from '../engine/campaignClusterer';

interface UserDashboardProps {
  history: ScamAnalysisResult[];
  onSelectHistoryItem: (result: ScamAnalysisResult) => void;
  onGoToScanner: () => void;
  onGoToCommunity: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  history,
  onSelectHistoryItem,
  onGoToScanner,
  onGoToCommunity
}) => {
  const totalScanned = Math.max(history.length, 14); // Baseline demo metric + live scans
  const highRiskCount = history.filter(h => h.risk_level === 'HIGH').length + 9;
  const mediumRiskCount = history.filter(h => h.risk_level === 'MEDIUM').length + 3;
  const safeCount = history.filter(h => h.risk_level === 'LOW').length + 2;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Security Analytics & Activity
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Overview of intercepted Hindi/Hinglish threats and personal scans.
          </p>
        </div>

        <button
          onClick={onGoToScanner}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Scan New Message</span>
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Messages Scanned</span>
          <div className="text-3xl font-bold font-mono text-white">{totalScanned}</div>
          <p className="text-[11px] text-cyan-400 flex items-center pt-1">
            <span>🛡️ Active session protection</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
          <span className="text-xs font-mono text-rose-400 uppercase">High Risk Blocked</span>
          <div className="text-3xl font-bold font-mono text-rose-400">{highRiskCount}</div>
          <p className="text-[11px] text-rose-300/80 pt-1">
            <span>KYC, WFH & OTP threats</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
          <span className="text-xs font-mono text-amber-400 uppercase">Medium Suspicion</span>
          <div className="text-3xl font-bold font-mono text-amber-400">{mediumRiskCount}</div>
          <p className="text-[11px] text-amber-300/80 pt-1">
            <span>Unverified links & calls</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-xs font-mono text-emerald-400 uppercase">Safe / Low Risk</span>
          <div className="text-3xl font-bold font-mono text-emerald-400">{safeCount}</div>
          <p className="text-[11px] text-emerald-300/80 pt-1">
            <span>Clean communications</span>
          </p>
        </div>

      </div>

      {/* Grid: Scan History & Community Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Session Scan History */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Session Scans</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {history.length} Live Items
            </span>
          </div>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectHistoryItem(item)}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">{item.scam_type}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      "{item.raw_message}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${item.risk_level === 'HIGH' ? 'text-rose-400 bg-rose-950/60' : 'text-emerald-400 bg-emerald-950/60'}`}>
                      {item.risk_score}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Shield className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">No custom messages scanned in this session yet.</p>
              <button
                onClick={onGoToScanner}
                className="text-xs text-cyan-400 font-bold hover:underline"
              >
                Scan a sample scam now →
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Trending Threat Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Trending Threats</span>
            </h2>
            <button
              onClick={onGoToCommunity}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {SEEDED_CAMPAIGNS.slice(0, 3).map((camp) => (
              <div key={camp.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{camp.scam_type}</span>
                  <span className="text-[10px] font-mono text-cyan-400">{camp.report_count} reps</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {camp.name}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
