import { getAllSellers, getSellerById, type SellerAccount } from "../../app/data/sellers.ts";
import type { ParticipantId, ParticipantProfile } from "./types.ts";

const statusMap: Record<SellerAccount["status"], ParticipantProfile["status"]> = {
  invited: "pending",
  active: "active",
  paused: "suspended",
  suspended: "suspended",
};

export function sellerAccountToParticipant(account: SellerAccount): ParticipantProfile {
  return {
    participantId: account.id,
    name: account.ownerName,
    storeName: account.store.storeName,
    email: account.email,
    status: statusMap[account.status],
    createdAt: account.joinedAt,
    approvedAt: account.status === "active" ? account.joinedAt : undefined,
  };
}

/** Shared adapter over the existing seller registry; no second account array is created. */
export function getParticipantRegistry(): ParticipantProfile[] {
  return getAllSellers().map(sellerAccountToParticipant);
}

export function getParticipantProfile(participantId: ParticipantId): ParticipantProfile | undefined {
  const account = getSellerById(participantId);
  return account ? sellerAccountToParticipant(account) : undefined;
}

export function isKnownParticipant(participantId: ParticipantId) {
  return Boolean(getSellerById(participantId));
}
