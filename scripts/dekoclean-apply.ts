import { applyDekoClean } from "../lib/dekoclean/quarantine.ts";

const confirmed = process.argv.includes("--confirm");
if (!confirmed) {
  console.error("DekoClean apply refused: pass --confirm after reviewing dekoclean:preview.");
  process.exitCode = 2;
} else {
  const manifest = applyDekoClean({ confirmed: true });
  if (!manifest) throw new Error("DekoClean confirmation was not accepted.");
  console.log(`Quarantined ${manifest.entries.length} paths.`);
  console.log(`Manifest: ${manifest.id}`);
  console.log(`Validation status: ${manifest.status}`);
  if (manifest.status === "validation-failed") {
    console.error(`Validation failed. Restore with: npm run dekoclean:restore -- ${manifest.id}`);
    process.exitCode = 1;
  }
}
