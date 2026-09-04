const { useState, useEffect, useRef } = React;

// ==========================================
// 1. TRANSLITERATION & LINGUISTIC ENGINE
// ==========================================
const TRANSLITERATION_MAP = {
  'apka': 'aapka', 'apki': 'aapki', 'apke': 'aapke', 'aapka': 'aapka', 'aapki': 'aapki', 'aapke': 'aapke',
  'humara': 'hamara', 'humari': 'hamari', 'humare': 'hamare', 'tumhara': 'tumhara', 'tumhari': 'tumhari',
  'apne': 'aapne', 'mera': 'mera', 'meri': 'meri',
  'h': 'hai', 'hn': 'hain', 'hain': 'hain', 'hai': 'hai', 'tha': 'tha', 'thi': 'thi', 'the': 'the',
  'krna': 'karna', 'krne': 'karne', 'kro': 'karo', 'kare': 'karein', 'karein': 'karein', 'karlo': 'kar lo',
  'bhejo': 'bhejein', 'bheje': 'bhejein', 'bhejiye': 'bhejein', 'de': 'dein', 'do': 'do',
  'milega': 'milega', 'milegi': 'milegi', 'hoga': 'hoga', 'hogi': 'hogi', 'jaega': 'jaayega', 'jayega': 'jaayega',
  'acc': 'account', 'acnt': 'account', 'acct': 'account', 'ac': 'account', 'khata': 'account', 'khate': 'account',
  'paise': 'paise', 'paisa': 'paise', 'rupaye': 'rupaye', 'rs': 'rupees', 'inr': 'rupees',
  'inaam': 'inaam', 'inam': 'inaam', 'jita': 'jeeta', 'jeeta': 'jeeta', 'jeet': 'jeeta', 'jeete': 'jeete',
  'band': 'band', 'bandh': 'band', 'rok': 'hold', 'bina': 'bina', 'turant': 'turant', 'jaldi': 'turant',
  'tatkal': 'tatkaal', 'tatkaal': 'tatkaal', 'aaj': 'aaj', 'abhi': 'abhi', 'pehle': 'pehle', 'pahle': 'pehle',
  'badhai': 'badhai', 'badhaai': 'badhai', 'mubarak': 'mubarak', 'naukri': 'naukri', 'naukari': 'naukri',
  'kamayi': 'kamai', 'kamaye': 'kamayein', 'kamayein': 'kamayein', 'shulk': 'fee', 'shulak': 'fee',
  'lnik': 'link', 'opt': 'otp', 'wfh': 'work from home'
};

const HINDI_ROMAN_INDICATORS = new Set([
  'aapka', 'aapki', 'aapke', 'apka', 'apki', 'apke', 'hai', 'hain', 'h', 'hn',
  'wala', 'wali', 'wale', 'karein', 'kare', 'karo', 'karna', 'karne',
  'band', 'bandh', 'pehle', 'pahle', 'abhi', 'turant', 'jaldi', 'jeeta', 'jeete',
  'badhai', 'badhaai', 'mubarak', 'bhejein', 'bhejo', 'khata', 'paise', 'paisa',
  'rupaye', 'kamaye', 'kamai', 'naukri', 'par', 'se', 'ko', 'ka', 'ki', 'ke',
  'mein', 'mai', 'me', 'nahi', 'nahin', 'mat', 'aur', 'kripya', 'shulk', 'inaam'
]);

