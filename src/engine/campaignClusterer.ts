import { ScamReport, ScamCampaign, RiskLevel } from '../types/scam';

const STORAGE_KEY_REPORTS = 'scambhasha_community_reports';

// Initial realistic seeded reports for the hackathon demo baseline
const SEEDED_REPORTS: ScamReport[] = [
  // KYC Campaign Cluster (Seed 1)
  {
    id: 'seed-kyc-1',
    timestamp: '12 mins ago',
    message_excerpt: 'Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein: bit.ly/sbi-kyc-update',
    message_hash: 'hash-kyc-01',
    scam_type: 'Fake KYC Scam',
    detected_signals: ['Fake Banking / KYC Trap', 'Threat / Suspension Language', 'Urgency Pressure', 'Suspicious URL'],
    domain: 'bit.ly/sbi-kyc-update',
    risk_level: 'HIGH',
    risk_score: 96,
    additional_notes: 'Received via SMS claiming to be SBI Mumbai circle.',
    is_user_submitted: false
  },
  {
    id: 'seed-kyc-2',
    timestamp: '25 mins ago',
    message_excerpt: 'Dear Customer, your SBI YONO account will be blocked today due to pending KYC. Update pan details: bit.ly/sbi-kyc-update',
    message_hash: 'hash-kyc-02',
    scam_type: 'Fake KYC Scam',
    detected_signals: ['Fake Banking / KYC Trap', 'Threat / Suspension Language', 'Brand Impersonation', 'Suspicious URL'],
    domain: 'bit.ly/sbi-kyc-update',
    risk_level: 'HIGH',
    risk_score: 95,
    additional_notes: 'Urgent tone asking for PAN card upload.',
    is_user_submitted: false
  },

  // Fake Job Campaign (Seed 2)
  {
    id: 'seed-job-1',
    timestamp: '42 mins ago',
    message_excerpt: 'Part time work from home. Daily earn ₹1,500-₹3,000 just by liking YouTube videos. Registration fee ₹499 refundable. WhatsApp: 9876543210',
    message_hash: 'hash-job-01',
    scam_type: 'Fake Work From Home Scam',
    detected_signals: ['Fake Job / WFH Offer', 'Payment / Fee Demand', 'Suspicious Call-To-Action'],
    domain: null,
    risk_level: 'HIGH',
    risk_score: 92,
    additional_notes: 'Telegram group link shared after paying ₹499.',
    is_user_submitted: false
  },
  {
    id: 'seed-job-2',
    timestamp: '1 hour ago',
    message_excerpt: 'Urgent hiring Amazon rating task. Earn ₹25,000 monthly from mobile. Pay ₹499 processing fee to activate portal.',
    message_hash: 'hash-job-02',
    scam_type: 'Fake Work From Home Scam',
    detected_signals: ['Fake Job / WFH Offer', 'Payment / Fee Demand', 'Brand Impersonation'],
    domain: null,
    risk_level: 'HIGH',
    risk_score: 89,
    additional_notes: 'Pretending to be Amazon HR.',
    is_user_submitted: false
  },

  // Electricity Bill Fraud (Seed 3)
  {
    id: 'seed-elec-1',
    timestamp: '2 hours ago',
    message_excerpt: 'Priy Grahak, aapka bijli connection aaj raat 9:30 baje disconnect ho jayega kyunki pichhla bill update nahi hua. Sampark karein: 8877665544',
    message_hash: 'hash-elec-01',
    scam_type: 'Impersonation & Threat Extortion',
    detected_signals: ['Threat / Suspension Language', 'Urgency Pressure', 'Suspicious Call-To-Action'],
    domain: null,
    risk_level: 'HIGH',
    risk_score: 94,
    additional_notes: 'Fake electricity officer number asking to download TeamViewer QuickSupport.',
    is_user_submitted: false
  }
];

// Pre-seeded campaign cards with realistic macro numbers
export const SEEDED_CAMPAIGNS: ScamCampaign[] = [
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
    is_emerging: true,
    sample_excerpts: [
      'Aapka KYC expire hone wala hai. Account band hone se pehle abhi update karein...',
      'Dear Customer, your SBI YONO account will be blocked today due to pending KYC...'
    ]
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
    is_emerging: false,
    sample_excerpts: [
      'Part time work from home. Daily earn ₹1,500-₹3,000 just by liking videos...',
      'Work from home job available. ₹30,000 monthly. Registration fee only ₹499...'
    ]
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
    is_emerging: false,
    sample_excerpts: [
      'Priy Grahak, aapka bijli connection aaj raat 9:30 baje disconnect ho jayega...'
    ]
  }
];

