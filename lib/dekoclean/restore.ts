import fs from "node:fs";
import path from "node:path";

import { checksumPath } from "./quarantine.ts";
import { resolveInsideProject } from "./pathSafety.ts";
import type { DekoCleanManifest } from "./types.ts";

export function restoreDekoCleanManifest(projectRoot: string, manifestId: string): DekoCleanManifest {
  if (!/^[\w.-]+$/.test(manifestId)) throw new Error("Invalid DekoClean manifest id.");
  const root = path.resolve(projectRoot);
  const manifestPath = path.join(root, ".dekoclean", "manifests", `${manifestId}.json`);
  const parsed: unknown = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!parsed || typeof parsed !== "object" || !("entries" in parsed) || !Array.isArray(parsed.entries)) {
    throw new Error("Invalid DekoClean manifest.");
  }
  const manifest = parsed as DekoCleanManifest;
  if (path.resolve(manifest.projectRoot) !== root) throw new Error("Manifest belongs to another project root.");

  const conflicts = manifest.entries.filter((entry) =>
    fs.existsSync(resolveInsideProject(root, entry.originalPath)));
  if (conflicts.length > 0) {
    throw new Error(`Restore refused because destinations exist: ${conflicts.map((entry) => entry.originalPath).join(", ")}`);
  }

  for (const entry of manifest.entries) {
    const quarantined = resolveInsideProject(root, entry.quarantinePath);
    if (!fs.existsSync(quarantined)) throw new Error(`Missing quarantined path: ${entry.quarantinePath}`);
    if (checksumPath(quarantined) !== entry.checksum) {
      throw new Error(`Checksum mismatch: ${entry.quarantinePath}`);
    }
  }

  for (const entry of manifest.entries) {
    const source = resolveInsideProject(root, entry.quarantinePath);
    const destination = resolveInsideProject(root, entry.originalPath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.renameSync(source, destination);
  }

  manifest.status = "restored";
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}
