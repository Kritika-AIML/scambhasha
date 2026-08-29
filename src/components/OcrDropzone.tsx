import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Edit3, X } from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface OcrDropzoneProps {
  onTextExtracted: (text: string) => void;
}

export const OcrDropzone: React.FC<OcrDropzoneProps> = ({ onTextExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [editableText, setEditableText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setOcrProgress(5);
    setOcrStatusText('Loading image...');

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      setOcrStatusText('Initializing OCR Engine...');
      setOcrProgress(20);

      const worker = await createWorker('eng+hin', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setOcrProgress(Math.min(95, 20 + Math.round(pct * 0.75)));
            setOcrStatusText(`Reading Hindi/English text: ${pct}%`);
          } else if (m.status) {
            setOcrStatusText(`OCR: ${m.status}...`);
          }
        }
      });

      const ret = await worker.recognize(file);
      await worker.terminate();

      const text = ret.data.text ? ret.data.text.trim() : '';

      setOcrProgress(100);
      setIsProcessing(false);

      if (!text || text.length < 5) {
        setErrorMessage('Could not extract readable text from this image. Please edit manually or try another screenshot.');
        setEditableText('');
        setExtractedText('');
        setShowConfirmModal(true);
      } else {
        setExtractedText(text);
        setEditableText(text);
        setShowConfirmModal(true);
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setIsProcessing(false);
      setErrorMessage('OCR extraction failed. You can paste the text manually into the editor.');
      setEditableText('');
      setShowConfirmModal(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleConfirmAndScan = () => {
    if (!editableText.trim()) {
      setErrorMessage('Extracted text cannot be empty.');
      return;
    }
    setShowConfirmModal(false);
    onTextExtracted(editableText.trim());
  };

  const handleClose = () => {
    setShowConfirmModal(false);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30'
            : 'border-slate-700/80 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isProcessing ? (
          <div className="py-2">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium text-cyan-300">{ocrStatusText}</p>
            <div className="w-48 max-w-full bg-slate-800 rounded-full h-1.5 mx-auto mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-teal-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-200">
                Upload Scam Screenshot for OCR Analysis
              </p>
              <p className="text-xs text-slate-400">
                Drag & drop or click to upload WhatsApp / SMS / Telegram screenshot
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-2 flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Confirmation & Editing Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Extracted Text</h3>
                <p className="text-xs text-slate-400">
                  Review or edit the OCR text before running scam intelligence analysis.
                </p>
              </div>
            </div>

            {imagePreview && (
              <div className="mb-4 max-h-32 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Scam screenshot"
                  className="max-h-32 object-contain"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1.5">
                Extracted Message (Editable):
              </label>
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                placeholder="No text extracted. Type or paste your message here..."
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndScan}
                disabled={!editableText.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Scan Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
