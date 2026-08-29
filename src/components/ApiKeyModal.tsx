import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, Shield, Info, Sparkles, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
      <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative cyber-card">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Google AI Studio (Gemini) Key</h3>
            <p className="text-xs text-slate-400">Optional for custom live Gemini analysis</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5 mb-4">
          <div className="flex items-center space-x-1 text-cyan-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built-in Fallback Guaranteed:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ScamBhasha contains a built-in deterministic Hindi/Hinglish linguistic & pattern engine that guarantees 100% demo uptime even without any external API key.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 font-mono">
              Gemini API Key (Optional):
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {inputKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Key</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-slate-400 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-teal-400 shadow-md transition-all"
              >
                {savedSuccess ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
