export type RuntimeType = 'node' | 'python' | 'static' | 'dockerfile';

export type HazardSeverity = 'warning' | 'danger' | 'info';

export type HazardRule =
  | 'ephemeral-disk-write'
  | 'missing-env-var'
  | 'unsupported-service'
  | 'port-conflict'
  | 'unsupported-runtime';

export interface Hazard {
  ruleId: HazardRule;
  severity: HazardSeverity;
  message: string;
  fileCitation?: string;
  suggestion?: string;
}

export interface RequiredEnvVar {
  name: string;
  required: boolean;
  citedIn: string;
  description?: string;
}

export interface AppSpec {
  appName: string;
  runtime: RuntimeType;
  version: string;
  framework: string;
  entrypoint?: string;
  buildCommand?: string;
  startCommand: string;
  port: number;
  needsPostgres: boolean;
  hasExistingDockerfile: boolean;
  requiredEnvVars: RequiredEnvVar[];
  citations: Record<string, string>;
  hazards: Hazard[];
}

export type DeploymentStatus =
  | 'QUEUED'
  | 'ANALYZING'
  | 'PROVISIONING'
  | 'BUILDING'
  | 'STARTING'
  | 'HEALTHY'
  | 'FAILED'
  | 'CRASHED'
  | 'SLEEPING';

export interface Deployment {
  id: string;
  appId: string;
  appName: string;
  status: DeploymentStatus;
  imageTag: string;
  port: number;
  internalPort: number;
  containerId?: string;
  databaseUrl?: string;
  envVars: Record<string, string>;
  appSpec: AppSpec;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppRecord {
  id: string;
  name: string;
  sourcePath: string;
  activeDeploymentId?: string;
  status: DeploymentStatus;
  liveUrl: string;
  port: number;
  needsPostgres: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeployOptions {
  path: string;
  appName?: string;
  envVars?: Record<string, string>;
}

export interface DeploymentLogEntry {
  timestamp: string;
  stream: 'stdout' | 'stderr' | 'system';
  message: string;
}

export interface GitHubUser {
  login: string;
  name?: string;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  totalPrivateRepos?: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  description?: string;
  defaultBranch: string;
  language?: string;
  stars: number;
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  protected?: boolean;
}

export interface GitHubImportResult {
  success: boolean;
  localPath: string;
  appName: string;
  spec: AppSpec;
}