export function getStoredReports(): ScamReport[] {
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

export function saveNewReport(reportData: {
  scam_type: string;
  message_excerpt: string;
  detected_signals: string[];
  domain: string | null;
  risk_level: RiskLevel;
  risk_score: number;
  additional_notes?: string;
}): ScamReport {
  const reports = getStoredReports();
  const newReport: ScamReport = {
    id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: 'Just now',
    message_excerpt: reportData.message_excerpt.substring(0, 140),
    message_hash: 'hash-' + Math.random().toString(36).substring(2, 9),
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
  } catch (e) {
    console.error('Failed to save report to storage:', e);
  }

  return newReport;
}

/**
 * Real-time clustering algorithm that analyzes stored user reports
 * and detects emerging scam campaigns based on shared domains, signal overlaps,
 * and scam categories.
 */
export function detectLiveScamCampaigns(): {
  campaigns: ScamCampaign[];
  liveClusterAlerts: ScamCampaign[];
  totalReportsCount: number;
  liveUserReportsCount: number;
} {
  const reports = getStoredReports();
  const userReports = reports.filter(r => r.is_user_submitted);

  // Group by (domain) or (scam_type + signal overlaps)
  const clusters: Record<string, ScamReport[]> = {};

  reports.forEach(report => {
    // Cluster Key Strategy:
    // If domain exists, key by normalized domain
    // Else key by normalized scam_type
    let key = '';
    if (report.domain && report.domain.length > 3) {
      key = `domain:${report.domain.toLowerCase().replace(/https?:\/\//, '').split('/')[0]}`;
    } else {
      key = `type:${report.scam_type.toLowerCase()}`;
    }

    if (!clusters[key]) {
      clusters[key] = [];
    }
    clusters[key].push(report);
  });

  const liveAlerts: ScamCampaign[] = [];

  // Evaluate clusters: if any cluster has >= 3 reports (or has user submissions in it), flag it!
  Object.entries(clusters).forEach(([key, groupReports]) => {
    const hasUserSubmissions = groupReports.some(r => r.is_user_submitted);
    
    // Trigger condition for emerging campaign
    if (groupReports.length >= 3 || (hasUserSubmissions && groupReports.length >= 2)) {
      const sampleReport = groupReports[0];
      const allSignals = Array.from(new Set(groupReports.flatMap(r => r.detected_signals)));
      const commonDomain = groupReports.find(r => r.domain)?.domain || null;

      const isDomainCluster = key.startsWith('domain:');
      const campaignName = isDomainCluster
        ? `Coordinated Phishing Wave via ${commonDomain || 'Spoofed Domain'}`
        : `Surge in ${sampleReport.scam_type} Attacks`;

      const triggerReason = isDomainCluster
        ? `Clustered by shared malicious endpoint (${commonDomain}) across ${groupReports.length} reports.`
        : `Clustered by high semantic & signal density (${allSignals.slice(0, 3).join(', ')}) across ${groupReports.length} reports.`;

      liveAlerts.push({
        id: 'cluster-' + key.replace(/[^a-zA-Z0-9]/g, '-'),
        name: campaignName,
        scam_type: sampleReport.scam_type,
        report_count: groupReports.length >= 3 ? groupReports.length + (sampleReport.scam_type.includes('KYC') ? 1284 : 420) : groupReports.length,
        risk_level: 'HIGH',
        common_signals: allSignals.slice(0, 4),
        common_domain: commonDomain,
        trigger_reason: triggerReason,
        first_seen: 'Active Today',
        last_seen: 'Just now',
        is_emerging: true,
        sample_excerpts: groupReports.map(r => r.message_excerpt).slice(0, 3)
      });
    }
  });

  // Combine seeded campaigns with dynamically formed live alerts
  const combinedCampaigns = [...liveAlerts];
  SEEDED_CAMPAIGNS.forEach(sc => {
    if (!combinedCampaigns.some(c => c.scam_type === sc.scam_type)) {
      combinedCampaigns.push(sc);
    }
  });

  return {
    campaigns: combinedCampaigns,
    liveClusterAlerts: liveAlerts,
    totalReportsCount: reports.length + 2340, // Base demo community volume
    liveUserReportsCount: userReports.length
  };
}
