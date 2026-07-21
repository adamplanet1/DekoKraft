"use client";

import { useEffect, useRef } from "react";

import { publicPath } from "../../lib/publicPath";
import {
  buildReportSnapshot, mergePerformanceSnapshot, parseBuildPerformanceReport, parsePerformanceSnapshots,
  PERFORMANCE_BUILD_REPORT_PATH, PERFORMANCE_STORAGE_KEY, serializePerformanceSnapshots,
  type PerformanceSnapshot,
} from "../../../lib/dekoclean/performance";

export const PERFORMANCE_UPDATED_EVENT = "dekokraft-performance-updated";
export const PERFORMANCE_MEASURE_EVENT = "dekokraft-performance-measure";
export const PERFORMANCE_CLEAR_EVENT = "dekokraft-performance-clear";

type LayoutShiftEntry = PerformanceEntry & { value?: number; hadRecentInput?: boolean };
type LargestContentfulPaintEntry = PerformanceEntry & { renderTime?: number; loadTime?: number };

function safeEntries<T extends PerformanceEntry>(type: string): T[] {
  try { return typeof performance.getEntriesByType === "function" ? performance.getEntriesByType(type) as T[] : []; }
  catch { return []; }
}

function writeSnapshot(snapshot: PerformanceSnapshot): void {
  try {
    const current = parsePerformanceSnapshots(window.localStorage.getItem(PERFORMANCE_STORAGE_KEY));
    window.localStorage.setItem(PERFORMANCE_STORAGE_KEY, serializePerformanceSnapshots(mergePerformanceSnapshot(current, snapshot)));
    window.dispatchEvent(new CustomEvent(PERFORMANCE_UPDATED_EVENT));
  } catch { /* storage can be blocked in privacy mode */ }
}

export default function DekoPerformanceMonitor() {
  const lcpRef = useRef<number | null>(null);
  const clsRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof performance === "undefined") return;
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, callback: PerformanceObserverCallback) => {
      if (typeof PerformanceObserver === "undefined") return;
      try {
        const supported = PerformanceObserver.supportedEntryTypes;
        if (Array.isArray(supported) && !supported.includes(type)) return;
        const observer = new PerformanceObserver(callback);
        observer.observe({ type, buffered: true });
        observers.push(observer);
      } catch { /* Safari and older browsers can reject unsupported entry types */ }
    };
    observe("largest-contentful-paint", (list) => {
      const latest = list.getEntries().at(-1) as LargestContentfulPaintEntry | undefined;
      const value = latest ? latest.renderTime || latest.loadTime || latest.startTime : null;
      if (typeof value === "number" && Number.isFinite(value)) lcpRef.current = value;
    });
    observe("layout-shift", (list) => {
      const shifts = list.getEntries() as LayoutShiftEntry[];
      const increment = shifts.filter((entry) => !entry.hadRecentInput && typeof entry.value === "number").reduce((sum, entry) => sum + (entry.value ?? 0), 0);
      clsRef.current = (clsRef.current ?? 0) + increment;
    });

    try {
      if (!performance.getEntriesByName("dekokraft-hydration-complete").length) performance.mark("dekokraft-hydration-complete");
      if (performance.getEntriesByName("dekokraft-app-init").length && !performance.getEntriesByName("dekokraft-hydration").length) {
        performance.measure("dekokraft-hydration", "dekokraft-app-init", "dekokraft-hydration-complete");
      }
    } catch { /* custom marks are optional */ }

    const collect = (force = false) => {
      const navigation = safeEntries<PerformanceNavigationTiming>("navigation")[0];
      const paints = safeEntries<PerformanceEntry>("paint");
      const resources = safeEntries<PerformanceResourceTiming>("resource");
      const hydration = performance.getEntriesByName("dekokraft-hydration")[0];
      const navigationId = `${performance.timeOrigin}:${window.location.pathname}`;
      const current = (() => { try { return parsePerformanceSnapshots(window.localStorage.getItem(PERFORMANCE_STORAGE_KEY)); } catch { return []; } })();
      if (!force && current.some((entry) => entry.navigationId === navigationId)) return;
      const firstPaint = paints.find((entry) => entry.name === "first-paint")?.startTime ?? null;
      const fcp = paints.find((entry) => entry.name === "first-contentful-paint")?.startTime ?? null;
      const values = {
        firstPaintMs: firstPaint, fcpMs: fcp, lcpMs: lcpRef.current, cls: clsRef.current,
        ttfbMs: navigation ? navigation.responseStart : null,
        domContentLoadedMs: navigation ? navigation.domContentLoadedEventEnd : null,
        pageLoadMs: navigation && navigation.loadEventEnd > 0 ? navigation.loadEventEnd : null,
        navigationDurationMs: navigation && navigation.duration > 0 ? navigation.duration : null,
        hydrationMs: hydration?.duration ?? null,
        resourceCount: resources.length,
        transferredBytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        decodedBytes: resources.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0),
      };
      const supportedMetrics = Object.entries(values).filter(([, value]) => typeof value === "number" && Number.isFinite(value)).map(([key]) => key);
      const unavailableMetrics = Object.keys(values).filter((key) => !supportedMetrics.includes(key));
      writeSnapshot({
        schemaVersion: 1, id: `browser:${navigationId}:${force ? Date.now() : "initial"}`, timestamp: new Date().toISOString(), route: window.location.pathname,
        source: "browser", navigationId, buildDurationMs: null, bundleSizeBytes: null, javascriptSizeBytes: null, cssSizeBytes: null,
        staticAssetSizeBytes: null, totalOutputSizeBytes: null, exportedFileCount: null, ...values, supportedMetrics, unavailableMetrics,
      });
    };

    const loadBuildReport = async () => {
      try {
        const response = await fetch(publicPath(PERFORMANCE_BUILD_REPORT_PATH), { cache: "no-store" });
        if (!response.ok) return;
        const report = parseBuildPerformanceReport(await response.json());
        if (report) writeSnapshot(buildReportSnapshot(report));
      } catch { /* a missing report keeps build metrics unavailable */ }
    };
    const measureHandler = () => collect(true);
    const clearHandler = () => {
      try { window.localStorage.removeItem(PERFORMANCE_STORAGE_KEY); window.dispatchEvent(new CustomEvent(PERFORMANCE_UPDATED_EVENT)); }
      catch { /* storage can be blocked */ }
    };
    window.addEventListener(PERFORMANCE_MEASURE_EVENT, measureHandler);
    window.addEventListener(PERFORMANCE_CLEAR_EVENT, clearHandler);
    const timer = window.setTimeout(() => collect(false), document.readyState === "complete" ? 1500 : 2500);
    void loadBuildReport();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(PERFORMANCE_MEASURE_EVENT, measureHandler);
      window.removeEventListener(PERFORMANCE_CLEAR_EVENT, clearHandler);
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return null;
}
