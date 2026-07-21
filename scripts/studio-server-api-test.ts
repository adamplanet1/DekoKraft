import assert from "node:assert/strict";
import { isStudioServerApiAvailable, studioServerApiUrl, studioServerFetch } from "../app/studio/lib/studioServerApi.ts";

const previousAvailability = process.env.NEXT_PUBLIC_STUDIO_SERVER_API;
const previousBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

try {
  process.env.NEXT_PUBLIC_STUDIO_SERVER_API = "false";
  process.env.NEXT_PUBLIC_BASE_PATH = "/DekoKraft";

  assert.equal(isStudioServerApiAvailable(), false);
  assert.equal(studioServerApiUrl("/api/echo-guide/recommend/"), "/DekoKraft/api/echo-guide/recommend/");

  const response = await studioServerFetch("/api/echo-guide/recommend/", { method: "POST" });
  const payload = await response.json() as { success?: boolean; message?: string };
  assert.equal(response.status, 503);
  assert.equal(payload.success, false);
  assert.match(payload.message ?? "", /GitHub Pages/);
} finally {
  if (previousAvailability === undefined) delete process.env.NEXT_PUBLIC_STUDIO_SERVER_API;
  else process.env.NEXT_PUBLIC_STUDIO_SERVER_API = previousAvailability;
  if (previousBasePath === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = previousBasePath;
}

console.log("Studio server API boundary tests passed.");