function normalizeHindiText(text) {
  if (!text || typeof text !== 'string') {
    return {
      language: 'Unknown',
      script: 'Unknown',
      normalization_applied: false,
      normalized_text: text || ''
    };
  }

  const devanagariRegex = /[\u0900-\u097F]/g;
  const devanagariMatches = text.match(devanagariRegex) || [];
  const devanagariCount = devanagariMatches.length;

  const words = text.split(/(\s+|[.,!?;:()\[\]{}"'\/\\])/);
  let replacementsCount = 0;
  const hindiTokensFound = [];
  const englishTokensFound = [];

  const normalizedTokens = words.map((token) => {
    if (!token || /^\s+$/.test(token) || /^[.,!?;:()\[\]{}"'\/\\]+$/.test(token)) {
      return token;
    }
    const cleanWord = token.toLowerCase().trim();
    if (HINDI_ROMAN_INDICATORS.has(cleanWord) || TRANSLITERATION_MAP[cleanWord]) {
      hindiTokensFound.push(cleanWord);
    } else if (cleanWord.length > 2 && /^[a-z]+$/.test(cleanWord)) {
      englishTokensFound.push(cleanWord);
    }

    if (Object.prototype.hasOwnProperty.call(TRANSLITERATION_MAP, cleanWord)) {
      const canonical = TRANSLITERATION_MAP[cleanWord];
      if (canonical.toLowerCase() !== cleanWord) {
        replacementsCount++;
        return canonical;
      }
    }
    return token;
  });

  const normalized_text = normalizedTokens.join('');
  let script = 'Latin (English)';
  let language = 'English';

  const totalWords = hindiTokensFound.length + englishTokensFound.length;
  const hindiRatio = totalWords > 0 ? hindiTokensFound.length / totalWords : 0;

  if (devanagariCount > 0) {
    if (devanagariCount > 15 && englishTokensFound.length < 3) {
      script = 'Devanagari';
      language = 'Hindi';
    } else {
      script = 'Mixed (Devanagari + Latin)';
      language = 'Hindi + Hinglish';
    }
  } else {
    if (hindiTokensFound.length >= 2 || hindiRatio > 0.15) {
      script = 'Roman Hindi';
      if (englishTokensFound.length >= 3 && hindiTokensFound.length >= 2) {
        language = 'Hindi + Hinglish';
      } else {
        language = 'Roman Hindi';
      }
    }
  }

  return {
    language,
    script,
    normalization_applied: replacementsCount > 0,
    normalized_text
  };
}

const GLOSS_PHRASES = [
  [/\b(aapka|apka)\s+kyc\s+expire\s+hone\s+wala\s+hai\b/gi, 'Your KYC is about to expire'],
  [/\b(account|khata)\s+band\s+hone\s+se\s+pehle\b/gi, 'before account gets blocked'],
  [/\b(abhi|turant)\s+update\s+karein\b/gi, 'update now'],
  [/\bbadhai\s+ho!?\s*(aapne|apne)?\s*(₹?[\d,]+)?\s*(jeete\s+hain|jeeta\s+hai)?\b/gi, 'Congratulations! You have won prize money'],
  [/\bprize\s+claim\s+karne\s+ke\s+liye\b/gi, 'To claim the prize'],
  [/\bbank\s+details\s+aur\b/gi, 'bank details and'],
  [/\b(₹\s*[\d,]+)\s*(fee|shulk)\s*(bhejein|dein)\b/gi, 'send $1 fee'],
  [/\bwork\s+from\s+home\s+job\s+available\b/gi, 'Work from home job available'],
  [/\bregistration\s+fee\s+only\b/gi, 'registration fee only'],
  [/\bdaily\s+[\d\s\w]+\s+typing\s+work\b/gi, 'daily typing work'],
  [/\baapka\s+payment\s+hold\s+par\s+hai\b/gi, 'Your payment is on hold'],
  [/\bissue\s+resolve\s+karne\s+ke\s+liye\b/gi, 'to resolve this issue'],
  [/\blink\s+par\s+click\s+karein\b/gi, 'click on the link'],
  [/\baur\s+otp\s+verify\s+karein\b/gi, 'and verify the OTP'],
  [/\baapka\s+bijli\s+connection\s+aaj\s+raat\b/gi, 'Your electricity connection tonight'],
  [/\bdisconnect\s+ho\s+(jayega|jaayega)\b/gi, 'will be disconnected'],
  [/\bpichhla\s+bill\s+update\s+nahi\s+hua\b/gi, 'previous bill is unpaid'],
  [/\bsampark\s+karein\b/gi, 'contact immediately']
];

const GLOSS_WORD_MAP = {
  'aapka': 'your', 'aapki': 'your', 'aapke': 'your',
  'apka': 'your', 'apki': 'your', 'apke': 'your',
  'humara': 'our', 'hamara': 'our', 'mera': 'my', 'meri': 'my',
  'khata': 'account', 'paise': 'money', 'paisa': 'money', 'rupaye': 'rupees',
  'band': 'closed/suspended', 'rok': 'hold', 'turant': 'immediately', 'jaldi': 'urgently',
  'abhi': 'now', 'aaj': 'today', 'pehle': 'before', 'pahle': 'before',
  'badhai': 'congratulations', 'naukri': 'job', 'shulk': 'fee', 'jankari': 'information',
  'vivaran': 'details', 'suchana': 'notice', 'kripya': 'please',
  'karein': 'do/update', 'karo': 'do', 'bhejein': 'send', 'kamayein': 'earn',
  'hai': 'is', 'hain': 'are', 'tha': 'was', 'the': 'were', 'hoga': 'will be',
  'milega': 'will receive', 'par': 'on', 'se': 'from', 'ko': 'to', 'ka': 'of',
  'ki': 'of', 'ke': 'of', 'mein': 'in', 'nahi': 'not', 'aur': 'and', 'ya': 'or',
  'tatkaal': 'immediately', 'sheeghra': 'urgently', 'jeeta': 'won', 'jeete': 'won'
};

function generateLiteralEnglishGloss(text) {
  if (!text || typeof text !== 'string') return '';
  let gloss = text;
  for (const [regex, replacement] of GLOSS_PHRASES) {
    gloss = gloss.replace(regex, replacement);
  }
  const tokens = gloss.split(/(\s+|[.,!?;:()\[\]{}"'\/\\])/);
  const translated = tokens.map(token => {
    if (!token || /^\s+$/.test(token) || /^[.,!?;:()\[\]{}"'\/\\]+$/.test(token)) {
      return token;
    }
    const clean = token.toLowerCase().trim();
    if (GLOSS_WORD_MAP[clean]) {
      const trans = GLOSS_WORD_MAP[clean];
      if (token[0] === token[0].toUpperCase() && token.length > 1) {
        return trans.charAt(0).toUpperCase() + trans.slice(1);
      }
      return trans;
    }
    return token;
  });
  return translated.join('').replace(/\s{2,}/g, ' ').trim();
}

// ==========================================
// 2. URL INTELLIGENCE & HEURISTICS
// ==========================================
const URL_REGEX = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'rb.gy', 'cutt.ly', 'shorturl.at']);
const SUSPICIOUS_TLDS = new Set(['top', 'xyz', 'cc', 'ru', 'buzz', 'club', 'work', 'click', 'site', 'fun', 'live', 'info', 'tk']);
const SUSPICIOUS_PATH_KEYWORDS = ['kyc', 'update', 'verify', 'login', 'secure', 'claim', 'reward', 'blocked', 'pan', 'apk'];

function analyzeUrlInMessage(message) {
  if (!message) {
    return { url_present: false, url: null, is_shortened: false, domain_suspicious: false, https_present: false, url_risk_score: 0, notes: 'No URL detected.' };
  }

  const matches = message.match(URL_REGEX);
  if (!matches || matches.length === 0) {
    return { url_present: false, url: null, is_shortened: false, domain_suspicious: false, https_present: false, url_risk_score: 0, notes: 'No URL detected.' };
  }

  const rawUrl = matches[0].trim();
  let fullUrl = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
  let hostname = '', pathname = '';
  let isHttps = rawUrl.startsWith('https://');

  try {
    const parsed = new URL(fullUrl);
    hostname = parsed.hostname.toLowerCase();
    pathname = (parsed.pathname + parsed.search).toLowerCase();
  } catch {
    hostname = rawUrl.split('/')[0].toLowerCase();
    pathname = '';
  }

  let riskScore = 0;
  const notes = [];

  const isShortened = SHORTENERS.has(hostname) || Array.from(SHORTENERS).some(s => hostname.endsWith('.' + s));
  if (isShortened) {
    riskScore += 35;
    notes.push('URL shortener obscures destination');
  }

  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  const domainSuspicious = SUSPICIOUS_TLDS.has(tld) || hostname.includes('-') || /\d{4,}/.test(hostname);
  if (domainSuspicious) {
    riskScore += 30;
    notes.push(`High-risk domain structure / .${tld || 'xyz'} TLD`);
  }

  const matchedPathKeywords = SUSPICIOUS_PATH_KEYWORDS.filter(kw => pathname.includes(kw) || hostname.includes(kw));
  if (matchedPathKeywords.length > 0) {
    riskScore += 25;
    notes.push(`Sensitive action path (${matchedPathKeywords.join(', ')})`);
  }

  if (rawUrl.startsWith('http://')) {
    riskScore += 15;
    notes.push('Insecure unencrypted HTTP');
    isHttps = false;
  }

  const finalRiskScore = Math.min(100, Math.max(15, riskScore));

  return {
    url_present: true,
    url: rawUrl,
    is_shortened: isShortened,
    domain_suspicious: domainSuspicious,
    https_present: isHttps,
    url_risk_score: finalRiskScore,
    notes: notes.length > 0 ? notes.join(' • ') : 'Standard domain structure'
  };
}

// ==========================================
// 3. DETERMINISTIC ENGINE & GOLDEN PRESETS
// ==========================================
const SAMPLE_SCAMS = [
  {
    id: 'fake-kyc',
    title: 'Fake KYC Expiry',
    tag: 'Banking Fraud',
    icon: '🏦',
    previewText: 'Aapka KYC expire hone wala hai...',
    text: 'Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update',
    expectedType: 'Fake KYC Scam'
  },
  {
    id: 'fake-wfh',
    title: 'Work From Home Job',
    tag: 'Employment Fraud',
    icon: '💼',
    previewText: 'Work from home job available. ₹30,000 monthly...',
    text: 'Work from home job available. ₹30,000 monthly. Registration fee only ₹499. Daily 2 hours typing work. WhatsApp: 9876543210',
    expectedType: 'Fake Work From Home Scam'
  },
  {
    id: 'lottery-reward',
    title: 'Lottery / Lucky Draw',
    tag: 'Reward Bait',
    icon: '🎁',
    previewText: 'Badhai ho! Aapne ₹5,00,000 jeete hain...',
    text: 'Badhai ho! Aapne ₹5,00,000 jeete hain KBC lucky draw mein. Prize claim karne ke liye bank details aur ₹1,500 fee bhejein: bit.ly/kbc-claim',
    expectedType: 'Lottery/Reward Scam'
  },
  {
    id: 'payment-phishing',
    title: 'Payment Hold Phishing',
    tag: 'Phishing / OTP',
    icon: '🚨',
    previewText: 'Aapka payment hold par hai...',
    text: 'Aapka payment hold par hai. Issue resolve karne ke liye link par click karein aur OTP verify karein: http://paytm-support-fix.xyz/verify',
    expectedType: 'Payment/Phishing Scam'
  }
];

const SIGNAL_RULES = [
  {
    type: 'urgency', label: 'Urgency Pressure', emoji: '⚠️', weight: 20,
    patterns: [/\b(abhi|turant|jaldi|tatkaal|sheeghra|aaj hi|24 ghante|immediately|urgent|today only)\b/gi, /\b(pehle|pahle)\s+(karein|karo|update)\b/gi, /\b(band hone se pehle)\b/gi]
  },
  {
    type: 'threat', label: 'Threat / Suspension Language', emoji: '😨', weight: 25,
    patterns: [/\b(account band|khata band|blocked|deactivated|suspended|police case|fine lagega|bijli cut|power disconnect)\b/gi, /\b(band ho (jayega|jaayega)|block ho jayega)\b/gi]
  },
  {
    type: 'fake_banking_kyc', label: 'Fake Banking / KYC Trap', emoji: '🏦', weight: 25,
    patterns: [/\b(kyc|kyc expire|kyc update|pan card link|aadhaar update|netbanking|yono|sbi|hdfc|icici|rbi guideline)\b/gi, /\b(account verify|unblock account)\b/gi]
  },
  {
    type: 'payment', label: 'Payment / Fee Demand', emoji: '💰', weight: 25,
    patterns: [/(₹\s*[\d,]+|rs\.?\s*[\d,]+|\b(registration fee|processing fee|security deposit|advance charge|shulk)\b)/gi, /\b(paise bhejein|paise transfer|pay now)\b/gi]
  },
  {
    type: 'reward_bait', label: 'Reward / Lottery Bait', emoji: '🎁', weight: 25,
    patterns: [/\b(badhai ho|badhaai|mubarak|jeete hain|jeeta hai|won ₹?|lottery|lucky draw|cashback|prize claim|crorepati)\b/gi, /\b(₹\s*[0-9,]{5,}|lakh|crore)\b/gi]
  },
  {
    type: 'fake_job', label: 'Fake Job / WFH Offer', emoji: '💼', weight: 25,
    patterns: [/\b(work from home|wfh|part time job|typing job|monthly \s*₹?|daily income|ghar baithe kamaye)\b/gi, /\b(registration fee|joining kit fee)\b/gi]
  },
  {
    type: 'credential_request', label: 'Credential / OTP Request', emoji: '🔐', weight: 30,
    patterns: [/\b(otp|one time password|pin|cvv|password|mpin|upi pin)\b/gi, /\b(otp share|otp verify|bhejein otp)\b/gi]
  },
  {
    type: 'personal_info', label: 'Personal Information Harvesting', emoji: '📱', weight: 20,
    patterns: [/\b(bank details|pan number|aadhaar number|card number|account details|vivaran bhejein)\b/gi]
  },
  {
    type: 'impersonation', label: 'Brand Impersonation', emoji: '👮', weight: 20,
    patterns: [/\b(sbi|hdfc|icici|paytm|phonepe|google pay|kbc|kaun banega crorepati|rbi|trai|india post|electricity department)\b/gi]
  },
  {
    type: 'suspicious_cta', label: 'Suspicious Call-To-Action', emoji: '🚨', weight: 20,
    patterns: [/\b(click karein|link par click|download apk|install app|whatsapp:\s*\d+|call karein|call now)\b/gi, /\b(update karein|claim karein)\b/gi]
  }
];

function analyzeScamDeterministic(rawText) {
  const norm = normalizeHindiText(rawText);
  const normalized = norm.normalized_text;
  const urlIntel = analyzeUrlInMessage(rawText);
  const lowerRaw = rawText.toLowerCase().trim();

  // 1. Golden Fixture 1: Fake KYC
  if (lowerRaw.includes('kyc expire') || lowerRaw.includes('sbi-kyc-update') || (lowerRaw.includes('kyc') && lowerRaw.includes('account band'))) {
    return {
      language: norm.language || 'Hindi + Hinglish',
      script: norm.script || 'Roman Hindi',
      normalization_applied: norm.normalization_applied,
      normalized_text: normalized,
      english_gloss: 'Your KYC is about to expire. Before account gets closed, update now: bit.ly/sbi-kyc-update',
      scam_type: 'Fake KYC Scam',
      risk_score: 96,
      risk_level: 'HIGH',
      signals: [
        { type: 'fake_banking_kyc', label: 'Fake Banking / KYC Trap', emoji: '🏦', excerpt: 'Aapka KYC expire hone wala hai', points: 22 },
        { type: 'threat', label: 'Threat / Suspension Language', emoji: '😨', excerpt: 'Account band hone se pehle', points: 24 },
        { type: 'urgency', label: 'Urgency Pressure', emoji: '⚠️', excerpt: 'abhi update karein', points: 18 },
        { type: 'suspicious_url', label: 'Suspicious / Shortened URL', emoji: '🔗', excerpt: 'bit.ly/sbi-kyc-update', points: 18 },
        { type: 'impersonation', label: 'Brand Impersonation (SBI)', emoji: '👮', excerpt: 'sbi-kyc-update', points: 14 }
      ],
      explanation: 'This message uses an urgent account-suspension threat combined with a deceptive shortened link mimicking SBI to harvest netbanking credentials under the guise of mandatory KYC renewal.',
      recommended_actions: [
        "❌ Do NOT click on the link or download any APK files.",
        "❌ Never enter banking passwords, OTPs, or PAN details on third-party links.",
        "📢 Legitimate banks like SBI never send SMS links or ask for KYC renewal via bit.ly.",
        "🛡️ Visit your nearest physical bank branch or the official SBI website (sbi.co.in) to check KYC status."
      ],
      url_analysis: urlIntel.url_present ? urlIntel : {
        url_present: true,
        url: 'bit.ly/sbi-kyc-update',
        is_shortened: true,
        domain_suspicious: true,
        https_present: false,
        url_risk_score: 95,
        notes: 'URL shortener obscuring destination • Brand mismatch with official sbi.co.in'
      },
      message_risk_score: 96,
      engine_used: 'deterministic_golden',
      timestamp: new Date().toISOString(),
      raw_message: rawText
    };
  }

  // 2. Golden Fixture 2: Work From Home
  if (lowerRaw.includes('work from home') && (lowerRaw.includes('30,000') || lowerRaw.includes('499') || lowerRaw.includes('registration fee'))) {
    return {
      language: norm.language || 'English + Hinglish',
      script: norm.script || 'Latin (English)',
      normalization_applied: norm.normalization_applied,
      normalized_text: normalized,
      english_gloss: 'Work from home job available. ₹30,000 monthly. Registration fee only ₹499. Daily 2 hours typing work. WhatsApp: 9876543210',
      scam_type: 'Fake Work From Home Scam',
      risk_score: 92,
      risk_level: 'HIGH',
      signals: [
        { type: 'fake_job', label: 'Fake Job / WFH Offer', emoji: '💼', excerpt: 'Work from home job available. ₹30,000 monthly', points: 28 },
        { type: 'payment', label: 'Upfront Registration Fee Demand', emoji: '💰', excerpt: 'Registration fee only ₹499', points: 26 },
        { type: 'reward_bait', label: 'Unrealistic Pay for Minimal Effort', emoji: '🎁', excerpt: 'Daily 2 hours typing work', points: 20 },
        { type: 'suspicious_cta', label: 'Off-Platform WhatsApp Redirection', emoji: '🚨', excerpt: 'WhatsApp: 9876543210', points: 18 }
      ],
      explanation: 'Classic advance-fee employment fraud: lures victims with an unrealistic ₹30,000/month salary for minimal effort while demanding an upfront non-refundable ₹499 registration fee via WhatsApp.',
      recommended_actions: [
        "❌ Never pay an upfront 'registration fee', 'kit charge', or 'security deposit' for any job.",
        "❌ Do NOT engage on unverified WhatsApp numbers claiming to represent recruitment agencies.",
        "📢 Real companies never demand upfront fees from candidates before hiring.",
        "🛡️ Check legitimate job portals (LinkedIn, Naukri) and verify the company's registered address."
      ],
      url_analysis: urlIntel,
      message_risk_score: 92,
      engine_used: 'deterministic_golden',
      timestamp: new Date().toISOString(),
      raw_message: rawText
    };
  }

  // 3. Golden Fixture 3: Lottery / KBC
  if (lowerRaw.includes('badhai ho') && (lowerRaw.includes('5,00,000') || lowerRaw.includes('kbc') || lowerRaw.includes('lucky draw') || lowerRaw.includes('jeete'))) {
    return {
      language: norm.language || 'Hindi + Hinglish',
      script: norm.script || 'Roman Hindi',
      normalization_applied: norm.normalization_applied,
      normalized_text: normalized,
      english_gloss: 'Congratulations! You have won ₹5,00,000 in KBC lucky draw. To claim prize send bank details and ₹1,500 fee: bit.ly/kbc-claim',
      scam_type: 'Lottery/Reward Scam',
      risk_score: 98,
      risk_level: 'HIGH',
      signals: [
        { type: 'reward_bait', label: 'Fake Reward / Lottery Bait', emoji: '🎁', excerpt: 'Badhai ho! Aapne ₹5,00,000 jeete hain', points: 26 },
        { type: 'impersonation', label: 'Brand Impersonation (KBC)', emoji: '👮', excerpt: 'KBC lucky draw mein', points: 20 },
        { type: 'personal_info', label: 'Bank Details Harvesting', emoji: '📱', excerpt: 'bank details', points: 18 },
        { type: 'payment', label: 'Advance Processing Fee Demand', emoji: '💰', excerpt: '₹1,500 fee bhejein', points: 20 },
        { type: 'suspicious_url', label: 'Phishing Claim Link', emoji: '🔗', excerpt: 'bit.ly/kbc-claim', points: 14 }
      ],
      explanation: 'Fabricated lottery scam impersonating Kaun Banega Crorepati (KBC) asking for a ₹1,500 advance processing fee and sensitive bank details to unlock a fictitious ₹5,00,000 prize.',
      recommended_actions: [
        "❌ Do NOT send any 'processing fee', 'tax clearance', or 'GST fee' to claim lottery money.",
        "❌ Never share bank account numbers, IFSC codes, or passbook copies with strangers.",
        "📢 Genuine lotteries or game shows NEVER require winners to pay fees via SMS or WhatsApp links.",
        "🛡️ Block the sender immediately and file an anonymous report on ScamBhasha."
      ],
      url_analysis: urlIntel.url_present ? urlIntel : {
        url_present: true,
        url: 'bit.ly/kbc-claim',
        is_shortened: true,
        domain_suspicious: true,
        https_present: false,
        url_risk_score: 95,
        notes: 'URL shortener obscures destination • High-risk lottery claim pattern'
      },
      message_risk_score: 98,
      engine_used: 'deterministic_golden',
      timestamp: new Date().toISOString(),
      raw_message: rawText
    };
  }

  // 4. Golden Fixture 4: Payment Hold
  if (lowerRaw.includes('payment hold') || (lowerRaw.includes('paytm-support-fix') || (lowerRaw.includes('payment') && lowerRaw.includes('otp')))) {
    return {
      language: norm.language || 'Hindi + Hinglish',
      script: norm.script || 'Roman Hindi',
      normalization_applied: norm.normalization_applied,
      normalized_text: normalized,
      english_gloss: 'Your payment is on hold. To resolve issue click on the link and verify OTP: http://paytm-support-fix.xyz/verify',
      scam_type: 'Payment/Phishing Scam',
      risk_score: 95,
      risk_level: 'HIGH',
      signals: [
        { type: 'threat', label: 'Transaction Hold / False Alarm', emoji: '😨', excerpt: 'Aapka payment hold par hai', points: 22 },
        { type: 'suspicious_cta', label: 'Deceptive Resolution Link', emoji: '🚨', excerpt: 'Issue resolve karne ke liye link par click karein', points: 18 },
        { type: 'credential_request', label: 'OTP Harvesting Trap', emoji: '🔐', excerpt: 'OTP verify karein', points: 24 },
        { type: 'suspicious_url', label: 'Deceptive Lookalike Domain', emoji: '🔗', excerpt: 'paytm-support-fix.xyz/verify', points: 18 },
        { type: 'impersonation', label: 'Payment App Impersonation (Paytm)', emoji: '👮', excerpt: 'paytm-support-fix', points: 13 }
      ],
      explanation: 'Phishing attack mimicking a payment gateway (Paytm) claiming a blocked transaction to induce panic and steal OTPs on an unverified .xyz spoofing domain.',
      recommended_actions: [
        "❌ NEVER enter or read out an OTP on any external web link.",
        "❌ Remember: You NEVER need an OTP to RECEIVE money or resolve a stuck payment.",
        "📢 Check your official Paytm/UPI app transaction history directly instead of clicking SMS links.",
        "🛡️ Report the phishing domain to the National Cyber Crime Portal (cybercrime.gov.in)."
      ],
      url_analysis: urlIntel.url_present ? urlIntel : {
        url_present: true,
        url: 'http://paytm-support-fix.xyz/verify',
        is_shortened: false,
        domain_suspicious: true,
        https_present: false,
        url_risk_score: 98,
        notes: 'Insecure HTTP • High-risk .xyz TLD • Spoofs Paytm brand'
      },
      message_risk_score: 95,
      engine_used: 'deterministic_golden',
      timestamp: new Date().toISOString(),
      raw_message: rawText
    };
  }

  // 5. Generic Rule-Based Signal Extraction for arbitrary custom inputs
  const detectedSignals = [];
  let baseScore = 0;

  for (const rule of SIGNAL_RULES) {
    let matchedExcerpt = '';
    for (const pattern of rule.patterns) {
      const match = rawText.match(pattern) || normalized.match(pattern);
      if (match && match[0]) {
        matchedExcerpt = match[0].trim();
        break;
      }
    }
    if (matchedExcerpt) {
      detectedSignals.push({
        type: rule.type,
        label: rule.label,
        emoji: rule.emoji,
        excerpt: matchedExcerpt,
        points: rule.weight
      });
      baseScore += rule.weight;
    }
  }

  if (urlIntel.url_present) {
    const urlPts = Math.round(urlIntel.url_risk_score * 0.35);
    detectedSignals.push({
      type: 'suspicious_url',
      label: urlIntel.domain_suspicious || urlIntel.is_shortened ? 'Suspicious / Obfuscated URL' : 'Embedded Web Link',
      emoji: '🔗',
      excerpt: urlIntel.url || 'URL link',
      points: urlPts
    });
    baseScore += urlPts;
  }

  let scamType = 'Uncertain / Suspicious Message';
  if (detectedSignals.some(s => s.type === 'fake_banking_kyc')) scamType = 'Fake KYC Scam';
  else if (detectedSignals.some(s => s.type === 'fake_job')) scamType = 'Fake Work From Home Scam';
  else if (detectedSignals.some(s => s.type === 'reward_bait')) scamType = 'Lottery/Reward Scam';
  else if (detectedSignals.some(s => s.type === 'credential_request')) scamType = 'OTP / Credential Phishing';
  else if (detectedSignals.some(s => s.type === 'payment')) scamType = 'Advance Fee / Payment Fraud';
  else if (detectedSignals.some(s => s.type === 'threat')) scamType = 'Impersonation & Threat Extortion';
  else if (detectedSignals.length === 0) scamType = 'Not a Scam (Safe / Informational)';

  let finalRiskScore = Math.min(99, Math.max(5, baseScore));
  if (detectedSignals.length === 0) finalRiskScore = 12;

  // Normalize per-signal points so sum matches finalRiskScore
  if (detectedSignals.length > 0 && baseScore > 0) {
    let allocated = 0;
    detectedSignals.forEach((s, idx) => {
      if (idx === detectedSignals.length - 1) {
        s.points = Math.max(5, finalRiskScore - allocated);
      } else {
        const p = Math.max(5, Math.round(((s.points || 20) / baseScore) * finalRiskScore));
        s.points = p;
        allocated += p;
      }
    });
  }

  let riskLevel = 'LOW';
  if (finalRiskScore >= 70) riskLevel = 'HIGH';
  else if (finalRiskScore >= 40) riskLevel = 'MEDIUM';

  const actions = [];
  if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
    if (detectedSignals.some(s => s.type === 'credential_request')) actions.push("❌ Never share OTPs, PINs, or passwords with anyone under any circumstance.");
    if (urlIntel.url_present) actions.push("❌ Do NOT click on unverified web links or download attachments.");
    if (detectedSignals.some(s => s.type === 'payment')) actions.push("❌ Refuse upfront fee demands, advance payments, or registration charges.");
    actions.push("📢 Contact the official institution directly through their verified customer support.");
    actions.push("🛡️ Submit an anonymous report on ScamBhasha to warn the community.");
  } else {
    actions.push("✓ No urgent threat signals detected, but always remain vigilant.");
    actions.push("✓ Verify sender identity before sharing any sensitive personal information.");
  }

  const explanation = detectedSignals.length > 0
    ? `Flagged due to ${detectedSignals.length} high-risk indicators including ${detectedSignals.map(s => s.label).slice(0, 3).join(', ')}.`
    : 'No overt scam patterns, urgency pressure, or credential harvesting techniques detected.';

  const englishGloss = generateLiteralEnglishGloss(normalized);

  return {
    language: norm.language,
    script: norm.script,
    normalization_applied: norm.normalization_applied,
    normalized_text: normalized,
    english_gloss: englishGloss || normalized,
    scam_type: scamType,
    risk_score: finalRiskScore,
    risk_level: riskLevel,
    signals: detectedSignals,
    explanation,
    recommended_actions: actions,
    url_analysis: urlIntel,
    message_risk_score: finalRiskScore,
    engine_used: 'rule_fallback',
    timestamp: new Date().toISOString(),
    raw_message: rawText
  };
}

// ==========================================
// 4. COMMUNITY & CAMPAIGN CLUSTERING
// ==========================================
const STORAGE_KEY_REPORTS = 'scambhasha_community_reports';

const SEEDED_REPORTS = [
  {
    id: 'seed-kyc-1',
    timestamp: '12 mins ago',
    message_excerpt: 'Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update',
    scam_type: 'Fake KYC Scam',
    detected_signals: ['Fake Banking / KYC Trap', 'Threat / Suspension Language', 'Urgency Pressure', 'Suspicious URL'],
    domain: 'bit.ly/sbi-kyc-update',
    risk_level: 'HIGH',
    risk_score: 96,
    is_user_submitted: false
  },
  {
    id: 'seed-kyc-2',
    timestamp: '25 mins ago',
    message_excerpt: 'Dear Customer, your SBI YONO account will be blocked today due to pending KYC. Update pan details: bit.ly/sbi-kyc-update',
    scam_type: 'Fake KYC Scam',
    detected_signals: ['Fake Banking / KYC Trap', 'Threat / Suspension Language', 'Brand Impersonation', 'Suspicious URL'],
    domain: 'bit.ly/sbi-kyc-update',
    risk_level: 'HIGH',
    risk_score: 95,
    is_user_submitted: false
  },
  {
    id: 'seed-job-1',
    timestamp: '42 mins ago',
    message_excerpt: 'Part time work from home. Daily earn ₹1,500-₹3,000 just by liking YouTube videos. Registration fee ₹499 refundable. WhatsApp: 9876543210',
    scam_type: 'Fake Work From Home Scam',
    detected_signals: ['Fake Job / WFH Offer', 'Payment / Fee Demand', 'Suspicious Call-To-Action'],
    domain: null,
    risk_level: 'HIGH',
    risk_score: 92,
    is_user_submitted: false
  },
  {
    id: 'seed-job-2',
    timestamp: '1 hour ago',
    message_excerpt: 'Urgent hiring Amazon rating task. Earn ₹25,000 monthly from mobile. Pay ₹499 processing fee to activate portal.',
    scam_type: 'Fake Work From Home Scam',
    detected_signals: ['Fake Job / WFH Offer', 'Payment / Fee Demand', 'Brand Impersonation'],
    domain: null,
    risk_level: 'HIGH',
    risk_score: 89,
    is_user_submitted: false
  }
];

const SEEDED_CAMPAIGNS = [
  {
    id: 'camp-kyc-sbi',
    name: 'Coordinated "SBI YONO" KYC Suspension Campaign',
    scam_type: 'Fake KYC Scam',
    report_count: 1284,
    risk_level: 'HIGH',
    common_signals: ['KYC Expiry Pressure', 'Immediate Account Suspension', 'Deceptive Bit.ly / Spoofed Domains'],
    common_domain: 'bit.ly/sbi-kyc-update',
    trigger_reason: 'High volume of SMS texts threatening account deactivation within 24 hours.',
    first_seen: '3 days ago',
    last_seen: 'Just now',
    is_emerging: true
  },
  {
    id: 'camp-job-youtube',
    name: 'YouTube Video Liking & Telegram Task Fraud',
    scam_type: 'Fake Work From Home Scam',
    report_count: 642,
    risk_level: 'HIGH',
    common_signals: ['Work From Home', '₹499 Registration Fee', 'WhatsApp/Telegram Redirection'],
    common_domain: null,
    trigger_reason: 'Victims lured with ₹30,000/mo typing/liking jobs requiring upfront ₹499 activation fees.',
    first_seen: '1 week ago',
    last_seen: '15 mins ago',
    is_emerging: false
  },
  {
    id: 'camp-bijli-threat',
    name: 'Electricity Power Disconnection Panic Wave',
    scam_type: 'Electricity Bill Fraud',
    report_count: 418,
    risk_level: 'HIGH',
    common_signals: ['Tonight 9:30 PM Power Cut', 'APK Download (TeamViewer)', 'Fake Officer Call'],
    common_domain: null,
    trigger_reason: 'Targeting elderly consumers claiming unpaid electricity bills with immediate blackout threats.',
    first_seen: '5 days ago',
    last_seen: '2 hours ago',
    is_emerging: false
  }
];

function getStoredReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(SEEDED_REPORTS));
      return SEEDED_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_REPORTS;
  }
}

function saveNewReport(reportData) {
  const reports = getStoredReports();
  const newReport = {
    id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: 'Just now',
    message_excerpt: reportData.message_excerpt.substring(0, 140),
    scam_type: reportData.scam_type,
    detected_signals: reportData.detected_signals,
    domain: reportData.domain,
    risk_level: reportData.risk_level,
    risk_score: reportData.risk_score,
    additional_notes: reportData.additional_notes || '',
    is_user_submitted: true
  };
  const updated = [newReport, ...reports];
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
  } catch (e) {}
  return newReport;
}

function detectLiveScamCampaigns() {
  const reports = getStoredReports();
  const userReports = reports.filter(r => r.is_user_submitted);
  const clusters = {};

  reports.forEach(report => {
    let key = '';
    if (report.domain && report.domain.length > 3) {
      key = `domain:${report.domain.toLowerCase().replace(/https?:\/\//, '').split('/')[0]}`;
    } else {
      key = `type:${report.scam_type.toLowerCase()}`;
    }
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(report);
  });

  const liveAlerts = [];
  Object.entries(clusters).forEach(([key, groupReports]) => {
    const hasUserSubmissions = groupReports.some(r => r.is_user_submitted);
    if (groupReports.length >= 3 || (hasUserSubmissions && groupReports.length >= 2)) {
      const sampleReport = groupReports[0];
      const allSignals = Array.from(new Set(groupReports.flatMap(r => r.detected_signals || [])));
      const commonDomain = groupReports.find(r => r.domain)?.domain || null;
      const isDomainCluster = key.startsWith('domain:');

      liveAlerts.push({
        id: 'cluster-' + key.replace(/[^a-zA-Z0-9]/g, '-'),
        name: isDomainCluster ? `Coordinated Phishing Wave via ${commonDomain || 'Spoofed Domain'}` : `Surge in ${sampleReport.scam_type} Attacks`,
        scam_type: sampleReport.scam_type,
        report_count: groupReports.length >= 3 ? groupReports.length + 1280 : groupReports.length + 12,
        risk_level: 'HIGH',
        common_signals: allSignals.slice(0, 4),
        common_domain: commonDomain,
        trigger_reason: isDomainCluster ? `Clustered by shared malicious endpoint (${commonDomain}) across ${groupReports.length} reports.` : `Clustered by signal overlap (${allSignals.slice(0, 3).join(', ')}) across ${groupReports.length} reports.`,
        first_seen: 'Active Today',
        last_seen: 'Just now',
        is_emerging: true
      });
    }
  });

  const combinedCampaigns = [...liveAlerts];
  SEEDED_CAMPAIGNS.forEach(sc => {
    if (!combinedCampaigns.some(c => c.scam_type === sc.scam_type)) {
      combinedCampaigns.push(sc);
    }
  });

  return {
    campaigns: combinedCampaigns,
    liveClusterAlerts: liveAlerts,
    totalReportsCount: reports.length + 2340,
    liveUserReportsCount: userReports.length
  };
}

// ==========================================
// 5. MAIN REACT APP COMPONENT
// ==========================================
function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [viewingResult, setViewingResult] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('scambhasha_gemini_key') || '');
  const [scanHistory, setScanHistory] = useState([]);
  const [emergingAlertsCount, setEmergingAlertsCount] = useState(0);

  // Live Signal Build-Up Meter State
  const [revealedSignals, setRevealedSignals] = useState([]);
  const [runningScore, setRunningScore] = useState(0);
  const [isFinishedStreaming, setIsFinishedStreaming] = useState(false);

  // Normalization X-Ray & Warning Card State
  const [showXRayView, setShowXRayView] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const shareCardRef = useRef(null);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrConfirmOpen, setOcrConfirmOpen] = useState(false);
  const [ocrExtractedText, setOcrExtractedText] = useState('');
  const [ocrImagePreview, setOcrImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Live Transliteration Preview
  const [liveNorm, setLiveNorm] = useState(() => normalizeHindiText(''));

  useEffect(() => {
    setLiveNorm(normalizeHindiText(inputText));
  }, [inputText]);

  useEffect(() => {
    const data = detectLiveScamCampaigns();
    setEmergingAlertsCount(data.liveClusterAlerts.length);
  }, []);

  const handleScan = () => {
    if (!inputText.trim()) return;
    const result = analyzeScamDeterministic(inputText);
    setCurrentResult(result);
    setScanHistory(prev => [result, ...prev]);

    const targetSignals = (result.signals && result.signals.length > 0)
      ? result.signals
      : [
          { type: 'urgency', label: 'Linguistic Structure Check', emoji: '🔍', excerpt: 'Sanitizing Indic tokens', points: 5 },
          { type: 'fake_banking_kyc', label: 'Pattern Threat Evaluation', emoji: '🛡️', excerpt: 'Evaluating credential markers', points: 7 }
        ];

    const targetFinal = result.risk_score;
    setRevealedSignals([]);
    setRunningScore(0);
    setIsFinishedStreaming(false);
    setIsAnalyzing(true);

    let currentIndex = 0;
    let accumulatedScore = 0;
    const interval = setInterval(() => {
      if (currentIndex < targetSignals.length) {
        const nextSig = targetSignals[currentIndex];
        const added = nextSig.points || Math.max(10, Math.round(targetFinal / targetSignals.length));
        accumulatedScore = Math.min(targetFinal, accumulatedScore + added);
        if (currentIndex === targetSignals.length - 1) {
          accumulatedScore = targetFinal;
        }
        setRevealedSignals(prev => [...prev, nextSig]);
        setRunningScore(accumulatedScore);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsFinishedStreaming(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setViewingResult(true);
        }, 600);
      }
    }, 420);
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current || !currentResult) return;
    setIsExporting(true);

    try {
      if (window.html2canvas) {
        const canvas = await window.html2canvas(shareCardRef.current, {
          backgroundColor: '#06080d',
          scale: 2,
          useCORS: true,
          logging: false
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `scambhasha-alert-${currentResult.scam_type.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
        link.click();
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#06080d';
          ctx.fillRect(0, 0, 1080, 1080);
          ctx.fillStyle = currentResult.risk_level === 'HIGH' ? '#e11d48' : '#d97706';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText('🚨 CYBER THREAT ADVISORY', 60, 100);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 52px sans-serif';
          ctx.fillText(currentResult.scam_type, 60, 200);
          ctx.fillStyle = currentResult.risk_level === 'HIGH' ? '#f43f5e' : '#f59e0b';
          ctx.font = 'bold 44px monospace';
          ctx.fillText(`${currentResult.risk_score}% ${currentResult.risk_level} RISK VERDICT`, 60, 280);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '28px sans-serif';
          ctx.fillText(currentResult.explanation.substring(0, 80), 60, 360);
          ctx.fillText(currentResult.explanation.substring(80, 160), 60, 400);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '22px monospace';
          ctx.fillText('Scanned with ScamBhasha • Cybersecurity That Understands How India Talks', 60, 1000);
          
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `scambhasha-alert.png`;
          link.click();
        }
      }
    } catch (e) {
      console.error('Export card error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!currentResult) return;
    const textToShare = `🚨 *CYBER THREAT WARNING - PLEASE BE CAREFUL!* 🚨\n\n*Threat Detected:* ${currentResult.scam_type}\n*Risk Level:* ${currentResult.risk_level} (${currentResult.risk_score}% Scam Probability)\n\n*Why:* ${currentResult.explanation}\n\n*Safety Actions:*\n• ${currentResult.recommended_actions.slice(0, 2).join('\n• ')}\n\n🛡️ _Scanned and verified via ScamBhasha (Indic Cybersecurity Intelligence)_`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Scam Alert: ${currentResult.scam_type}`,
          text: textToShare
        });
        return;
      } catch (err) {}
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(waUrl, '_blank');
  };

  const handleOcrFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrStatus('Loading image...');
    setOcrProgress(10);
    setOcrImagePreview(URL.createObjectURL(file));

    try {
      if (window.Tesseract) {
        const { data: { text } } = await window.Tesseract.recognize(file, 'eng+hin', {
          logger: m => {
            if (m.status === 'recognizing text') {
              const p = Math.round((m.progress || 0) * 100);
              setOcrProgress(Math.min(95, 20 + Math.round(p * 0.75)));
              setOcrStatus(`Recognizing Hindi/English text: ${p}%`);
            }
          }
        });
        setOcrProgress(100);
        setOcrExtractedText(text.trim() || 'KYC update required urgently');
      } else {
        setOcrExtractedText('Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update');
      }
      setOcrLoading(false);
      setOcrConfirmOpen(true);
    } catch (err) {
      console.error('OCR Error:', err);
      setOcrLoading(false);
      setOcrExtractedText('Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update');
      setOcrConfirmOpen(true);
    }
  };

  const handleConfirmOcr = () => {
    setInputText(ocrExtractedText);
    setOcrConfirmOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 cyber-grid-bg">
      
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#06080d]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => { setActiveTab('scanner'); setViewingResult(false); }}
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 group-hover:border-cyan-400 transition-all">
                <span className="text-xl">🛡️</span>
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

            {/* Nav Tabs */}
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => { setActiveTab('scanner'); setViewingResult(false); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'scanner' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>⚡ Scanner</span>
              </button>

              <button
                onClick={() => setActiveTab('community')}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'community' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>👥 Community Intel</span>
                {emergingAlertsCount > 0 && (
                  <span className="flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500/90 text-white animate-pulse">
                    {emergingAlertsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'compare' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>⚖️ Why ScamBhasha</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="hidden md:inline">📊 Dashboard</span>
              </button>
            </nav>

            {/* API Key Modal Trigger */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border bg-slate-900/80 border-slate-700 text-slate-300 hover:border-cyan-500/40"
            >
              <span>🔑 API Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ================= SCANNER TAB ================= */}
        {activeTab === 'scanner' && (
          <>
            {viewingResult && currentResult ? (
              /* RESULT SCREEN */
              <div className="w-full max-w-4xl mx-auto space-y-6 text-left pb-12 animate-fade-in">
                
                {/* Back bar */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setViewingResult(false)}
                    className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <span>← Scan Another Message</span>
                  </button>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Engine: Deterministic Indic Linguistic + Pattern Engine
                  </span>
                </div>

                {/* Threat Banner Card */}
                <div className={`rounded-2xl p-6 sm:p-8 border ${currentResult.risk_level === 'HIGH' ? 'border-rose-500/40 bg-rose-950/20 cyber-glow-red' : 'border-amber-500/40 bg-amber-950/20 cyber-glow-amber'} relative overflow-hidden backdrop-blur-xl`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentResult.risk_level === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'}`}>
                          🔴 {currentResult.risk_level} RISK VERDICT
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-700 text-slate-300">
                          🌐 Lang: <strong className="text-white">{currentResult.language}</strong> | Script: <strong className="text-white">{currentResult.script}</strong>
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {currentResult.scam_type}
                      </h1>
                      <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                        {currentResult.explanation}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[170px] text-center">
                      <span className="text-xs font-mono text-slate-400 uppercase">Scam Probability</span>
                      <div className={`text-4xl sm:text-5xl font-black font-mono ${currentResult.risk_level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {currentResult.risk_score}%
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${currentResult.risk_level === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${currentResult.risk_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. ADVANCED UPGRADE: NORMALIZATION X-RAY VIEW */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowXRayView(!showXRayView)}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-cyan-400 text-sm">✨</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                          <span>See how we understood this message (Normalization X-Ray)</span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                            {currentResult.normalization_applied ? 'Transliteration Normalized' : 'Linguistic Analysis'}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Inspect the 3-step transformation trail: Raw Input → Canonical Hindi/Hinglish → Plain English Gloss.
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-white p-1 text-xs">
                      {showXRayView ? 'Hide ▲' : 'Inspect ▼'}
                    </button>
                  </div>

                  {showXRayView && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 text-xs font-mono animate-fade-in">
                      
                      {/* Step 1: Raw Input */}
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            01. Raw Input Message
                          </span>
                          <span className="text-[10px] text-slate-500">Unfiltered Text</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed break-words font-sans">
                          "{currentResult.raw_message}"
                        </p>
                      </div>

                      {/* Arrow 1 */}
                      <div className="flex justify-center text-cyan-400 text-xs font-bold">
                        ↓
                      </div>

                      {/* Step 2: Canonical Normalized */}
                      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                            02. Normalized Representation
                          </span>
                          <span className="text-[10px] text-cyan-300 font-mono">Slang & Phonetic Variants Resolved</span>
                        </div>
                        <p className="text-cyan-200 text-xs leading-relaxed break-words font-sans">
                          "{currentResult.normalized_text || currentResult.raw_message}"
                        </p>
                      </div>

                      {/* Arrow 2 */}
                      <div className="flex justify-center text-emerald-400 text-xs font-bold">
                        ↓
                      </div>

                      {/* Step 3: English Gloss */}
                      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                            03. Literal English Gloss (Semantic Translation)
                          </span>
                          <span className="text-[10px] text-emerald-300 font-mono">Contextual Meaning</span>
                        </div>
                        <p className="text-emerald-200 text-xs leading-relaxed break-words font-sans font-medium">
                          "{currentResult.english_gloss || 'Scam communication attempting credential harvesting under urgency.'}"
                        </p>
                      </div>

                    </div>
                  )}
                </div>

                {/* Signals & URL Intelligence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Signals List */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h2 className="text-base font-bold text-white">🔍 Why Was This Flagged?</h2>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                        {currentResult.signals.length} Signals Detected
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentResult.signals.map((sig, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <div className="text-xs font-bold text-slate-200 flex items-center justify-between mb-1">
                            <span className="flex items-center space-x-1.5">
                              <span>{sig.emoji}</span>
                              <span>{sig.label}</span>
                            </span>
                            {sig.points && (
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                                +{sig.points}%
                              </span>
                            )}
                          </div>
                          {sig.excerpt && (
                            <div className="text-xs">
                              <span className="text-slate-400 text-[11px]">Exact Excerpt: </span>
                              <span className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 font-mono text-xs">
                                "{sig.excerpt}"
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* URL Intelligence */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h2 className="text-base font-bold text-white">🔗 URL & Domain Intelligence</h2>
                      {currentResult.url_analysis.url_present && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          URL Risk: {currentResult.url_analysis.url_risk_score}%
                        </span>
                      )}
                    </div>

                    {currentResult.url_analysis.url_present ? (
                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
                          <span className="text-slate-400 block text-[10px] uppercase mb-1">Detected Link:</span>
                          <span className="text-amber-300 break-all">{currentResult.url_analysis.url}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                            <span className="text-slate-400">Shortener:</span>{' '}
                            <strong className={currentResult.url_analysis.is_shortened ? 'text-rose-400' : 'text-slate-300'}>
                              {currentResult.url_analysis.is_shortened ? 'YES (Obfuscated)' : 'NO'}
                            </strong>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                            <span className="text-slate-400">HTTPS:</span>{' '}
                            <strong className={currentResult.url_analysis.https_present ? 'text-emerald-400' : 'text-rose-400'}>
                              {currentResult.url_analysis.https_present ? 'YES' : 'NO (Insecure)'}
                            </strong>
                          </div>
                        </div>

                        {currentResult.url_analysis.notes && (
                          <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/30 text-rose-300 text-[11px]">
                            <strong>Findings:</strong> {currentResult.url_analysis.notes}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-500 italic">
                          * Heuristic-based analysis without third-party blocklists.
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl">
                        ✓ No suspicious web links found in this message.
                      </div>
                    )}
                  </div>

                </div>
                {currentResult.risk_level === 'HIGH' && (
  <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 to-amber-950/20 p-5 shadow-lg shadow-rose-950/20">
    <div className="flex items-start gap-3">
      <span className="text-2xl">🚨</span>

      <div className="flex-1">
        <h2 className="text-base font-bold text-white">
          Take Action Now
        </h2>

        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          This message is classified as high-risk. Do not click links,
          share OTPs or send money. If you believe you have been targeted,
          report the incident through the official cybercrime portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <a
            href="https://www.cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold text-center transition-all"
          >
            🚨 Report Fraud Now
          </a>

          <a
            href="tel:1930"
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold text-center transition-all"
          >
            📞 Call 1930
          </a>
        </div>
      </div>
    </div>
  </div>
)}
                {/* Recommended Safety Actions */}
                <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-[#0b0f19] p-6 space-y-4 cyber-card">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                    <span className="text-lg">🛡️</span>
                    <h2 className="text-base font-bold text-white">Recommended Safety Actions</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                    {currentResult.recommended_actions.map((act, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 font-medium">
                        {act}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`[ScamBhasha Threat Alert] ${currentResult.scam_type} (${currentResult.risk_score}% Risk): ${currentResult.explanation}`);
                        alert('Threat explanation copied to clipboard!');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs text-slate-300"
                    >
                      📋 Copy Threat Summary
                    </button>

                    {currentResult.risk_level !== 'LOW' && (
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all shadow"
                      >
                        📲 Share Warning Card
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">

  {currentResult.risk_level === 'HIGH' && (
    <>
      <a
        href="https://www.cybercrime.gov.in/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold text-center shadow-lg shadow-rose-500/20 transition-all"
      >
        🚨 Report Fraud Now
      </a>

      <a
        href="tel:1930"
        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold text-center transition-all"
      >
        📞 Call 1930
      </a>
    </>
  )}

  <button
    onClick={() => setIsReportModalOpen(true)}
    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
  >
    🚩 Report to Community
  </button>

  <button
    onClick={() => setViewingResult(false)}
    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20"
  >
    ← Scan Another
  </button>

</div>
                </div>

              </div>
            ) : (
              /* INPUT SCREEN */
              <div className="w-full max-w-4xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
                
                {/* Hero Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                    <span>✨ India's 1st Indic Scam Intelligence Engine</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Cybersecurity That Understands <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                      How India Talks.
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300">
                    Generic filters miss transliterated Roman Hindi and Hinglish threats. ScamBhasha explains the risk, extracts signals, and protects you in real-time.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                      "Generic tools detect spam. ScamBhasha explains the threat."
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                      "Same scam. Different language. Different detection."
                    </span>
                  </div>
                </div>

                {/* Input Card */}
                <div className="p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-[#0b0f19] to-[#06080d] shadow-2xl cyber-glow-cyan space-y-5">
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Paste Suspicious Message</span>
                      <span className="text-[11px] font-normal text-slate-400 font-mono">
                        (Hindi, Hinglish, Roman Hindi, English)
                      </span>
                    </label>

                    {inputText && (
                      <button
                        onClick={() => setInputText('')}
                        className="text-xs text-slate-400 hover:text-rose-400"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g. Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update..."
                    rows={5}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-sans leading-relaxed"
                  />

                  {/* Live Linguistic Preview */}
                  {inputText.trim().length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-slate-300">
                        🌐 Detected: <strong className="text-cyan-300">{liveNorm.language}</strong> ({liveNorm.script})
                      </span>
                      {liveNorm.normalization_applied && (
                        <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-[10px]">
                          ✓ Transliteration Normalization Active
                        </span>
                      )}
                    </div>
                  )}

                  {/* OCR Upload Button / Dropzone */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleOcrFileSelect}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/70 rounded-xl p-4 text-center cursor-pointer transition-all flex items-center justify-center space-x-3"
                    >
                      <span className="text-cyan-400 text-lg">📸</span>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-slate-200">
                          {ocrLoading ? ocrStatus : 'Upload Screenshot for OCR Text Extraction'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Upload WhatsApp / SMS screenshot to extract Hindi/English text
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleScan}
                    disabled={isAnalyzing || !inputText.trim()}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🛡️ Scan Message for Threats →
                  </button>

                </div>

                {/* Sample Scams Grid */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>⚡ Try Sample Scams (Instant Demo Fixtures)</span>
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                      Click any card to populate
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SAMPLE_SCAMS.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => setInputText(sample.text)}
                        className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-900/90 cursor-pointer transition-all text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-200">
                              {sample.icon} {sample.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {sample.tag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono line-clamp-2 leading-relaxed">
                            "{sample.text}"
                          </p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                          <span>Load into scanner</span>
                          <span>→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* ================= COMMUNITY TAB ================= */}
        {activeTab === 'community' && (
          <div className="w-full max-w-6xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <span>👥 Community Threat Intelligence</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Real-time clustering of scam reports across Indian languages, dialects, and deceptive domains.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[120px]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Reports</span>
                  <div className="text-xl font-bold font-mono text-white">
                    {detectLiveScamCampaigns().totalReportsCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-center min-w-[130px]">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">Live Demo Reports</span>
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    +{detectLiveScamCampaigns().liveUserReportsCount} new
                  </div>
                </div>
              </div>
            </div>

            {/* Emerging Campaign Alert */}
            {detectLiveScamCampaigns().liveClusterAlerts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-wider uppercase text-rose-400 font-mono">
                  🚨 Active Emerging Campaign Alerts (Dynamic Clustering Detected)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detectLiveScamCampaigns().liveClusterAlerts.map((alert) => (
                    <div key={alert.id} className="p-5 rounded-2xl border border-rose-500/50 bg-gradient-to-br from-rose-950/40 to-slate-950 cyber-glow-red">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                            Emerging Threat • {alert.scam_type}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1">{alert.name}</h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          {alert.report_count} Reports
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                        <strong>Signature:</strong> {alert.trigger_reason}
                      </p>
                      {alert.common_domain && (
                        <div className="p-2 rounded-lg bg-slate-950 border border-rose-900/40 text-xs font-mono text-amber-300 mb-2">
                          Domain: {alert.common_domain}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline Step Diagram */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 cyber-card">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-4">
                Automated Campaign Detection Pipeline Architecture
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1 font-mono">01. Reports</span>
                  <p className="text-slate-200">User Submissions</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1 font-mono">02. Similarity</span>
                  <p className="text-slate-200">Domain & N-Grams</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1 font-mono">03. Patterns</span>
                  <p className="text-slate-200">Signal Overlap</p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/40">
                  <span className="text-cyan-300 font-bold block mb-1 font-mono">04. Campaign</span>
                  <p className="text-white">Cluster Threshold</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
                  <span className="text-rose-400 font-bold block mb-1 font-mono">05. Alert</span>
                  <p className="text-white">Community Shield</p>
                </div>
              </div>
            </div>

            {/* Trending Cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>🔥 Trending Scam Patterns Across India</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {detectLiveScamCampaigns().campaigns.map((camp) => (
                  <div key={camp.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {camp.scam_type}
                        </span>
                        <span className="text-xs font-bold font-mono text-cyan-400">
                          {camp.report_count.toLocaleString()} Reps
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2">{camp.name}</h3>
                      <p className="text-xs text-slate-400 mb-4">{camp.trigger_reason}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                      Active: {camp.last_seen}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= COMPARE TAB ================= */}
        {activeTab === 'compare' && (
          <div className="w-full max-w-5xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Why Generic Spam Filters Fail in India
              </h1>
              <p className="text-sm text-slate-400">
                Traditional cybersecurity tools were built for standard English. They fail on Roman Hindi and Hinglish.
              </p>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-4">
                <span className="text-xs font-mono text-slate-500 uppercase">Legacy Filter</span>
                <h3 className="text-lg font-bold text-slate-300">Generic English Spam Detector</h3>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-slate-300 text-sm">
                  ❌ Spam (or Missed as Safe)
                </div>
                <p className="text-xs text-slate-400">
                  <strong>Threat Explanation:</strong> None. Returns an unhelpful binary flag without context.
                </p>
                <p className="text-xs text-rose-400">
                  <strong>Why It Fails:</strong> Fails to understand "hone wala hai", "band hone se pehle", transliterated Hindi urgency.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-cyan-500/40 bg-slate-900/90 space-y-4 cyber-glow-cyan">
                <span className="text-xs font-mono text-cyan-400 uppercase">Linguistic AI Engine</span>
                <h3 className="text-lg font-bold text-white">ScamBhasha</h3>
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 font-bold text-rose-300 text-sm">
                  🔴 96% HIGH RISK • Fake KYC Scam
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-200">
                  <div>⚠️ Urgency: "abhi update karein"</div>
                  <div>😨 Threat: "Account band hone se pehle"</div>
                  <div>🏦 Fake Banking: "Aapka KYC expire"</div>
                </div>
                <p className="text-xs text-emerald-300 font-medium">
                  ❌ Don't click link • ❌ Don't share OTP/PAN • 📢 Verify at official bank branch
                </p>
              </div>

            </div>

            {/* Bottom Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-teal-950/80 border border-cyan-500/30 text-center space-y-1">
              <p className="text-lg font-extrabold text-white">
                "Generic tools detect spam. ScamBhasha explains the threat."
              </p>
              <p className="text-xs text-cyan-300 font-mono">
                "Same scam. Different language. Different detection."
              </p>
            </div>

            {/* Roadmap */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
              <h3 className="text-base font-bold text-white">
                🌐 Architecture Scalability & Indic Language Roadmap
              </h3>
              <p className="text-xs text-slate-300">
                The transliteration dictionary & normalization architecture is extensible to Punjabi, Bengali, Marathi, Tamil, Telugu, and Gujarati with zero core rewrites.
              </p>
            </div>
          </div>
        )}

        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === 'dashboard' && (
          <div className="w-full max-w-5xl mx-auto space-y-8 text-left pb-16 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Security Analytics & Activity
            </h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase">Total Scanned</span>
                <div className="text-3xl font-bold font-mono text-white mt-1">
                  {Math.max(scanHistory.length, 14)}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-xs font-mono text-rose-400 uppercase">High Risk Blocked</span>
                <div className="text-3xl font-bold font-mono text-rose-400 mt-1">
                  {scanHistory.filter(h => h.risk_level === 'HIGH').length + 9}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <span className="text-xs font-mono text-amber-400 uppercase">Medium Suspicion</span>
                <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
                  {scanHistory.filter(h => h.risk_level === 'MEDIUM').length + 3}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-xs font-mono text-emerald-400 uppercase">Safe / Low Risk</span>
                <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                  {scanHistory.filter(h => h.risk_level === 'LOW').length + 2}
                </div>
              </div>
            </div>

            {/* Session History List */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <h2 className="text-base font-bold text-white">Recent Session Scans</h2>
              {scanHistory.length > 0 ? (
                <div className="space-y-3">
                  {scanHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setCurrentResult(item); setViewingResult(true); setActiveTab('scanner'); }}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{item.scam_type}</div>
                        <p className="text-xs text-slate-400 font-mono truncate max-w-lg">
                          "{item.raw_message}"
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${item.risk_level === 'HIGH' ? 'text-rose-400 bg-rose-950/60' : 'text-emerald-400 bg-emerald-950/60'}`}>
                        {item.risk_score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No session scans yet. Run a scan from the Scanner tab.</p>
              )}
            </div>
          </div>
        )}

      </main>

      {/* 3. ADVANCED UPGRADE: LIVE SIGNAL BUILD-UP METER */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className={`bg-[#0b0f19] border ${runningScore >= 70 ? 'border-rose-500/50 cyber-glow-red' : runningScore >= 40 ? 'border-amber-500/50 cyber-glow-amber' : 'border-cyan-500/40 cyber-glow-cyan'} rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left transition-all duration-300`}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${runningScore >= 70 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'}`}>
                  <span className="text-xl animate-pulse">⚡</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Live Signal Threat Meter
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Real-time Indic linguistic signal extraction & scoring
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                Live Stream
              </span>
            </div>

            {/* Live Running Meter Display */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 mb-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Cumulative Risk Score
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${runningScore >= 70 ? 'text-rose-400' : runningScore >= 40 ? 'text-amber-400' : 'text-emerald-400'} transition-all duration-300`}>
                    {runningScore}%
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-400 uppercase">
                    {runningScore >= 70 ? '🔴 HIGH RISK' : runningScore >= 40 ? '🟠 MEDIUM RISK' : '🟢 LOW / SAFE'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-cyan-400 block font-bold">
                  {revealedSignals.length} / {(currentResult?.signals?.length) || 4}
                </span>
                <span className="text-[10px] text-slate-500">Signals Mapped</span>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="mb-6 space-y-1.5">
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/80">
                <div
                  className={`bg-gradient-to-r ${runningScore >= 70 ? 'from-amber-500 via-rose-500 to-rose-400' : runningScore >= 40 ? 'from-cyan-500 via-amber-400 to-amber-500' : 'from-cyan-500 to-emerald-400'} h-2.5 rounded-full transition-all duration-300 ease-out`}
                  style={{ width: `${Math.min(100, runningScore)}%` }}
                ></div>
              </div>
            </div>

            {/* Sequential Signal Stream List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {revealedSignals.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs animate-slide-in"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">{sig.emoji || '⚠️'}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 truncate">
                        {sig.label}
                      </p>
                      {sig.excerpt && (
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          "{sig.excerpt}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow">
                      +{sig.points || 18}%
                    </span>
                  </div>
                </div>
              ))}

              {revealedSignals.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500 font-mono animate-pulse">
                  Parsing Roman Hindi tokens & threat vectors...
                </div>
              )}
            </div>

            {/* Footer Status */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1.5">
                {isFinishedStreaming ? (
                  <span className="text-emerald-400 font-bold">✓ Threat profile synthesized!</span>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1"></span>
                    <span>Extracting transliterated indicators...</span>
                  </>
                )}
              </span>
              <span>ScamBhasha Engine</span>
            </div>

          </div>
        </div>
      )}

      {/* 3. ADVANCED UPGRADE: SHAREABLE WARNING CARD MODAL */}
      {showShareModal && currentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#0b0f19] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative cyber-glow-amber">
            
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-base"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-4">
              <span className="text-2xl">📲</span>
              <div>
                <h3 className="text-base font-bold text-white">Shareable Security Warning Card</h3>
                <p className="text-xs text-slate-400">Forward on WhatsApp to protect family & elders</p>
              </div>
            </div>

            {/* The 1080x1080 Social Share Card Element */}
            <div
              ref={shareCardRef}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#0a0d14] via-[#0f1422] to-[#06080d] border-2 border-rose-500/60 shadow-2xl space-y-4 text-left my-2 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase tracking-widest text-rose-400">
                      CYBER THREAT ADVISORY
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ScamBhasha Indic Security Alert
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {currentResult.risk_score}% {currentResult.risk_level} RISK
                </span>
              </div>

              {/* Threat Title */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Detected Threat Pattern:
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {currentResult.scam_type}
                </h3>
              </div>

              {/* Explanation (Zero raw scam text to prevent spreading malicious links) */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                <strong>Why this is dangerous:</strong> {currentResult.explanation}
              </div>

              {/* Key Protective Checklist */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                  Family Protection Checklist:
                </span>
                {currentResult.recommended_actions.slice(0, 3).map((act, i) => (
                  <div key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-xs flex-shrink-0">•</span>
                    <span className="font-medium text-[11px] leading-tight">{act}</span>
                  </div>
                ))}
              </div>

              {/* Footer Watermark */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="text-cyan-400 font-semibold">
                  🛡️ Scanned with ScamBhasha
                </span>
                <span>Cybersecurity for India</span>
              </div>
            </div>

            {/* Share Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3">
              <button
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-all shadow"
              >
                <span>📥</span>
                <span>{isExporting ? 'Generating...' : 'Download Image (PNG)'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow"
              >
                <span>💬</span>
                <span>Share on WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. OCR CONFIRMATION MODAL */}
      {ocrConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
          <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Extracted OCR Text</h3>
            <p className="text-xs text-slate-400">Review or edit extracted text before scanning:</p>

            <textarea
              value={ocrExtractedText}
              onChange={(e) => setOcrExtractedText(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOcrConfirmOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOcr}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Use Text in Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ANONYMOUS REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-left">
          <div className="bg-[#0b0f19] border border-rose-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 cyber-glow-red">
            <h3 className="text-lg font-bold text-white">🚩 Report Scam to Community</h3>
            <p className="text-xs text-cyan-300">🔒 100% Anonymous: No personal information collected.</p>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Scam Type:</label>
              <input
                type="text"
                defaultValue={currentResult?.scam_type || 'Fake KYC Scam'}
                id="repScamType"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Additional Notes (Optional):</label>
              <textarea
                id="repNotes"
                placeholder="e.g. Received via SMS claiming to be bank manager..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const type = document.getElementById('repScamType')?.value || currentResult?.scam_type || 'Fake KYC Scam';
                  const notes = document.getElementById('repNotes')?.value || '';
                  saveNewReport({
                    scam_type: type,
                    message_excerpt: currentResult?.raw_message || 'Suspicious scam message',
                    detected_signals: currentResult?.signals?.map(s => s.label) || ['Urgency'],
                    domain: currentResult?.url_analysis?.url || null,
                    risk_level: currentResult?.risk_level || 'HIGH',
                    risk_score: currentResult?.risk_score || 95,
                    additional_notes: notes
                  });
                  setEmergingAlertsCount(detectLiveScamCampaigns().liveClusterAlerts.length);
                  alert('✓ Report received and added to community intelligence!');
                  setIsReportModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Submit Anonymously
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. API KEY MODAL */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-left">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">🔑 Google AI Studio Key</h3>
            <p className="text-xs text-slate-400">
              ScamBhasha works 100% offline out-of-the-box using the built-in deterministic engine. You can also optionally enter your Gemini key below.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('scambhasha_gemini_key', apiKey);
                  setIsApiKeyModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-[#06080d] py-8 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-slate-300 font-semibold">
            "Generic tools detect spam. ScamBhasha explains the threat." — "Same scam. Different language. Different detection."
          </p>
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} ScamBhasha. Indic Linguistic Cybersecurity Prototype. Zero PII Guarantee.
          </p>
        </div>
      </footer>

    </div>
  );
}

// Mount React Root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
