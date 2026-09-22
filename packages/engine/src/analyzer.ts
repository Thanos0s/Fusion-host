import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AppSpec } from '@fusionhost/types';
import { isNodeProject, parseNodeProject } from './parsers/node.js';
import { isPythonProject, parsePythonProject } from './parsers/python.js';
import { detectHazards } from './hazards.js';
import { generateDockerfile } from './dockerfile.js';

export interface AnalyzeOptions {
  suppliedEnvVars?: Record<string, string>;
}

export async function analyzeProject(
  dirPath: string,
  options: AnalyzeOptions = {}
): Promise<AppSpec> {
  const resolvedPath = path.resolve(dirPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Project directory does not exist: ${resolvedPath}`);
  }

  const customDockerfilePath = path.join(resolvedPath, 'Dockerfile');
  const hasExistingDockerfile = fs.existsSync(customDockerfilePath);

  let appName = path.basename(resolvedPath);
  let runtime: AppSpec['runtime'] = 'node';
  let version = '22';
  let framework = 'Generic';
  let buildCommand: string | undefined;
  let startCommand = 'npm start';
  let port = 3000;
  let needsPostgres = false;
  let requiredEnvVars: AppSpec['requiredEnvVars'] = [];
  let citations: Record<string, string> = {};

  if (isNodeProject(resolvedPath)) {
    const parsed = parseNodeProject(resolvedPath);
    appName = parsed.appName;
    runtime = 'node';
    version = parsed.version;
    framework = parsed.framework;
    buildCommand = parsed.buildCommand;
    startCommand = parsed.startCommand;
    port = parsed.port;
    needsPostgres = parsed.needsPostgres;
    requiredEnvVars = parsed.requiredEnvVars;
    citations = parsed.citations;
  } else if (isPythonProject(resolvedPath)) {
    const parsed = parsePythonProject(resolvedPath);
    appName = parsed.appName;
    runtime = 'python';
    version = parsed.version;
    framework = parsed.framework;
    buildCommand = parsed.buildCommand;
    startCommand = parsed.startCommand;
    port = parsed.port;
    needsPostgres = parsed.needsPostgres;
    requiredEnvVars = parsed.requiredEnvVars;
    citations = parsed.citations;
  } else {
    // Check if static html exists
    if (fs.existsSync(path.join(resolvedPath, 'index.html'))) {
      runtime = 'static';
      version = '1.0';
      framework = 'Static HTML';
      startCommand = 'serve';
      port = 80;
      citations['runtime'] = 'index.html detected';
      citations['framework'] = 'Static site';
    } else {
      runtime = hasExistingDockerfile ? 'dockerfile' : 'node';
      version = 'latest';
      framework = 'Custom Container';
      startCommand = 'run';
      port = 8080;
      citations['runtime'] = hasExistingDockerfile ? 'Dockerfile detected' : 'default fallback';
    }
  }

  if (hasExistingDockerfile) {
    citations['dockerfile'] = 'Existing Dockerfile in repo root (will be respected)';
  }

  // Detect static code hazards
  const hazards = detectHazards(resolvedPath, options.suppliedEnvVars || {});

  const spec: AppSpec = {
    appName,
    runtime,
    version,
    framework,
    buildCommand,
    startCommand,
    port,
    needsPostgres,
    hasExistingDockerfile,
    requiredEnvVars,
    citations,
    hazards,
  };

  return spec;
}

export { generateDockerfile };
