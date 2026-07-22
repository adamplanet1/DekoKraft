import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const studio = fs.readFileSync(path.join(root, "app/studio/components/EchoImageStudio.tsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "app/studio/studio.css"), "utf8");

assert.match(studio, /useState<StudioTool>\(null\)/, "Studio must enter through an explicit idle tool state");
assert.match(studio, /activeStudioTool === null \? \(/, "idle state must replace the active workspace content");
assert.match(studio, /مرحبًا بكم في EchoDeko Studio/, "idle canvas must show the Arabic welcome title");
assert.match(studio, /aria-pressed=\{activeStudioTool === "image"\}/, "image tool must expose its pressed state");
assert.match(studio, /activeStudioTool === "image" && !isSmartEditOpen/, "Smart Edit launcher must stay hidden until image processing is active");
assert.match(styles, /\.studio-welcome-state\s*\{/, "welcome state styling must exist");
assert.match(styles, /\.studio-tool-button\.is-active/, "explicit active tool styling must exist");

console.log("Studio idle welcome-state verification passed.");
