import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesRoot = path.join(root, "github-pages");
const pagesPublic = path.join(pagesRoot, "public");
const pagesOutput = path.join(pagesRoot, "out");
const rootOutput = path.join(root, "out");
fs.rmSync(pagesPublic, { recursive: true, force: true });
fs.cpSync(path.join(root, "public"), pagesPublic, { recursive: true });
fs.rmSync(path.join(pagesPublic, "images", "admin"), { recursive: true, force: true });
const result = spawnSync(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build", pagesRoot, "--webpack"], { cwd: root, env: { ...process.env, DEKOKRAFT_STATIC_EXPORT: "true" }, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
fs.rmSync(rootOutput, { recursive: true, force: true });
fs.cpSync(pagesOutput, rootOutput, { recursive: true });
for (const required of ["index.html", "404.html"]) if (!fs.existsSync(path.join(rootOutput, required))) throw new Error(`Static export is missing ${required}.`);
console.log(`GitHub Pages static export copied to ${rootOutput}`);
