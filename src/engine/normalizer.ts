/**
 * ScamBhasha Linguistic Normalization Engine
 * 
 * ARCHITECTURE NOTE:
 * This module performs DETERMINISTIC rule-based normalization on Roman Hindi, Hinglish,
 * and Devanagari Hindi text. It maps common transliteration variants, slang, and phonetic
 * spelling deviations to a canonical representation.
 * 
 * Pipeline:
 * 1. Script Identification (Unicode Devanagari range \u0900-\u097F vs Latin/ASCII)
 * 2. Transliteration / Roman Hindi variant lookup and canonical replacement
 * 3. Language & Script classification (Hindi, Hinglish, Roman Hindi, English)
 * 
 * Note: This deterministic step runs BEFORE the LLM (Gemini) or fallback rule-based
 * contextual classifier receives the text.
 */

export interface NormalizationResult {
  language: string;
  script: string;
  normalization_applied: boolean;
  original_text: string;
  normalized_text: string;
  detected_hindi_tokens: string[];
  detected_english_tokens: string[];
  replacements_count: number;
}

// Canonical dictionary of common Roman Hindi & scam-relevant spelling variations
export const TRANSLITERATION_MAP: Record<string, string> = {
  // Pronouns & Possessives
  'apka': 'aapka',
  'apki': 'aapki',
  'apke': 'aapke',
  'aapka': 'aapka',
  'aapki': 'aapki',
  'aapke': 'aapke',
  'humara': 'hamara',
  'humari': 'hamari',
  'humare': 'hamare',
  'tumhara': 'tumhara',
  'tumhari': 'tumhari',
  'tera': 'tera',
  'meri': 'meri',
  'mera': 'mera',
  'apne': 'aapne',

  // Auxiliaries & Verbs
  'h': 'hai',
  'hn': 'hain',
  'hain': 'hain',
  'hai': 'hai',
  'tha': 'tha',
  'thi': 'thi',
  'the': 'the',
  'krna': 'karna',
  'krne': 'karne',
  'kro': 'karo',
  'kare': 'karein',
  'karein': 'karein',
  'karlo': 'kar lo',
  'krlo': 'kar lo',
  'bhejo': 'bhejein',
  'bheje': 'bhejein',
  'bhejiye': 'bhejein',
  'de': 'dein',
  'do': 'do',
  'liya': 'liya',
  'diya': 'diya',
  'aayega': 'aayega',
  'milega': 'milega',
  'milegi': 'milegi',
  'hoga': 'hoga',
  'hogi': 'hogi',
  'jaega': 'jaayega',
  'jayega': 'jaayega',
  'raha': 'raha',
  'rahi': 'rahi',
  'rahe': 'rahe',

  // Scam / Banking / KYC Keywords
  'acc': 'account',
  'acnt': 'account',
  'acct': 'account',
  'ac': 'account',
  'khata': 'account',
  'khate': 'account',
  'paise': 'paise',
  'paisa': 'paise',
  'rupaye': 'rupaye',
  'rupay': 'rupaye',
  'rs': 'rupees',
  'r': 'rupees',
  'inr': 'rupees',
  'inaam': 'inaam',
  'inam': 'inaam',
  'jita': 'jeeta',
  'jeeta': 'jeeta',
  'jeet': 'jeeta',
  'jeete': 'jeete',
  'band': 'band',
  'bandh': 'band',
  'rok': 'hold',
  'bina': 'bina',
  'binaa': 'bina',
  'turant': 'turant',
  'jaldi': 'turant',
  'sheeghra': 'turant',
  'shighra': 'turant',
  'tatkal': 'tatkaal',
  'tatkaal': 'tatkaal',
  'aaj': 'aaj',
  'abhi': 'abhi',
  'abhie': 'abhi',
  'pehle': 'pehle',
  'pahle': 'pehle',
  'badhai': 'badhai',
  'badhaai': 'badhai',
  'mubarak': 'mubarak',
  'mubaarak': 'mubarak',
  'naukri': 'naukri',
  'naukari': 'naukri',
  'kamayi': 'kamai',
  'kamaye': 'kamayein',
  'kamayein': 'kamayein',
  'shulk': 'fee',
  'shulak': 'fee',
  'vivaran': 'details',
  'jankari': 'jankari',
  'soochana': 'suchana',
  'suchna': 'suchana',
  'suchana': 'suchana',
  'kripya': 'kripya',
  'kripaya': 'kripya',
  'dhyan': 'dhyan',
  'savdhan': 'savdhaan',
  'savdhaan': 'savdhaan',
  'dhoka': 'dhokha',
  'dhokha': 'dhokha',

  // Tech / Slang Typos
  'lnik': 'link',
  'lik': 'link',
  'opt': 'otp',
  'kycc': 'kyc',
  'kyccheck': 'kyc check',
  'wfh': 'work from home',
  'parttime': 'part time',
  'fullday': 'full day'
};

