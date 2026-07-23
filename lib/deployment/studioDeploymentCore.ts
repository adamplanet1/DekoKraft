export type StudioDeploymentStatus = {
  configured: boolean;
  status: "unavailable" | "queued" | "in_progress" | "success" | "failure";
  startedAt?: string;
  completedAt?: string;
  version?: string;
};

export type DeploymentEnvironment = Record<string, string | undefined>;

export function deploymentConfiguration(env: DeploymentEnvironment) {
  const repository = env.GITHUB_REPOSITORY?.trim();
  const workflowId = env.GITHUB_DEPLOY_WORKFLOW_ID?.trim();
  const branch = env.GITHUB_DEPLOY_BRANCH?.trim();
  const token = env.GITHUB_TOKEN?.trim();
  return { repository, workflowId, branch, token, configured: Boolean(repository && workflowId && branch && token) };
}

export function sanitizedDeploymentStatus(env: DeploymentEnvironment): StudioDeploymentStatus {
  const config = deploymentConfiguration(env);
  return { configured: config.configured, status: "unavailable", version: env.GITHUB_SHA?.slice(0, 7) };
}
