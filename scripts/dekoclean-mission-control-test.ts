import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  calculateDekoIndex, clampDomainScore, DEKO_INDEX_WEIGHTS, getDekoIndexSnapshot,
  readDekoIndexHistory, recordDekoIndexSnapshot, validateDekoIndexWeights,
} from "../lib/dekoclean/missionControl.ts";
import type { DekoDomainKey, DekoDomainScore } from "../lib/dekoclean/missionControlTypes.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-mission-"));
const domain = (key: DekoDomainKey, score: number | null): DekoDomainScore => ({ key, score, status: score === null ? "unavailable" : "good", trend: "unknown", contributingFactors: [] });

try {
  validateDekoIndexWeights(DEKO_INDEX_WEIGHTS);
  assert.equal(Object.values(DEKO_INDEX_WEIGHTS).reduce((sum, value) => sum + value, 0), 100, "weights total 100");
  assert.throws(() => validateDekoIndexWeights({ ...DEKO_INDEX_WEIGHTS, health: 31 }), /total 100/);
  assert.equal(clampDomainScore(-9), 0); assert.equal(clampDomainScore(109), 100);

  const provisional = calculateDekoIndex([domain("health", 90), domain("performance", null), domain("security", 80), domain("ai", 70), domain("memory", 100)]);
  assert.equal(provisional.isProvisional, true); assert.equal(provisional.coveragePercent, 75); assert.deepEqual(provisional.missingDomains, ["performance"]);
  assert.equal(readDekoIndexHistory(root).length, 0, "no fake history is created");

  const snapshot = await getDekoIndexSnapshot(root);
  assert.equal(snapshot.domains.find((item) => item.key === "performance")?.score, null, "performance is honestly unavailable");
  assert.equal(snapshot.domains.find((item) => item.key === "security")?.score, null, "security is not 100 without evidence");
  assert.match(snapshot.domains.find((item) => item.key === "memory")?.unavailableReason ?? "", /ذاكرة الجهاز/, "memory integrity is not device RAM");
  assert.equal(readDekoIndexHistory(root).length, 0, "calculating a snapshot does not persist history");

  await recordDekoIndexSnapshot({ operationId: "operation-1", trigger: "scan" }, root);
  await recordDekoIndexSnapshot({ operationId: "operation-1", trigger: "scan" }, root);
  assert.equal(readDekoIndexHistory(root).length, 1, "operationId deduplicates history");

  const routeSource = fs.readFileSync(path.join(process.cwd(), "app/api/admin/dekoclean/findings/route.ts"), "utf8");
  assert.match(routeSource, /withDekoCleanAdmin/, "Mission Control data remains behind admin authorization");
  assert.match(routeSource, /missionControlError/, "Mission Control failure is isolated from other DekoClean data");
  const component = fs.readFileSync(path.join(process.cwd(), "app/admin/dekoclean/MissionControlAnalytics.tsx"), "utf8");
  assert.match(component, /dkMissionDomainCard/, "domain scores render as separate cards");
  assert.match(component, /dkMissionDomains dkDomainGrid/, "loaded domains retain the semantic grid class");
  assert.match(component, /dkMissionCharts dkAnalyticsGrid/, "loaded analytics retain the semantic grid class");
  assert.match(component, /لا تتوفر قياسات أداء فعلية حتى الآن/, "performance unavailable state is explicit");
  assert.match(component, /severityLabels\[key\]/, "severity counts use separate localized labels");
  assert.match(component, /dkMissionOutcomeCounts/, "maintenance outcomes use separate cards");
  assert.match(component, /dkMissionRecommendations/, "recommendations use a non-overlapping card grid");
  assert.equal((component.match(/function MissionControlSkeleton/g) ?? []).length, 0, "loading no longer mounts a replacement Mission Control component");
  assert.match(component, /data: MissionControlAnalytics \| null/, "one Mission Control component accepts loading and loaded values");
  assert.match(component, /const resolvedData = data \?\? emptyMissionControl/, "loading changes values without replacing the card tree");
  const css = fs.readFileSync(path.join(process.cwd(), "app/admin/dekoclean/dekoclean.css"), "utf8");
  assert.match(css, /\.dkCleanPage\{[^}]*overflow-x:clip/, "page-level horizontal overflow is prevented");
  assert.match(css, /\.dkMissionTableScroll\{[^}]*overflow-x:auto/, "horizontal scrolling is scoped to technical chart tables");
  assert.match(css, /\.dkCleanTechnical dd\{[^}]*overflow-wrap:anywhere/, "technical paths wrap safely");
  assert.match(css, /\.dkMissionDomains\{display:grid/, "domain cards use a responsive grid");
  assert.match(css, /\.dkCleanTabs button\.active/, "active tab styling remains available");
  const center = fs.readFileSync(path.join(process.cwd(), "app/admin/dekoclean/DekoCleanCenter.tsx"), "utf8");
  assert.match(center, /import "\.\/dekoclean\.css"/, "the hydrated client owner imports Mission Control styles");
  assert.match(center, /className="dkMissionControl"/, "loading and loaded content share one persistent Mission Control shell");
  assert.match(center, /data-render-state=\{renderState\}/, "the persistent shell exposes its render state");
  assert.doesNotMatch(center, /MissionControlSkeleton/, "DekoCleanCenter never swaps Mission Control components after loading");
  assert.match(center, /useCallback\(async \(\) =>[\s\S]*?\}, \[\]\)/, "initial load does not repeat when selected finding changes");
  assert.match(center, /dkCleanQuickActions/, "quick actions use a dedicated visual section");
  assert.match(center, /role="tab" aria-selected=/, "tab state remains accessible");
  console.log("DekoClean Mission Control fixture tests passed.");
} finally { fs.rmSync(root, { recursive: true, force: true }); }
