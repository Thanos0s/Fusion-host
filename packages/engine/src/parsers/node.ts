import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AppSpec, RequiredEnvVar } from '@fusionhost/types';

export interface NodeParseResult {
  appName: string;
  version: string;
  framework: string;
  buildCommand?: string;
  startCommand: string;
  port: number;
  needsPostgres: boolean;
  requiredEnvVars: RequiredEnvVar[];
  citations: Record<string, string>;
}

export function isNodeProject(dirPath: string): boolean {
  return fs.existsSync(path.join(dirPath, 'package.json'));
}

export function parseNodeProject(dirPath: string): NodeParseResult {
  const pkgPath = path.join(dirPath, 'package.json');
  const pkgContent = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgContent);

  const citations: Record<string, string> = {
    manifest: 'package.json',
  };

  const appName = pkg.name || path.basename(dirPath) || 'node-app';
  if (pkg.name) {
    citations['appName'] = 'package.json#name';
  }

  // Version inference
  const version = (pkg.engines && pkg.engines.node) ? String(pkg.engines.node).replace(/[^0-9.]/g, '') : '22';
  if (pkg.engines && pkg.engines.node) {
    citations['version'] = 'package.json#engines.node';
  } else {
    citations['version'] = 'default (Node.js 22 LTS)';
  }

  const scripts = pkg.scripts || {};
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {})
  };

  // Framework detection
  let framework = 'Node.js (Standard)';
  let defaultPort = 3000;
  let startCommand = 'npm start';
  let buildCommand: string | undefined = undefined;

  if (allDeps['next']) {
    framework = 'Next.js';
    defaultPort = 3000;
    citations['framework'] = 'package.json#dependencies.next';
    if (scripts.build) buildCommand = 'npm run build';
    startCommand = scripts.start ? 'npm start' : 'npx next start';
    citations['startCommand'] = scripts.start ? 'package.json#scripts.start' : 'next default';
  } else if (allDeps['@nestjs/core']) {
    framework = 'NestJS';
    defaultPort = 3000;
    citations['framework'] = 'package.json#dependencies.@nestjs/core';
    if (scripts.build) buildCommand = 'npm run build';
    startCommand = scripts['start:prod'] ? 'npm run start:prod' : (scripts.start ? 'npm start' : 'node dist/main.js');
    citations['startCommand'] = 'package.json#scripts';
  } else if (allDeps['fastify']) {
    framework = 'Fastify';
    defaultPort = 3000;
    citations['framework'] = 'package.json#dependencies.fastify';
    if (scripts.build) buildCommand = 'npm run build';
    startCommand = scripts.start ? 'npm start' : (pkg.main ? `node ${pkg.main}` : 'node index.js');
    citations['startCommand'] = scripts.start ? 'package.json#scripts.start' : 'package.json#main';
  } else if (allDeps['express']) {
    framework = 'Express';
    defaultPort = 3000;
    citations['framework'] = 'package.json#dependencies.express';
    if (scripts.build) buildCommand = 'npm run build';
    startCommand = scripts.start ? 'npm start' : (pkg.main ? `node ${pkg.main}` : 'node server.js');
    citations['startCommand'] = scripts.start ? 'package.json#scripts.start' : 'package.json#main';
  } else if (allDeps['vite']) {
    framework = 'Vite';
    defaultPort = 4173;
    citations['framework'] = 'package.json#dependencies.vite';
    if (scripts.build) buildCommand = 'npm run build';
    startCommand = scripts.preview ? 'npm run preview -- --port 4173 --host 0.0.0.0' : 'npx vite preview --port 4173 --host 0.0.0.0';
    citations['startCommand'] = scripts.preview ? 'package.json#scripts.preview' : 'vite preview';
  } else {
    citations['framework'] = 'inferred from package.json';
    if (scripts.build) buildCommand = 'npm run build';
    if (scripts.start) {
      startCommand = 'npm start';
      citations['startCommand'] = 'package.json#scripts.start';
    } else if (pkg.main && fs.existsSync(path.join(dirPath, pkg.main))) {
      startCommand = `node ${pkg.main}`;
      citations['startCommand'] = 'package.json#main';
    } else if (fs.existsSync(path.join(dirPath, 'server.js'))) {
      startCommand = 'node server.js';
      citations['startCommand'] = 'server.js (auto-detected)';
    } else if (fs.existsSync(path.join(dirPath, 'index.js'))) {
      startCommand = 'node index.js';
      citations['startCommand'] = 'index.js (auto-detected)';
    }
  }

  // Database detection (Postgres)
  let needsPostgres = false;
  const postgresPackages = ['pg', 'postgres', '@prisma/client', 'drizzle-orm', 'typeorm', 'knex', 'sequelize'];
  for (const p of postgresPackages) {
    if (allDeps[p]) {
      needsPostgres = true;
      citations['needsPostgres'] = `package.json#dependencies.${p}`;
      break;
    }
  }

  // Check Prisma schema datasource provider
  const prismaSchemaPath = path.join(dirPath, 'prisma', 'schema.prisma');
  if (fs.existsSync(prismaSchemaPath)) {
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    if (/provider\s*=\s*["']postgresql["']/i.test(schemaContent)) {
      needsPostgres = true;
      citations['needsPostgres'] = 'prisma/schema.prisma#datasource.provider';
    }
  }

  // Inferred port scan
  let port = defaultPort;
  citations['port'] = `framework default (${defaultPort})`;

  // Required env vars
  const requiredEnvVars: RequiredEnvVar[] = [];
  if (needsPostgres) {
    requiredEnvVars.push({
      name: 'DATABASE_URL',
      required: true,
      citedIn: citations['needsPostgres'] || 'PostgreSQL client detected',
      description: 'Automatically provisioned by FusionHost'
    });
  }

  return {
    appName,
    version,
    framework,
    buildCommand,
    startCommand,
    port,
    needsPostgres,
    requiredEnvVars,
    citations,
  };
}
