import { ScamAnalysisResult } from '../types/scam';
import { normalizeHindiText, generateLiteralEnglishGloss } from './normalizer';
import { analyzeUrlInMessage } from './urlAnalyzer';
import { analyzeScamDeterministic } from './ruleAnalyzer';

const GEMINI_SYSTEM_PROMPT = `
You are ScamBhasha AI — an expert Indian cybersecurity and linguistic intelligence system specializing in Hindi, Hinglish, Roman Hindi, and transliterated scam analysis.

TASK:
Analyze the provided message (which may be in Roman Hindi, Devanagari Hindi, Hinglish, or English). You will receive both the raw message and the rule-normalized text.

RULES:
1. Explain the threat clearly. Do NOT return a simple "spam" verdict.
2. Identify specific scam signals with EXACT excerpts from the text.
3. Classify the scam type (e.g., "Fake KYC Scam", "Fake Work From Home Scam", "Lottery/Reward Scam", "Payment/Phishing Scam", "Electricity Bill Scam", "Customs/Courier Scam", "Not a Scam").
4. Provide a literal plain-English translation ("english_gloss") of the message for the 3-step Normalization X-Ray view.
5. Provide structured risk metrics and actionable guidance.

RETURN ONLY VALID JSON conforming precisely to this schema (no markdown, no backticks, just raw JSON):
{
  "language": "Hindi + Hinglish | Roman Hindi | Devanagari Hindi | English",
  "script": "Roman Hindi | Devanagari | Mixed | Latin",
  "normalization_applied": true | false,
  "english_gloss": "Short literal English translation of the normalized message",
  "scam_type": "string",
  "risk_score": 0-100,
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "signals": [
    {
      "type": "urgency | payment | suspicious_url | reward_bait | impersonation | credential_request | personal_info | threat | fake_job | fake_banking_kyc | suspicious_cta",
      "label": "string",
      "emoji": "emoji icon",
      "excerpt": "exact substring from message",
      "points": 20
    }
  ],
  "explanation": "1-2 sentence plain-language summary of why this verdict was reached",
  "recommended_actions": ["action 1", "action 2", "action 3"]
}
`;

export async function analyzeMessageWithGemini(
  rawText: string,
  customApiKey?: string
): Promise<ScamAnalysisResult> {
  const norm = normalizeHindiText(rawText);
  const urlIntel = analyzeUrlInMessage(rawText);

  // Fallback to deterministic analyzer immediately if no API key is set
  const envKey = typeof import.meta !== 'undefined' && (import.meta as any)?.env
    ? (import.meta as any).env.VITE_GEMINI_API_KEY
    : undefined;
  const apiKey = customApiKey || envKey || '';
  
  if (!apiKey || apiKey.trim() === '') {
    console.info('[ScamBhasha Engine] No Gemini API key provided. Using deterministic linguistic & pattern engine.');
    return analyzeScamDeterministic(rawText);
  }

  try {
    const userPrompt = `
RAW INPUT MESSAGE:
"""${rawText}"""

RULE-NORMALIZED TEXT:
"""${norm.normalized_text}"""

URL HEURISTICS DETECTED:
${JSON.stringify(urlIntel, null, 2)}

Perform contextual classification, signal extraction with exact excerpts, and produce the JSON analysis.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: GEMINI_SYSTEM_PROMPT + '\n\n' + userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      console.warn(`[ScamBhasha Engine] Gemini API returned status ${response.status}. Gracefully falling back to deterministic analyzer.`);
      return analyzeScamDeterministic(rawText);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return analyzeScamDeterministic(rawText);
    }

    // Clean JSON response
    const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate fields strictly
    if (!parsed.scam_type || typeof parsed.risk_score !== 'number' || !Array.isArray(parsed.signals)) {
      return analyzeScamDeterministic(rawText);
    }

    const score = Math.max(0, Math.min(100, parsed.risk_score));
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

    return {
      language: parsed.language || norm.language,
      script: parsed.script || norm.script,
      normalization_applied: parsed.normalization_applied ?? norm.normalization_applied,
      normalized_text: norm.normalized_text,
      english_gloss: parsed.english_gloss || generateLiteralEnglishGloss(norm.normalized_text),
      scam_type: parsed.scam_type,
      risk_score: score,
      risk_level: riskLevel,
      signals: parsed.signals.map((s: any) => ({
        type: s.type || 'suspicious_cta',
        label: s.label || 'Detected Threat Signal',
        emoji: s.emoji || '⚠️',
        excerpt: s.excerpt || '',
        points: s.points || Math.max(5, Math.round(score / Math.max(1, parsed.signals.length)))
      })),
      explanation: parsed.explanation || 'Contextual pattern analysis completed.',
      recommended_actions: Array.isArray(parsed.recommended_actions) && parsed.recommended_actions.length > 0
        ? parsed.recommended_actions
        : ["❌ Do NOT click unverified links.", "📢 Verify with official channels."],
      url_analysis: urlIntel,
      message_risk_score: score,
      engine_used: 'gemini_contextual',
      timestamp: new Date().toISOString(),
      raw_message: rawText
    };
  } catch (err) {
    console.warn('[ScamBhasha Engine] Gemini analysis error, invoking robust deterministic fallback:', err);
    return analyzeScamDeterministic(rawText);
  }
}
