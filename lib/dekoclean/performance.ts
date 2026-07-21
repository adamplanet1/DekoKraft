export const PERFORMANCE_STORAGE_KEY = "dekokraft:performance-snapshots:v1";
export const PERFORMANCE_STORAGE_LIMIT = 30;
export const PERFORMANCE_BUILD_REPORT_PATH = "/generated/performance-build-report.json";

export type PerformanceSource = "browser" | "build";
export type PerformanceRating = "good" | "needs-improvement" | "poor" | "unavailable";

export interface PerformanceBuildReport {
  schemaVersion: 1;
  generatedAt: string;
  buildDurationMs: number;
  buildDurationSeconds: number;
  buildStatus: "success" | "failed";
  outputDirectory: string;
  bundleSizeBytes: number;
  javascriptSizeBytes: number;
  cssSizeBytes: number;
  staticAssetSizeBytes: number;
  totalOutputSizeBytes: number;
  javascriptFiles: number;
  cssFiles: number;
  imageFiles: number;
  exportedFileCount: number;
}

export interface PerformanceSnapshot {
  schemaVersion: 1;
  id: string;
  timestamp: string;
  route: string;
  source: PerformanceSource;
  navigationId?: string;
  buildDurationMs: number | null;
  bundleSizeBytes: number | null;
  javascriptSizeBytes: number | null;
  cssSizeBytes: number | null;
  staticAssetSizeBytes: number | null;
  totalOutputSizeBytes: number | null;
  exportedFileCount: number | null;
  firstPaintMs: number | null;
  fcpMs: number | null;
  lcpMs: number | null;
  cls: number | null;
  ttfbMs: number | null;
  domContentLoadedMs: number | null;
  pageLoadMs: number | null;
  navigationDurationMs: number | null;
  hydrationMs: number | null;
  resourceCount: number | null;
  transferredBytes: number | null;
  decodedBytes: number | null;
  supportedMetrics: string[];
  unavailableMetrics: string[];
}

export interface PerformanceScoreResult {
  score: number | null;
  rating: PerformanceRating;
  availableMetrics: number;
  unavailableMetrics: number;
  metricScores: Array<{ metric: string; value: number; score: number; rating: Exclude<PerformanceRating, "unavailable"> }>;
}

type Threshold = { good: number; poor: number; lowerIsBetter?: true };

// Thresholds follow Web Vitals guidance where applicable. Project-specific
// thresholds cover load, hydration, deployed bundle size, and production build.
export const PERFORMANCE_THRESHOLDS: Record<string, Threshold> = {
  lcpMs: { good: 2500, poor: 4000, lowerIsBetter: true },
  cls: { good: 0.1, poor: 0.25, lowerIsBetter: true },
  fcpMs: { good: 1800, poor: 3000, lowerIsBetter: true },
  ttfbMs: { good: 800, poor: 1800, lowerIsBetter: true },
  pageLoadMs: { good: 2500, poor: 4500, lowerIsBetter: true },
  hydrationMs: { good: 200, poor: 500, lowerIsBetter: true },
  bundleSizeBytes: { good: 2 * 1024 * 1024, poor: 5 * 1024 * 1024, lowerIsBetter: true },
  buildDurationMs: { good: 30_000, poor: 90_000, lowerIsBetter: true },
};

const measuredKeys = Object.keys(PERFORMANCE_THRESHOLDS) as Array<keyof PerformanceSnapshot>;

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function metricScore(value: number, threshold: Threshold): number {
  if (value <= threshold.good) return 100;
  if (value <= threshold.poor) return Math.round(100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 50);
  return Math.max(0, Math.round(50 - ((value - threshold.poor) / Math.max(threshold.poor, 1)) * 50));
}

