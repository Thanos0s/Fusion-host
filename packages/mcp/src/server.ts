import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { GitHubImportResult } from '@fusionhost/types';
import { analyzeProject } from '@fusionhost/engine';

const CONTROL_PLANE_URL = process.env.FUSIONHOST_URL || 'http://localhost:4000';

function parseOwnerAndRepo(repoUrl: string): { owner: string; repo: string } {
  const ghMatch = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?/i);
  if (ghMatch) {
    return { owner: ghMatch[1], repo: ghMatch[2] };
  }

  if (fs.existsSync(repoUrl)) {
    const base = path.basename(path.resolve(repoUrl));
    return { owner: 'local', repo: base || 'repo' };
  }

  const trimmed = repoUrl.trim().replace(/^https?:\/\//, '').replace(/\.git$/, '');
  const parts = trimmed.split(/[\/\\]/).filter((p) => Boolean(p) && !p.includes(':'));
  if (parts.length >= 2) {
    return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
  }

  const baseName = path.basename(repoUrl).replace(/\.git$/, '') || 'repo';
  return { owner: 'local', repo: baseName.replace(/[:*?"<>|]/g, '_') };
}

export function createFusionHostMcpServer(): Server {
  const server = new Server(
    {
      name: 'fusionhost-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'analyze_repository',
          description:
            'Deterministically inspects a repository folder, producing an AppSpec with runtime, port, citations, and hazards (ephemeral disk writes, missing env vars, unsupported services).',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Absolute or relative path to project directory',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'import_github_repository',
          description:
            'Clones and analyzes a GitHub repository into a local FusionHost workspace, returning the deterministic AppSpec with citations, hazards, and local cloned path ready for deploy_app',
          inputSchema: {
            type: 'object',
            properties: {
              repo_url: {
                type: 'string',
                description: 'GitHub repository HTTPS URL (e.g. https://github.com/owner/repo)',
              },
              branch: {
                type: 'string',
                description: 'Branch or tag name (default: main)',
              },
              app_name: {
                type: 'string',
                description: 'Optional custom application name',
              },
              token: {
                type: 'string',
                description:
                  'Optional GitHub Personal Access Token for private repositories (or GITHUB_TOKEN env var)',
              },
            },
            required: ['repo_url'],
          },
        },
        {
          name: 'deploy_app',
          description:
            'Deploys an application using FusionHost. Auto-provisions PostgreSQL if needed, synthesizes container, and assigns live URL.',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to application folder',
              },
              app_name: {
                type: 'string',
                description: 'Optional custom application name',
              },
              env_vars: {
                type: 'object',
                description: 'Optional environment variables / secrets',
                additionalProperties: { type: 'string' },
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'get_deployment_status',
          description:
            'Retrieves current state of a deployment (BUILDING, HEALTHY, FAILED, CRASHED), container status, and live URL.',
          inputSchema: {
            type: 'object',
            properties: {
              deployment_id: {
                type: 'string',
                description: 'The unique deployment ID',
              },
            },
            required: ['deployment_id'],
          },
        },
        {
          name: 'get_deployment_logs',
          description:
            'Returns build and runtime stdout/stderr logs for a deployment, enabling autonomous error diagnosis and fixing.',
          inputSchema: {
            type: 'object',
            properties: {
              deployment_id: {
                type: 'string',
                description: 'The deployment ID to read logs from',
              },
              limit: {
                type: 'number',
                description: 'Maximum log lines to return (default 50)',
              },
            },
            required: ['deployment_id'],
          },
        },
        {
          name: 'rollback_app',
          description:
            'Instantly rolls back an application to a previous successful deployment tag.',
          inputSchema: {
            type: 'object',
            properties: {
              app_name: {
                type: 'string',
                description: 'Application name to rollback',
              },
              target_deployment_id: {
                type: 'string',
                description: 'Target deployment ID to restore',
              },
            },
            required: ['app_name', 'target_deployment_id'],
          },
        },
        {
          name: 'list_apps',
          description: 'Lists all registered FusionHost applications, status, and endpoints.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // Handle tool invocations
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      if (name === 'analyze_repository') {
        const projectPath = (args as { path: string }).path;
        const spec = await analyzeProject(projectPath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(spec, null, 2),
            },
          ],
        };
      }

      if (name === 'import_github_repository') {
        const { repo_url, branch = 'main', app_name, token } = args as {
          repo_url: string;
          branch?: string;
          app_name?: string;
          token?: string;
        };

        if (!repo_url || typeof repo_url !== 'string') {
          throw new Error('repo_url is required');
        }

        const effectiveToken = token || process.env.GITHUB_TOKEN;
        const { owner, repo } = parseOwnerAndRepo(repo_url);
        const targetDir = path.resolve(process.cwd(), '.fusionhost/repos', owner, repo);

        fs.mkdirSync(path.dirname(targetDir), { recursive: true });

        if (fs.existsSync(repo_url)) {
          // Local source directory (e.g. testing or simulated repository)
          if (fs.existsSync(targetDir)) {
            try {
              fs.rmSync(targetDir, { recursive: true, force: true });
            } catch {
              // continue
            }
          }
          fs.mkdirSync(targetDir, { recursive: true });
          fs.cpSync(repo_url, targetDir, { recursive: true });
        } else if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
          let cloneUrl = repo_url;
          if (effectiveToken && repo_url.startsWith('https://github.com/')) {
            const encodedToken = encodeURIComponent(effectiveToken);
            cloneUrl = repo_url.replace('https://github.com/', `https://${encodedToken}@github.com/`);
          }

          try {
            execFileSync(
              'git',
              ['-c', 'credential.helper=', 'clone', '--depth', '1', '-b', branch, cloneUrl, targetDir],
              {
                stdio: 'pipe',
                timeout: 60000,
                env: {
                  ...process.env,
                  GIT_TERMINAL_PROMPT: '0',
                  GCM_INTERACTIVE: 'never',
                },
              }
            );
          } catch (err: any) {
            if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
              const stderrText = err.stderr ? err.stderr.toString() : '';
              let errMsg = stderrText || err.message || String(err);
              if (effectiveToken) {
                errMsg = errMsg
                  .replaceAll(effectiveToken, '***')
                  .replaceAll(encodeURIComponent(effectiveToken), '***');
              }
              throw new Error(`Failed to clone repository: ${errMsg.trim()}`);
            }
          }
        }

        const spec = await analyzeProject(targetDir);
        const finalAppName = app_name || spec.appName || repo;

        const result: GitHubImportResult = {
          success: true,
          localPath: targetDir,
          appName: finalAppName,
          spec,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (name === 'deploy_app') {
        const { path: appPath, app_name, env_vars } = args as {
          path: string;
          app_name?: string;
          env_vars?: Record<string, string>;
        };

        try {
          const res = await fetch(`${CONTROL_PLANE_URL}/api/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: appPath, appName: app_name, envVars: env_vars }),
          });
          const data = await res.json();
          return {
            content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
          };
        } catch (fetchErr) {
          // If daemon not running yet, analyze local repo and return helpful launch instructions
          const spec = await analyzeProject(appPath);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    status: 'ANALYZED_OFFLINE',
                    message: `Control plane at ${CONTROL_PLANE_URL} is offline. Verified AppSpec locally:`,
                    appSpec: spec,
                    actionRequired:
                      'Start the FusionHost control plane daemon via "npm run dev:control-plane"',
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
      }

      if (name === 'get_deployment_status') {
        const { deployment_id } = args as { deployment_id: string };
        try {
          const res = await fetch(`${CONTROL_PLANE_URL}/api/deployments/${deployment_id}`);
          const data = await res.json();
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (err: any) {
          return {
            isError: true,
            content: [{ type: 'text', text: `Failed to contact control plane: ${err.message}` }],
          };
        }
      }

      if (name === 'get_deployment_logs') {
        const { deployment_id, limit = 50 } = args as { deployment_id: string; limit?: number };
        try {
          const res = await fetch(
            `${CONTROL_PLANE_URL}/api/deployments/${deployment_id}/logs?limit=${limit}`
          );
          const data = await res.json();
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (err: any) {
          return {
            isError: true,
            content: [{ type: 'text', text: `Failed to fetch logs: ${err.message}` }],
          };
        }
      }

      if (name === 'rollback_app') {
        const { app_name, target_deployment_id } = args as {
          app_name: string;
          target_deployment_id: string;
        };
        try {
          const res = await fetch(`${CONTROL_PLANE_URL}/api/rollback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName: app_name, targetDeploymentId: target_deployment_id }),
          });
          const data = await res.json();
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (err: any) {
          return {
            isError: true,
            content: [{ type: 'text', text: `Failed to execute rollback: ${err.message}` }],
          };
        }
      }

      if (name === 'list_apps') {
        try {
          const res = await fetch(`${CONTROL_PLANE_URL}/api/apps`);
          const data = await res.json();
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch {
          return { content: [{ type: 'text', text: JSON.stringify({ apps: [] }, null, 2) }] };
        }
      }

      return {
        isError: true,
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }],
      };
    }
  });

  return server;
}

export async function runStdioServer() {
  const server = createFusionHostMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
