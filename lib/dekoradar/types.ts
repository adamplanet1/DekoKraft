import type { DekoCleanFinding, DekoCleanSeverity } from "../dekoclean/types.ts";

export interface SecurityScanFinding {
  source: string;
  engineVersion?: string;
  signatureVersion?: string;
  threatName?: string;
  threatFamily?: string;
  category?: "virus" | "trojan" | "worm" | "ransomware" | "spyware" | "adware" | "phishing" | "potentially-unwanted" | "suspicious" | "unknown";
  severity: DekoCleanSeverity;
  filePath?: string;
  fileHashSha256?: string;
  detectionId?: string;
  detectedAt: string;
  recommendedAction?: string;
  rawReportReference?: string;
}

export interface SecurityConnectorStatus {
  available: boolean;
  engineVersion?: string;
  signaturesUpdatedAt?: string;
}

export interface SecurityConnector {
  id: string;
  label: string;
  available: boolean;
  scanProject(): Promise<SecurityScanFinding[]>;
  getStatus(): Promise<SecurityConnectorStatus>;
}

export interface DekoRadarScanResult {
  findings: DekoCleanFinding[];
  scannedAt: string;
  scannedFiles: number;
  cacheHit: boolean;
}
