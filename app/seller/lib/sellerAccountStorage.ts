"use client";

import {
  getAllSellers,
  getSellerById,
  type SellerAccount,
  type SellerAccountStatus,
  type SellerPlan,
  type SellerStoreProfile,
} from "../../data/sellers";

export const STATUS_KEY = "dekokraft_seller_account_status_v1";
export const PROFILE_KEY = "dekokraft_seller_profiles_v1";
export const STORE_KEY = "dekokraft_seller_store_profiles_v1";

export type CreateParticipantInput = {
  ownerName: string;
  email: string;
  storeName: string;
  plan: SellerPlan;
  craftType: string;
  language: "ar" | "de" | "en" | "fr";
  temporaryPassword: string;
  status: SellerAccountStatus;
};

function parseMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, T> : {};
  } catch {
    return {};
  }
}

function isCompleteSellerAccount(value: Partial<SellerAccount>): value is SellerAccount {
  return typeof value.id === "string"
    && typeof value.sellerNumber === "number"
    && typeof value.ownerName === "string"
    && typeof value.email === "string"
    && typeof value.status === "string"
    && typeof value.plan === "string"
    && typeof value.joinedAt === "string"
    && Boolean(value.store);
}

function readCreatedParticipants(): SellerAccount[] {
  return Object.values(parseMap<Partial<SellerAccount>>(PROFILE_KEY))
    .filter(isCompleteSellerAccount)
    .filter((seller) => !getSellerById(seller.id));
}

function dispatchChange() {
  window.dispatchEvent(new CustomEvent("seller-account-change"));
}

function saveMap<T>(key: string, value: Record<string, T>) {
  localStorage.setItem(key, JSON.stringify(value));
  dispatchChange();
}

function baseSeller(participantId: string) {
  return getSellerById(participantId) ?? readCreatedParticipants().find((seller) => seller.id === participantId);
}

function applyOverrides(base: SellerAccount): SellerAccount {
  const statuses = parseMap<SellerAccountStatus>(STATUS_KEY);
  const profiles = parseMap<Partial<SellerAccount>>(PROFILE_KEY);
  const stores = parseMap<SellerStoreProfile>(STORE_KEY);
  return {
    ...base,
    ...profiles[base.id],
    id: base.id,
    sellerNumber: base.sellerNumber,
    status: statuses[base.id] ?? base.status,
    plan: base.plan,
    store: stores[base.id] ?? base.store,
  };
}

export function getEffectiveSeller(participantId: string): SellerAccount | undefined {
  const base = baseSeller(participantId);
  return base ? applyOverrides(base) : undefined;
}

export function getEffectiveSellers() {
  const records = [...getAllSellers(), ...readCreatedParticipants()];
  return records.map(applyOverrides);
}

export function createParticipant(input: CreateParticipantInput): SellerAccount {
  const ownerName = input.ownerName.trim();
  const email = input.email.trim().toLowerCase();
  const storeName = input.storeName.trim();
  const craftType = input.craftType.trim();
  if (!ownerName || !email || !storeName || !craftType || !input.temporaryPassword.trim()) {
    throw new Error("يرجى تعبئة جميع الحقول المطلوبة.");
  }
  const existing = getEffectiveSellers();
  if (existing.some((seller) => seller.email.toLowerCase() === email)) throw new Error("البريد الإلكتروني مستخدم بالفعل.");
  const sellerNumber = Math.max(0, ...existing.map((seller) => seller.sellerNumber)) + 1;
  const participantId = `seller-${String(sellerNumber).padStart(3, "0")}`;
  const slugBase = storeName.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\p{L}]+/gu, "-").replace(/^-|-$/g, "") || participantId;
  const storeSlug = existing.some((seller) => seller.store.storeSlug === slugBase) ? `${slugBase}-${sellerNumber}` : slugBase;
  const participant: SellerAccount = {
    id: participantId,
    sellerNumber,
    ownerName,
    email,
    status: input.status,
    plan: input.plan,
    joinedAt: new Date().toISOString(),
    store: {
      storeName,
      storeSlug,
      shortDescription: `متجر ${storeName} للمنتجات المصنوعة بعناية.`,
      country: "ألمانيا",
      city: "برلين",
      currency: "EUR",
      languages: [input.language],
      categories: [craftType],
    },
  };
  // The current development login does not validate passwords yet. Never persist
  // the temporary plaintext password in localStorage; production auth will own it.
  const profiles = parseMap<Partial<SellerAccount>>(PROFILE_KEY);
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profiles, [participantId]: participant }));
  dispatchChange();
  return participant;
}

export function setSellerStatus(participantId: string, status: SellerAccountStatus) {
  if (!baseSeller(participantId)) return;
  saveMap(STATUS_KEY, { ...parseMap<SellerAccountStatus>(STATUS_KEY), [participantId]: status });
}

export function saveSellerProfile(participantId: string, updates: Pick<SellerAccount, "ownerName" | "email" | "phone">) {
  if (!baseSeller(participantId)) return;
  const profiles = parseMap<Partial<SellerAccount>>(PROFILE_KEY);
  saveMap(PROFILE_KEY, { ...profiles, [participantId]: { ...profiles[participantId], ...updates } });
}

export function touchSellerLogin(participantId: string) {
  const seller = getEffectiveSeller(participantId);
  if (!seller) return;
  const profiles = parseMap<Partial<SellerAccount>>(PROFILE_KEY);
  saveMap(PROFILE_KEY, { ...profiles, [participantId]: { ...profiles[participantId], ownerName: seller.ownerName, email: seller.email, phone: seller.phone, lastLoginAt: new Date().toISOString() } });
}

export function saveSellerStore(participantId: string, store: SellerStoreProfile) {
  if (!baseSeller(participantId)) return;
  saveMap(STORE_KEY, { ...parseMap<SellerStoreProfile>(STORE_KEY), [participantId]: store });
}

export function isStoreSlugAvailable(slug: string, participantId: string) {
  return !getEffectiveSellers().some((seller) => seller.id !== participantId && seller.store.storeSlug === slug);
}
