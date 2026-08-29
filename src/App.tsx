import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScannerHome } from './components/ScannerHome';
import { ResultScreen } from './components/ResultScreen';
import { AnalysisPipelineModal } from './components/AnalysisPipelineModal';
import { ReportModal } from './components/ReportModal';
import { CommunityIntel } from './components/CommunityIntel';
import { CompareScreen } from './components/CompareScreen';
import { UserDashboard } from './components/UserDashboard';
import { ApiKeyModal } from './components/ApiKeyModal';

import { analyzeScamDeterministic } from './engine/ruleAnalyzer';
import { analyzeMessageWithGemini } from './engine/geminiService';
import { detectLiveScamCampaigns } from './engine/campaignClusterer';
import { ScamAnalysisResult } from './types/scam';

export function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'community' | 'compare' | 'dashboard'>('scanner');
  const [inputText, setInputText] = useState('');
  
  // Pipeline & Result States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScamAnalysisResult | null>(null);
  const [viewingResult, setViewingResult] = useState(false);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('scambhasha_gemini_key') || '');

  // Session History
  const [scanHistory, setScanHistory] = useState<ScamAnalysisResult[]>([]);
  const [emergingAlertsCount, setEmergingAlertsCount] = useState(0);

  useEffect(() => {
    const data = detectLiveScamCampaigns();
    setEmergingAlertsCount(data.liveClusterAlerts.length);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('scambhasha_gemini_key', key);
  };

  const handleScanMessage = async () => {
    if (!inputText.trim()) return;

    // Start pipeline animation
    setIsAnalyzing(true);

    try {
      // Execute analysis in background while pipeline animation plays
      let result: ScamAnalysisResult;

      // Check if it's one of the preset golden samples or arbitrary text
      const lower = inputText.toLowerCase().trim();
      const isPreset = lower.includes('kyc') || lower.includes('work from home') || lower.includes('badhai ho') || lower.includes('payment hold');

      if (isPreset || !apiKey) {
        result = analyzeScamDeterministic(inputText);
      } else {
        result = await analyzeMessageWithGemini(inputText, apiKey);
      }

      setCurrentResult(result);
      setScanHistory(prev => [result, ...prev]);
    } catch (err) {
      console.error('Scan error, fallback triggered:', err);
      const fallback = analyzeScamDeterministic(inputText);
      setCurrentResult(fallback);
      setScanHistory(prev => [fallback, ...prev]);
    }
  };

  const handlePipelineComplete = () => {
    setIsAnalyzing(false);
    setViewingResult(true);
  };

  const handleScanAnother = () => {
    setViewingResult(false);
    setActiveTab('scanner');
  };

  const handleSelectHistoryItem = (item: ScamAnalysisResult) => {
    setCurrentResult(item);
    setViewingResult(true);
    setActiveTab('scanner');
  };

  const handleReportSubmitted = () => {
    const data = detectLiveScamCampaigns();
    setEmergingAlertsCount(data.liveClusterAlerts.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 cyber-grid-bg">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'scanner') {
            setViewingResult(false);
          }
        }}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasCustomKey={!!apiKey}
        emergingAlertsCount={emergingAlertsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Tab 1: Scanner */}
        {activeTab === 'scanner' && (
          <>
            {viewingResult && currentResult ? (
              <ResultScreen
                result={currentResult}
                onScanAnother={handleScanAnother}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            ) : (
              <ScannerHome
                inputText={inputText}
                setInputText={setInputText}
                onScan={handleScanMessage}
                isLoading={isAnalyzing}
              />
            )}
          </>
        )}

        {/* Tab 2: Community Intel */}
        {activeTab === 'community' && (
          <CommunityIntel
            onScanAnother={() => {
              setActiveTab('scanner');
              setViewingResult(false);
            }}
          />
        )}

        {/* Tab 3: USP Comparison */}
        {activeTab === 'compare' && (
          <CompareScreen />
        )}

        {/* Tab 4: User Dashboard */}
        {activeTab === 'dashboard' && (
          <UserDashboard
            history={scanHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
            onGoToScanner={() => {
              setActiveTab('scanner');
              setViewingResult(false);
            }}
            onGoToCommunity={() => setActiveTab('community')}
          />
        )}

      </main>

      {/* Pipeline Animation Modal */}
      {isAnalyzing && (
        <AnalysisPipelineModal
          analysisResult={currentResult}
          onComplete={handlePipelineComplete}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentResult={currentResult}
        onReportSubmitted={handleReportSubmitted}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