// Known common Hindi roman words to score Roman Hindi vs English
const HINDI_ROMAN_INDICATORS = new Set([
  'aapka', 'aapki', 'aapke', 'apka', 'apki', 'apke', 'hai', 'hain', 'h', 'hn',
  'wala', 'wali', 'wale', 'walaa', 'karein', 'kare', 'karo', 'karna', 'karne',
  'band', 'bandh', 'pehle', 'pahle', 'abhi', 'turant', 'jaldi', 'jeeta', 'jeete',
  'badhai', 'badhaai', 'mubarak', 'bhejein', 'bhejo', 'khata', 'paise', 'paisa',
  'rupaye', 'kamaye', 'kamai', 'naukri', 'par', 'se', 'ko', 'ka', 'ki', 'ke',
  'mein', 'mai', 'me', 'nahi', 'nahin', 'mat', 'aur', 'ya', 'parantu', 'lekin',
  'kripya', 'shulk', 'chahiye', 'karen', 'aaj', 'kal', 'din', 'ghante', 'mahine',
  'inaam', 'dhyan', 'suchana', 'tatkaal', 'rakhein', 'dekhein', 'kholiye'
]);

/**
 * Normalizes input text and detects script & language characteristics.
 */
export function normalizeHindiText(text: string): NormalizationResult {
  if (!text || typeof text !== 'string') {
    return {
      language: 'Unknown',
      script: 'Unknown',
      normalization_applied: false,
      original_text: '',
      normalized_text: '',
      detected_hindi_tokens: [],
      detected_english_tokens: [],
      replacements_count: 0
    };
  }

  const devanagariRegex = /[\u0900-\u097F]/g;
  const devanagariMatches = text.match(devanagariRegex) || [];
  const devanagariCount = devanagariMatches.length;
  
  const words = text.split(/(\s+|[.,!?;:()\[\]{}"'\/\\])/);
  let replacementsCount = 0;
  const hindiTokensFound: string[] = [];
  const englishTokensFound: string[] = [];

  const normalizedTokens = words.map((token) => {
    // Preserve whitespace and punctuation intact
    if (!token || /^\s+$/.test(token) || /^[.,!?;:()\[\]{}"'\/\\]+$/.test(token)) {
      return token;
    }

    const cleanWord = token.toLowerCase().trim();

    // Check if token matches Roman Hindi indicator
    if (HINDI_ROMAN_INDICATORS.has(cleanWord) || TRANSLITERATION_MAP[cleanWord]) {
      hindiTokensFound.push(cleanWord);
    } else if (cleanWord.length > 2 && /^[a-z]+$/.test(cleanWord)) {
      englishTokensFound.push(cleanWord);
    }

    // Check if word is in canonical transliteration map
    if (Object.prototype.hasOwnProperty.call(TRANSLITERATION_MAP, cleanWord)) {
      const canonical = TRANSLITERATION_MAP[cleanWord];
      if (canonical.toLowerCase() !== cleanWord) {
        replacementsCount++;
        // Maintain casing if original was Capitalized
        if (token[0] === token[0].toUpperCase() && token.length > 1) {
          return canonical.charAt(0).toUpperCase() + canonical.slice(1);
        }
        return canonical;
      }
    }

    return token;
  });

  const normalized_text = normalizedTokens.join('');

  // Classify Script and Language
  let script = 'Latin';
  let language = 'English';

  const totalWords = hindiTokensFound.length + englishTokensFound.length;
  const hindiRatio = totalWords > 0 ? hindiTokensFound.length / totalWords : 0;

  if (devanagariCount > 0) {
    if (devanagariCount > 20 && englishTokensFound.length < 3) {
      script = 'Devanagari';
      language = 'Hindi';
    } else {
      script = 'Mixed (Devanagari + Latin)';
      language = 'Hindi + Hinglish';
    }
  } else {
    // Latin / Roman script
    if (hindiTokensFound.length >= 2 || hindiRatio > 0.15) {
      script = 'Roman Hindi';
      if (englishTokensFound.length >= 3 && hindiTokensFound.length >= 2) {
        language = 'Hindi + Hinglish';
      } else {
        language = 'Roman Hindi';
      }
    } else {
      script = 'Latin (English)';
      language = 'English';
    }
  }

  return {
    language,
    script,
    normalization_applied: replacementsCount > 0,
    original_text: text,
    normalized_text,
    detected_hindi_tokens: Array.from(new Set(hindiTokensFound)),
    detected_english_tokens: Array.from(new Set(englishTokensFound)),
    replacements_count: replacementsCount
  };
}

const GLOSS_PHRASES: [RegExp, string][] = [
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

const GLOSS_WORD_MAP: Record<string, string> = {
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

export function generateLiteralEnglishGloss(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  let gloss = text;
  // Apply phrase-level translations first
  for (const [regex, replacement] of GLOSS_PHRASES) {
    gloss = gloss.replace(regex, replacement);
  }

  // Tokenize words and translate remaining Hindi tokens
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
