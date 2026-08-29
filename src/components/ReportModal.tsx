import React, { useState } from 'react';
import { X, CheckCircle2, Lock, Flag, Send } from 'lucide-react';
import { ScamAnalysisResult } from '../types/scam';
import { saveNewReport } from '../engine/campaignClusterer';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResult: ScamAnalysisResult | null;
  onReportSubmitted: () => void;
}

const SCAM_CATEGORIES = [
  'Fake KYC Scam',
  'Fake Work From Home Scam',
  'Lottery/Reward Scam',
  'Payment/Phishing Scam',
  'Electricity Bill Fraud',
  'Customs / Parcel Fraud',
  'Investment / Stock Scam',
  'Impersonation Extortion',
  'Other Threat'
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  currentResult,
  onReportSubmitted
}) => {
  const [scamType, setScamType] = useState(
    currentResult?.scam_type && currentResult.scam_type !== 'Not a Scam (Safe / Informational)'
      ? currentResult.scam_type
      : 'Fake KYC Scam'
  );
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      saveNewReport({
        scam_type: scamType,
        message_excerpt: currentResult?.raw_message || 'User reported suspicious pattern',
        detected_signals: currentResult?.signals.map(s => s.label) || ['Suspicious message'],
        domain: currentResult?.url_analysis?.url || null,
        risk_level: currentResult?.risk_level || 'HIGH',
        risk_score: currentResult?.risk_score || 90,
        additional_notes: additionalNotes.trim()
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      onReportSubmitted();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
      <div className="bg-[#0b0f19] border border-rose-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative cyber-glow-red">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">✓ Report Received</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your anonymized report has been logged to the community database. It helps detect emerging scam campaigns and protect millions of Indian users.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Scam to Community</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Help cluster new threat patterns in real-time
                </p>
              </div>
            </div>

            {/* Zero PII Notice */}
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs">
              <Lock className="w-4 h-4 flex-shrink-0 text-cyan-400" />
              <span>
                <strong>100% Anonymous:</strong> No name, phone number, or IP is collected.
              </span>
            </div>

            {/* Scam Type Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scam Classification:
              </label>
              <select
                value={scamType}
                onChange={(e) => setScamType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
              >
                {SCAM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Excerpt Preview */}
            {currentResult?.raw_message && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Reported Message Snippet:
                </label>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 max-h-20 overflow-y-auto font-mono">
                  "{currentResult.raw_message.substring(0, 140)}..."
                </div>
              </div>
            )}

            {/* Additional Context Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Context (Optional):
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Sender pretended to be SBI manager, asked to install APK file from SMS..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Anonymously'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
