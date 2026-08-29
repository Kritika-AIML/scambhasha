import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, AlertTriangle, Activity, Database, 
  ArrowRight, Radio, ExternalLink, Sparkles, Filter, Info, ShieldCheck, Flame, RefreshCw
} from 'lucide-react';
import { detectLiveScamCampaigns, getStoredReports } from '../engine/campaignClusterer';
import { ScamCampaign, ScamReport } from '../types/scam';

interface CommunityIntelProps {
  onScanAnother: () => void;
}

export const CommunityIntel: React.FC<CommunityIntelProps> = ({ onScanAnother }) => {
  const [data, setData] = useState<{
    campaigns: ScamCampaign[];
    liveClusterAlerts: ScamCampaign[];
    totalReportsCount: number;
    liveUserReportsCount: number;
  }>({
    campaigns: [],
    liveClusterAlerts: [],
    totalReportsCount: 0,
    liveUserReportsCount: 0
  });

  const [reports, setReports] = useState<ScamReport[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'EMERGING' | 'LIVE_SUBMISSIONS'>('ALL');

  const refreshData = () => {
    const result = detectLiveScamCampaigns();
    setData(result);
    setReports(getStoredReports());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredCampaigns = data.campaigns.filter(c => {
    if (selectedFilter === 'EMERGING') return c.is_emerging;
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Community Threat Intelligence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time clustering of scam reports across Indian languages, dialects, and deceptive domains.
          </p>
        </div>

        {/* Live Metrics Header Cards */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[120px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Reports</span>
            <div className="text-xl font-bold font-mono text-white flex items-center justify-center space-x-1.5">
              <span>{data.totalReportsCount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 font-normal">pts</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-center min-w-[130px]">
            <span className="text-[10px] font-mono text-cyan-400 uppercase flex items-center justify-center space-x-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
              <span>Live Demo Reports</span>
            </span>
            <div className="text-xl font-bold font-mono text-cyan-300">
              +{data.liveUserReportsCount} new
            </div>
          </div>

          <button
            onClick={refreshData}
            title="Refresh community clustering"
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🚨 EMERGING SCAM CAMPAIGN ALERT (Dynamic WOW Feature) */}
      {data.liveClusterAlerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <h2 className="text-sm font-bold tracking-wider uppercase text-rose-400 font-mono">
              🚨 Active Emerging Campaign Alerts (Dynamic Clustering Detected)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.liveClusterAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-2xl border border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-slate-950/80 to-[#0b0f19] relative overflow-hidden cyber-glow-red"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-1.5 uppercase tracking-wide">
                      Emerging Threat • {alert.scam_type}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {alert.name}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-400 block">
                      {alert.report_count} Reports
                    </span>
                    <span className="text-[10px] text-slate-500">Clustered</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  <strong>Trigger Signature:</strong> {alert.trigger_reason}
                </p>

                {alert.common_domain && (
                  <div className="mb-3 p-2 rounded-lg bg-slate-950/90 border border-rose-900/40 text-xs font-mono text-amber-300">
                    <span className="text-slate-500 text-[10px] block">Shared Endpoint Domain:</span>
                    {alert.common_domain}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                  {alert.common_signals.map((sig, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Pipeline Diagram */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 cyber-card">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300">
            Automated Campaign Detection Pipeline Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative text-center">
          
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-cyan-400 font-mono text-xs font-bold block mb-1">01. Reports</span>
            <p className="text-xs font-medium text-slate-200">User Submissions</p>
            <p className="text-[10px] text-slate-500 mt-1">Anonymized SMS & WhatsApp text</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-cyan-400 font-mono text-xs font-bold block mb-1">02. Similarity</span>
            <p className="text-xs font-medium text-slate-200">N-Gram & Domain Grouping</p>
            <p className="text-[10px] text-slate-500 mt-1">Hinglish phonetic hashing</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-cyan-400 font-mono text-xs font-bold block mb-1">03. Patterns</span>
            <p className="text-xs font-medium text-slate-200">Signal Density</p>
            <p className="text-[10px] text-slate-500 mt-1">Urgency + Spoofed URLs</p>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/40">
            <span className="text-cyan-300 font-mono text-xs font-bold block mb-1">04. Campaign</span>
            <p className="text-xs font-medium text-white">Cluster Threshold</p>
            <p className="text-[10px] text-cyan-400/80 mt-1">≥ 3 matching threats</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
            <span className="text-rose-400 font-mono text-xs font-bold block mb-1">05. Alert</span>
            <p className="text-xs font-medium text-white">Community Shield</p>
            <p className="text-[10px] text-rose-300/80 mt-1">Broad warning published</p>
          </div>

        </div>
      </div>

      {/* Trending Scam Patterns */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              🔥 Trending Scam Patterns Across India
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Prototype & Live Data
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${selectedFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              All Patterns
            </button>
            <button
              onClick={() => setSelectedFilter('EMERGING')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${selectedFilter === 'EMERGING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Emerging Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {camp.scam_type}
                  </span>
                  <span className="text-xs font-bold font-mono text-cyan-400">
                    {camp.report_count.toLocaleString()} Reports
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {camp.name}
                </h3>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {camp.trigger_reason}
                </p>

                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-mono text-slate-500 block">Common Indicators:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {camp.common_signals.map((sig, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-300 font-mono"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>First Seen: {camp.first_seen}</span>
                <span>Active: {camp.last_seen}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Recent Reports Stream */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Recent Anonymous Report Feed</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {reports.length} Anonymized Logs
          </span>
        </div>

        <div className="space-y-3">
          {reports.slice(0, 5).map((rep) => (
            <div
              key={rep.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">{rep.scam_type}</span>
                  {rep.is_user_submitted && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                      Live Demo Submission
                    </span>
                  )}
                </div>
                <p className="text-slate-400 font-mono text-[11px] truncate">
                  "{rep.message_excerpt}"
                </p>
              </div>

              <div className="flex items-center space-x-3 text-right flex-shrink-0">
                <span className="text-[11px] text-slate-500">{rep.timestamp}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${rep.risk_level === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>
                  {rep.risk_score}% RISK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
