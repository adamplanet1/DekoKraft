import "server-only";

import { deploymentConfiguration, sanitizedDeploymentStatus, type DeploymentEnvironment, type StudioDeploymentStatus } from "./studioDeploymentCore.ts";
export type { StudioDeploymentStatus } from "./studioDeploymentCore.ts";

export function getLocalStudioDeploymentStatus(env: DeploymentEnvironment = process.env): StudioDeploymentStatus {
  return sanitizedDeploymentStatus(env);
}

export async function getStudioDeploymentStatus(
  env: DeploymentEnvironment = process.env,
  request: typeof fetch = fetch,
): Promise<StudioDeploymentStatus> {
  const config = deploymentConfiguration(env);
  if (!config.configured) return sanitizedDeploymentStatus(env);
  const response = await request(`https://api.github.com/repos/${config.repository}/actions/workflows/${encodeURIComponent(config.workflowId!)}/runs?branch=${encodeURIComponent(config.branch!)}&per_page=1`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${config.token}`, "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("GITHUB_DEPLOYMENT_STATUS_FAILED");
  const body = await response.json() as { workflow_runs?: Array<{ status?: string; conclusion?: string | null; run_started_at?: string; updated_at?: string; head_sha?: string }> };
  const run = body.workflow_runs?.[0];
  if (!run) return { configured: true, status: "unavailable" };
  const status: StudioDeploymentStatus["status"] = run.status === "queued" ? "queued" : run.status === "in_progress" ? "in_progress" : run.conclusion === "success" ? "success" : "failure";
  return { configured: true, status, startedAt: run.run_started_at, completedAt: run.status === "completed" ? run.updated_at : undefined, version: run.head_sha?.slice(0, 7) };
}

export async function triggerConfiguredStudioDeployment(
  confirmed: boolean,
  env: DeploymentEnvironment = process.env,
  request: typeof fetch = fetch,
): Promise<StudioDeploymentStatus> {
  if (!confirmed) throw new Error("DEPLOYMENT_CONFIRMATION_REQUIRED");
  const config = deploymentConfiguration(env);
  if (!config.configured) throw new Error("GITHUB_DEPLOYMENT_NOT_CONFIGURED");
  const response = await request(`https://api.github.com/repos/${config.repository}/actions/workflows/${encodeURIComponent(config.workflowId!)}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: config.branch }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("GITHUB_DEPLOYMENT_TRIGGER_FAILED");
  return { configured: true, status: "queued", startedAt: new Date().toISOString(), version: env.GITHUB_SHA?.slice(0, 7) };
}
