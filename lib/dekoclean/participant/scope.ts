import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { getSellerProducts } from "../../../app/data/sellerProducts.ts";
import { getSellerById } from "../../../app/data/sellers.ts";
import { readParticipantMaintenanceState } from "./store.ts";
import type { ParticipantResource } from "./types.ts";

function sha256(value: string | Buffer): string { return createHash("sha256").update(value).digest("hex"); }

function publicAssetMetadata(reference: string, projectRoot: string): { sizeBytes?: number; checksum: string } {
  if (!reference.startsWith("/") || reference.includes("..") || reference.startsWith("//")) return { checksum: sha256(reference) };
  const publicRoot = path.join(projectRoot, "public");
  const target = path.resolve(publicRoot, reference.slice(1));
  const relative = path.relative(publicRoot, target);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(target) || !fs.statSync(target).isFile()) return { checksum: sha256(reference) };
  const content = fs.readFileSync(target);
  return { sizeBytes: content.length, checksum: sha256(content) };
}

export function collectParticipantResources(participantId: string, projectRoot = process.cwd()): ParticipantResource[] {
  const resources: ParticipantResource[] = [];
  for (const product of getSellerProducts(participantId)) {
    const metadata = JSON.stringify({ id: product.id, title: product.title, category: product.category, status: product.status, updatedAt: product.updatedAt, imageIds: product.images.map((image) => image.id) });
    resources.push({ resourceId: `product:${product.id}`, participantId, displayName: product.title, category: "product", modifiedAt: product.updatedAt, checksum: sha256(metadata), published: product.status === "published", protected: true });
    for (const image of product.images) {
      const asset = publicAssetMetadata(image.url, projectRoot);
      resources.push({ resourceId: `product-image:${product.id}:${image.id}`, participantId, displayName: `${product.title} — ${image.alt || "صورة المنتج"}`, category: "image", reference: image.url, sizeBytes: asset.sizeBytes, modifiedAt: product.updatedAt, checksum: asset.checksum, published: product.status === "published", protected: true });
    }
  }
  const seller = getSellerById(participantId);
  for (const [kind, reference] of [["شعار المتجر", seller?.store.logoUrl], ["غلاف المتجر", seller?.store.bannerUrl]] as const) {
    if (!reference) continue;
    const asset = publicAssetMetadata(reference, projectRoot);
    resources.push({ resourceId: `store-asset:${sha256(`${kind}:${reference}`).slice(0, 16)}`, participantId, displayName: kind, category: "store-asset", reference, sizeBytes: asset.sizeBytes, checksum: asset.checksum, published: true, protected: true });
  }
  const state = readParticipantMaintenanceState(participantId, projectRoot);
  for (const record of state.quarantine.filter((item) => !["released", "deleted-by-admin"].includes(item.status))) {
    resources.push({ resourceId: record.resourceId, participantId, displayName: record.displayName, category: "document", mimeType: record.mimeType, sizeBytes: record.sizeBytes, modifiedAt: record.updatedAt, checksum: record.checksum, published: false, protected: false });
  }
  return resources;
}
