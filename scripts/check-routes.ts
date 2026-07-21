import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { routeAuditPaths } from "../app/config/routes.ts";

const root = resolve(import.meta.dirname, "..");
const appRoot = resolve(root, "app");
const sourceRoots = [appRoot, resolve(root, "src")];

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function routePattern(file: string): RegExp {
  const route = relative(appRoot, file)
    .split(sep)
    .slice(0, -1)
    .filter((segment) => !/^\(.+\)$/.test(segment))
    .map((segment) => {
      if (/^\[\[\.\.\..+\]\]$/.test(segment)) return "(?:/.+)?";
      if (/^\[\.\.\..+\]$/.test(segment)) return "/.+";
      if (/^\[.+\]$/.test(segment)) return "/[^/]+";
      return `/${segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
    })
    .join("");
  return new RegExp(`^${route || "/"}/?$`);
}

const pageFiles = walk(appRoot).filter((file) => file.endsWith(`${sep}page.tsx`));
const routePatterns = pageFiles.map(routePattern);
const sourceFiles = sourceRoots.filter((directory) => statSync(directory).isDirectory()).flatMap(walk);
const issues: string[] = [];
const internalLinks = new Set<string>();
let linkElements = 0;
let buttonElements = 0;
let clickHandlers = 0;

function normalizePath(value: string) {
  return value.split(/[?#]/, 1)[0] || "/";
}

function isKnownPath(path: string) {
  return routePatterns.some((pattern) => pattern.test(normalizePath(path)));
}

for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  const display = relative(root, file);
  linkElements += (source.match(/<(?:Link|a)\b/g) ?? []).length;
  buttonElements += (source.match(/<button\b/g) ?? []).length;
  clickHandlers += (source.match(/\bonClick\s*=/g) ?? []).length;

  const literalPatterns = [
    /\bhref\s*=\s*["']([^"']*)["']/g,
    /\bhref\s*:\s*["']([^"']*)["']/g,
    /\brouter\.(?:push|replace)\(\s*["']([^"']*)["']/g,
    /\bwindow\.location(?:\.href)?\s*=\s*["']([^"']*)["']/g,
  ];

  for (const pattern of literalPatterns) {
    for (const match of source.matchAll(pattern)) {
      const value = match[1].trim();
      if (!value || value === "#") {
        issues.push(`${display}: empty or hash-only navigation target`);
        continue;
      }
      if (!value.startsWith("/") || value.startsWith("//")) continue;
      if (/^\/(?:images|videos|api)\//.test(value)) continue;
      internalLinks.add(value);
      if (!isKnownPath(value)) issues.push(`${display}: route not found for ${value}`);
    }
  }
}

for (const path of routeAuditPaths) {
  internalLinks.add(path);
  if (!isKnownPath(path)) issues.push(`app/config/routes.ts: route not found for ${path}`);
}

const uniqueIssues = [...new Set(issues)].sort();
console.log(`Pages discovered: ${pageFiles.length}`);
console.log(`Internal routes checked: ${internalLinks.size}`);
console.log(`Link elements inventoried: ${linkElements}`);
console.log(`Button elements inventoried: ${buttonElements}`);
console.log(`onClick handlers inventoried: ${clickHandlers}`);

if (uniqueIssues.length) {
  console.error(`\nRoute audit failed with ${uniqueIssues.length} issue(s):`);
  uniqueIssues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
} else {
  console.log("\nRoute audit passed: no empty, hash-only, or unmatched literal internal routes.");
}
