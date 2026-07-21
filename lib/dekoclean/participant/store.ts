import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { ParticipantAdminEscalation, ParticipantMaintenanceState } from "./types.ts";

function safeParticipantKey(participantId: string): string { return createHash("sha256").update(participantId).digest("hex").slice(0, 24); }
export function participantMaintenanceRoot(projectRoot = process.cwd()): string { return path.join(projectRoot, ".dekoclean", "participant-maintenance"); }
export function participantStorageRoot(participantId: string, projectRoot = process.cwd()): string { return path.join(participantMaintenanceRoot(projectRoot), "participants", safeParticipantKey(participantId)); }
function statePath(participantId: string, projectRoot = process.cwd()): string { return path.join(participantStorageRoot(participantId, projectRoot), "state.json"); }
function escalationPath(projectRoot = process.cwd()): string { return path.join(participantMaintenanceRoot(projectRoot), "admin-escalations.json"); }

function emptyState(participantId: string): ParticipantMaintenanceState {
  return { version: 1, participantId, scans: [], findings: [], quarantine: [], cleanPreviews: [], recoveryManifests: [], operations: [], resourceHashes: {}, containment: { active: false, participantId, affectedResourceCount: 0, adminReviewStatus: "not-required" } };
}

export function readParticipantMaintenanceState(participantId: string, projectRoot = process.cwd()): ParticipantMaintenanceState {
  try {
    const parsed = JSON.parse(fs.readFileSync(statePath(participantId, projectRoot), "utf8")) as ParticipantMaintenanceState;
    return parsed.version === 1 && parsed.participantId === participantId ? parsed : emptyState(participantId);
  } catch { return emptyState(participantId); }
}

export function writeParticipantMaintenanceState(state: ParticipantMaintenanceState, projectRoot = process.cwd()): ParticipantMaintenanceState {
  const target = statePath(state.participantId, projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const bounded: ParticipantMaintenanceState = { ...state, scans: state.scans.slice(-100), findings: state.findings.slice(-500), quarantine: state.quarantine.slice(-250), cleanPreviews: state.cleanPreviews.slice(-50), recoveryManifests: state.recoveryManifests.slice(-100), operations: state.operations.slice(-300) };
  fs.writeFileSync(target, `${JSON.stringify(bounded, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return bounded;
}

export function readAdminEscalations(projectRoot = process.cwd()): ParticipantAdminEscalation[] {
  try { const parsed: unknown = JSON.parse(fs.readFileSync(escalationPath(projectRoot), "utf8")); return Array.isArray(parsed) ? parsed as ParticipantAdminEscalation[] : []; }
  catch { return []; }
}

export function appendAdminEscalation(entry: ParticipantAdminEscalation, projectRoot = process.cwd()): void {
  const target = escalationPath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify([...readAdminEscalations(projectRoot), entry].slice(-500), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}
