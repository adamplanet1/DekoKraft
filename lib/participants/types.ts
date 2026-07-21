export type ParticipantId = string;

export type AppRole = "admin" | "participant" | "visitor";

export interface ParticipantIdentity {
  participantId: ParticipantId;
  role: AppRole;
  name: string;
  storeName?: string;
  email?: string;
  preferredLanguage?: string;
}

export interface ParticipantProfile {
  participantId: ParticipantId;
  name: string;
  storeName?: string;
  email?: string;
  status: "pending" | "active" | "suspended" | "rejected";
  createdAt: string;
  approvedAt?: string;
}

export type LegacyParticipantRecord = {
  participantId?: unknown;
  sellerId?: unknown;
  vendorId?: unknown;
};

export function normalizeParticipantId(record: LegacyParticipantRecord | null | undefined): ParticipantId | undefined {
  if (!record) return undefined;
  for (const value of [record.participantId, record.sellerId, record.vendorId]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

