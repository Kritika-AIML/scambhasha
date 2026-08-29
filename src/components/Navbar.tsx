import React from 'react';
import { Shield, ShieldAlert, Users, Scale, LayoutDashboard, KeyRound, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'community' | 'compare' | 'dashboard';
  setActiveTab: (tab: 'scanner' | 'community' | 'compare' | 'dashboard') => void;
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
  emergingAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenApiKeyModal,
  hasCustomKey,
  emergingAlertsCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#06080d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('scanner')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 group-hover:border-cyan-400 transition-all">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  ScamBhasha
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Cybersecurity That Understands How India Talks
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'community'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Community Intel</span>
              {emergingAlertsCount > 0 && (
                <span className="flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500/90 text-white animate-pulse">
                  {emergingAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'compare'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Why ScamBhasha</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          </nav>

          {/* Key Settings */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenApiKeyModal}
              title="Configure Gemini API Key (Optional)"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                hasCustomKey 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasCustomKey ? 'Gemini Active' : 'API Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
