import { restoreDekoCleanManifest } from "../lib/dekoclean/restore.ts";

const manifestId = process.argv[2];
if (!manifestId) {
  console.error("Usage: npm run dekoclean:restore -- <manifest-id>");
  process.exitCode = 2;
} else {
  const manifest = restoreDekoCleanManifest(process.cwd(), manifestId);
  console.log(`Restored ${manifest.entries.length} paths from manifest ${manifest.id}.`);
}
