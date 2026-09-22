import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { analyzeProject } from '@fusionhost/engine';

const CONTROL_PLANE_URL = process.env.FUSIONHOST_URL || 'http://localhost:4000';

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
                text: JSON.stringify({
                  status: 'ANALYZED_OFFLINE',
                  message: `Control plane at ${CONTROL_PLANE_URL} is offline. Verified AppSpec locally:`,
                  appSpec: spec,
                  actionRequired: 'Start the FusionHost control plane daemon via "npm run dev:control-plane"'
                }, null, 2),
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
          const res = await fetch(`${CONTROL_PLANE_URL}/api/deployments/${deployment_id}/logs?limit=${limit}`);
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
