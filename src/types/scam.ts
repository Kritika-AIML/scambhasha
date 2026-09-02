export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type SignalType = 
  | 'urgency'
  | 'payment'
  | 'suspicious_url'
  | 'reward_bait'
  | 'impersonation'
  | 'credential_request'
  | 'personal_info'
  | 'threat'
  | 'fake_job'
  | 'fake_banking_kyc'
  | 'suspicious_cta';

export interface ScamSignal {
  type: SignalType;
  label: string;
  emoji: string;
  excerpt: string;
  points?: number; // Per-signal risk contribution for Live Build-up Meter (e.g., +18%)
  explanation?: string;
}

export interface UrlAnalysis {
  url_present: boolean;
  url: string | null;
  is_shortened: boolean;
  domain_suspicious: boolean;
  https_present: boolean;
  url_risk_score: number; // 0-100
  notes: string;
  detected_brand_mismatch?: string | null;
}

export interface ScamAnalysisResult {
  language: string; // e.g. "Hindi + Hinglish", "Devanagari Hindi", "Roman Hindi", "English"
  script: string; // e.g. "Roman Hindi", "Devanagari", "Mixed (Latin + Devanagari)", "Latin"
  normalization_applied: boolean;
  normalized_text?: string;
  english_gloss?: string; // 3-step Normalization X-Ray literal English translation
  scam_type: string; // e.g. "Fake KYC Scam", "Fake Work From Home Scam", "Lottery/Reward Scam", "Payment/Phishing Scam", "Not a Scam"
  risk_score: number; // 0-100
  risk_level: RiskLevel;
  signals: ScamSignal[];
  explanation: string;
  recommended_actions: string[];
  url_analysis: UrlAnalysis;
  message_risk_score: number;
  engine_used: 'deterministic_golden' | 'gemini_contextual' | 'rule_fallback';
  timestamp: string;
  raw_message: string;
}

export interface ScamReport {
  id: string;
  timestamp: string;
  message_excerpt: string;
  message_hash: string;
  scam_type: string;
  detected_signals: string[];
  domain: string | null;
  risk_level: RiskLevel;
  risk_score: number;
  additional_notes?: string;
  is_user_submitted: boolean;
}

export interface ScamCampaign {
  id: string;
  name: string;
  scam_type: string;
  report_count: number;
  risk_level: RiskLevel;
  common_signals: string[];
  common_domain?: string | null;
  trigger_reason: string;
  first_seen: string;
  last_seen: string;
  is_emerging: boolean;
  sample_excerpts: string[];
}

export interface SampleScam {
  id: string;
  title: string;
  tag: string;
  icon: string;
  text: string;
  previewText: string;
  expectedType: string;
}