export function calculatePerformanceScore(snapshots: PerformanceSnapshot[]): PerformanceScoreResult {
  const latestValues = new Map<string, number>();
  for (const snapshot of [...snapshots].sort((a, b) => b.timestamp.localeCompare(a.timestamp))) {
    for (const key of measuredKeys) {
      const value = snapshot[key];
      if (!latestValues.has(key) && finite(value)) latestValues.set(key, value);
    }
  }
  const metricScores = [...latestValues].map(([metric, value]) => {
    const score = metricScore(value, PERFORMANCE_THRESHOLDS[metric]);
    return { metric, value, score, rating: score >= 90 ? "good" as const : score >= 50 ? "needs-improvement" as const : "poor" as const };
  });
  if (!metricScores.length) return { score: null, rating: "unavailable", availableMetrics: 0, unavailableMetrics: measuredKeys.length, metricScores: [] };
  const score = Math.round(metricScores.reduce((sum, metric) => sum + metric.score, 0) / metricScores.length);
  return { score, rating: score >= 90 ? "good" : score >= 50 ? "needs-improvement" : "poor", availableMetrics: metricScores.length, unavailableMetrics: measuredKeys.length - metricScores.length, metricScores };
}

export function parseBuildPerformanceReport(value: unknown): PerformanceBuildReport | null {
  if (!value || typeof value !== "object") return null;
  const report = value as Partial<PerformanceBuildReport>;
  if (report.schemaVersion !== 1 || report.buildStatus !== "success" || typeof report.generatedAt !== "string" || typeof report.outputDirectory !== "string") return null;
  const numeric: Array<keyof PerformanceBuildReport> = ["buildDurationMs", "buildDurationSeconds", "bundleSizeBytes", "javascriptSizeBytes", "cssSizeBytes", "staticAssetSizeBytes", "totalOutputSizeBytes", "javascriptFiles", "cssFiles", "imageFiles", "exportedFileCount"];
  if (numeric.some((key) => !finite(report[key]))) return null;
  return report as PerformanceBuildReport;
}

export function buildReportSnapshot(report: PerformanceBuildReport): PerformanceSnapshot {
  return {
    schemaVersion: 1, id: `build:${report.generatedAt}`, timestamp: report.generatedAt, route: "static-export", source: "build",
    buildDurationMs: report.buildDurationMs, bundleSizeBytes: report.bundleSizeBytes, javascriptSizeBytes: report.javascriptSizeBytes,
    cssSizeBytes: report.cssSizeBytes, staticAssetSizeBytes: report.staticAssetSizeBytes, totalOutputSizeBytes: report.totalOutputSizeBytes,
    exportedFileCount: report.exportedFileCount, firstPaintMs: null, fcpMs: null, lcpMs: null, cls: null, ttfbMs: null,
    domContentLoadedMs: null, pageLoadMs: null, navigationDurationMs: null, hydrationMs: null, resourceCount: null,
    transferredBytes: null, decodedBytes: null,
    supportedMetrics: ["buildDurationMs", "bundleSizeBytes", "javascriptSizeBytes", "cssSizeBytes", "staticAssetSizeBytes", "totalOutputSizeBytes", "exportedFileCount"],
    unavailableMetrics: ["firstPaintMs", "fcpMs", "lcpMs", "cls", "ttfbMs", "domContentLoadedMs", "pageLoadMs", "navigationDurationMs", "hydrationMs", "resourceCount", "transferredBytes", "decodedBytes"],
  };
}

export function parsePerformanceSnapshots(raw: string | null): PerformanceSnapshot[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PerformanceSnapshot => Boolean(item && typeof item === "object" && (item as PerformanceSnapshot).schemaVersion === 1 && typeof (item as PerformanceSnapshot).id === "string" && typeof (item as PerformanceSnapshot).timestamp === "string" && ["browser", "build"].includes((item as PerformanceSnapshot).source)));
  } catch { return []; }
}

export function serializePerformanceSnapshots(snapshots: PerformanceSnapshot[]): string {
  return JSON.stringify([...snapshots].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, PERFORMANCE_STORAGE_LIMIT));
}

export function mergePerformanceSnapshot(snapshots: PerformanceSnapshot[], snapshot: PerformanceSnapshot): PerformanceSnapshot[] {
  const retained = snapshots.filter((entry) => entry.id !== snapshot.id && !(snapshot.source === "browser" && snapshot.navigationId && entry.source === "browser" && entry.navigationId === snapshot.navigationId));
  return [snapshot, ...retained].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, PERFORMANCE_STORAGE_LIMIT);
}

export function formatPerformanceBytes(bytes: number | null): string {
  if (bytes === null) return "غير متاح";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}
