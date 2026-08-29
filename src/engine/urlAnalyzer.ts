import { UrlAnalysis } from '../types/scam';

const URL_REGEX = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'rb.gy', 'cutt.ly', 'shorturl.at',
  'ow.ly', 'buff.ly', 'tiny.cc', 'bl.ink', 'v.gd', 'qr.ae', 'linktr.ee', 'trib.al'
]);

const SUSPICIOUS_TLDS = new Set([
  'top', 'xyz', 'cc', 'ru', 'buzz', 'club', 'work', 'click', 'site', 'fun',
  'live', 'info', 'tk', 'ml', 'ga', 'cf', 'gq', 'vip', 'monster', 'rest',
  'cfd', 'cam', 'sbs', 'quest', 'skin', 'autos', 'boats', 'beauty', 'hair'
]);

const SUSPICIOUS_PATH_KEYWORDS = [
  'kyc', 'update', 'verify', 'login', 'secure', 'claim', 'gift', 'reward',
  'blocked', 'unblock', 'account', 'pan', 'aadhaar', 'banking', 'apk', 'download',
  'free-cash', 'lottery', 'winner', 'confirm', 'otp'
];

interface BrandCheck {
  keywords: string[];
  officialDomains: string[];
  brandName: string;
}

const KNOWN_BRANDS: BrandCheck[] = [
  {
    brandName: 'State Bank of India (SBI)',
    keywords: ['sbi', 'state bank', 'yono', 'onlinesbi'],
    officialDomains: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com']
  },
  {
    brandName: 'HDFC Bank',
    keywords: ['hdfc', 'hdfc bank', 'netbanking'],
    officialDomains: ['hdfcbank.com', 'hdfc.com']
  },
  {
    brandName: 'ICICI Bank',
    keywords: ['icici', 'icici bank', 'imobile'],
    officialDomains: ['icicibank.com']
  },
  {
    brandName: 'Paytm',
    keywords: ['paytm', 'paytm kyc', 'paytm wallet'],
    officialDomains: ['paytm.com', 'paytmbank.com']
  },
  {
    brandName: 'PhonePe',
    keywords: ['phonepe', 'phone pe'],
    officialDomains: ['phonepe.com']
  },
  {
    brandName: 'India Post',
    keywords: ['india post', 'dak seva', 'post office', 'speed post', 'parcel'],
    officialDomains: ['indiapost.gov.in', 'indiapostgdsonline.gov.in']
  },
  {
    brandName: 'Electricity Board',
    keywords: ['bijli', 'electricity', 'bill unpaid', 'power cut', 'bses', 'msedcl', 'dhbvn', 'pspcl', 'uppcl'],
    officialDomains: ['bsesdelhi.com', 'mahadiscom.in', 'dhbvn.org.in', 'uppclonline.com']
  }
];

export function analyzeUrlInMessage(message: string): UrlAnalysis {
  if (!message) {
    return {
      url_present: false,
      url: null,
      is_shortened: false,
      domain_suspicious: false,
      https_present: false,
      url_risk_score: 0,
      notes: 'No URL detected in message.'
    };
  }

  const matches = message.match(URL_REGEX);
  if (!matches || matches.length === 0) {
    return {
      url_present: false,
      url: null,
      is_shortened: false,
      domain_suspicious: false,
      https_present: false,
      url_risk_score: 0,
      notes: 'No URL detected in message.'
    };
  }

  const rawUrl = matches[0].trim();
  let fullUrl = rawUrl;
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    fullUrl = 'https://' + fullUrl;
  }

  let hostname = '';
  let pathname = '';
  let isHttps = rawUrl.startsWith('https://');

  try {
    const parsed = new URL(fullUrl);
    hostname = parsed.hostname.toLowerCase();
    pathname = (parsed.pathname + parsed.search).toLowerCase();
  } catch {
    hostname = rawUrl.split('/')[0].toLowerCase();
    pathname = rawUrl.includes('/') ? rawUrl.substring(rawUrl.indexOf('/')) : '';
  }

  let riskScore = 0;
  const notes: string[] = [];

  // Check 1: URL Shortener
  const isShortened = SHORTENERS.has(hostname) || Array.from(SHORTENERS).some(s => hostname.endsWith('.' + s));
  if (isShortened) {
    riskScore += 35;
    notes.push('URL shortener obscures destination');
  }

  // Check 2: Suspicious TLD
  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  let domainSuspicious = SUSPICIOUS_TLDS.has(tld);
  if (domainSuspicious) {
    riskScore += 30;
    notes.push(`High-risk top-level domain (.${tld})`);
  }

  // Check 3: Lookalike / Random characters / excessive hyphens
  if (hostname.includes('-') && (hostname.includes('sbi') || hostname.includes('bank') || hostname.includes('pay') || hostname.includes('kyc') || hostname.includes('support'))) {
    domainSuspicious = true;
    riskScore += 30;
    notes.push('Deceptive hyphenated domain mimicking financial institutions');
  }

  if (/\d{5,}/.test(hostname) || /([a-z0-9]{12,})/.test(hostname.replace(/\./g, ''))) {
    domainSuspicious = true;
    riskScore += 20;
    notes.push('Randomized or algorithmic domain name pattern');
  }

  // Check 4: Brand Impersonation Mismatch
  let detectedBrandMismatch: string | null = null;
  const messageLower = message.toLowerCase();

  for (const brand of KNOWN_BRANDS) {
    const mentionsBrand = brand.keywords.some(k => messageLower.includes(k));
    if (mentionsBrand) {
      const isOfficial = brand.officialDomains.some(official => hostname === official || hostname.endsWith('.' + official));
      if (!isOfficial) {
        detectedBrandMismatch = brand.brandName;
        riskScore += 45;
        notes.push(`Brand Mismatch: Message claims "${brand.brandName}", but link redirects to unofficial domain "${hostname}"`);
        break;
      }
    }
  }

  // Check 5: Suspicious Path Keywords
  const matchedPathKeywords = SUSPICIOUS_PATH_KEYWORDS.filter(kw => pathname.includes(kw));
  if (matchedPathKeywords.length > 0) {
    riskScore += Math.min(25, matchedPathKeywords.length * 15);
    notes.push(`Sensitive action keywords in URL path (${matchedPathKeywords.join(', ')})`);
  }

  // Check 6: Insecure HTTP
  if (rawUrl.startsWith('http://')) {
    riskScore += 15;
    notes.push('Insecure unencrypted HTTP connection');
    isHttps = false;
  }

  // Cap risk score between 0 and 100
  const finalRiskScore = Math.min(100, Math.max(15, riskScore));

  return {
    url_present: true,
    url: rawUrl,
    is_shortened: isShortened,
    domain_suspicious: domainSuspicious,
    https_present: isHttps,
    url_risk_score: finalRiskScore,
    notes: notes.length > 0 ? notes.join(' • ') : 'Standard domain structure, heuristic risk assessed.',
    detected_brand_mismatch: detectedBrandMismatch
  };
}
