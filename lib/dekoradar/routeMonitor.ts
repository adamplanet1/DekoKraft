import fs from "node:fs";

import type { DekoCleanConfig, DekoCleanFinding, ScannedFile } from "../dekoclean/types.ts";
import { enrichFinding } from "../dekoclean/findingEngine.ts";
import { findingId } from "./finding.ts";

const ROUTE_REFERENCE = /(?:href|router\.(?:push|replace)\s*\()\s*[=:,(]?\s*["'`](\/[^"'`?#]*)["'`]/g;

function routePattern(pagePath: string): RegExp {
  const route = pagePath.replace(/^app/, "").replace(/\/page\.(?:tsx?|jsx?)$/, "") || "/";
  const parts = route.split("/").filter((part) => part && !/^\([^)]+\)$/.test(part));
  const expression = parts.map((part) => {
    if (/^\[\[\.\.\..+\]\]$/.test(part)) return "(?:/.*)?";
    if (/^\[\.\.\..+\]$/.test(part)) return "/.+";
    if (/^\[[^\]]+\]$/.test(part)) return "/[^/]+";
    return `/${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
  }).join("");
  return new RegExp(`^${expression || "/"}/?$`);
}

export function detectBrokenRoutes(files: ScannedFile[], config: DekoCleanConfig): DekoCleanFinding[] {
  const patterns = files.filter((file) => /^app\/.*\/page\.(?:tsx?|jsx?)$/.test(file.path) || /^app\/page\.(?:tsx?|jsx?)$/.test(file.path)).map((file) => routePattern(file.path));
  const findings: DekoCleanFinding[] = [];
  for (const file of files) {
    if (!config.sourceExtensions.includes(file.extension) || file.sizeBytes > config.maxTextFileBytes) continue;
    let content: string;
    try { content = fs.readFileSync(file.absolutePath, "utf8"); } catch { continue; }
    ROUTE_REFERENCE.lastIndex = 0;
    let match = ROUTE_REFERENCE.exec(content);
    while (match) {
      const route = match[1];
      if (route && !route.includes("${") && route !== "/" && !route.startsWith("/api/") && !patterns.some((pattern) => pattern.test(route))) {
        findings.push(enrichFinding({
          id: findingId("broken-route", [file.path], route), type: "broken-route", severity: "medium",
          title: "مسار داخلي غير موجود", explanation: "لم يعثر DekoRadar على صفحة تطابق الرابط الثابت. المسارات الديناميكية تحتاج مراجعة قبل الإصلاح.",
          affectedPaths: [file.path], evidence: [`Route: ${route}`], detectedBy: "dekoradar", detectedAt: new Date().toISOString(),
          recommendedActions: ["repair", "ignore"], requiresAdminConfirmation: true, status: "new",
        }));
      }
      match = ROUTE_REFERENCE.exec(content);
    }
  }
  return findings;
}
