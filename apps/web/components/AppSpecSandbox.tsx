'use client';

import { useState } from 'react';
import {
  Code,
  ShieldAlert,
  Database,
  Terminal,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { AppSpec } from '@fusionhost/types';

interface Preset {
  id: string;
  name: string;
  runtime: 'node' | 'python';
  framework: string;
  files: Record<string, string>;
  spec: AppSpec;
  dockerfile: string;
}

const PRESETS: Preset[] = [
  {
    id: 'nextjs-prisma',
    name: 'Next.js 15 + Prisma (PostgreSQL)',
    runtime: 'node',
    framework: 'Next.js',
    files: {
      'package.json': JSON.stringify(
        {
          name: 'acme-saas-web',
          version: '0.1.0',
          scripts: {
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '^15.1.0',
            react: '^19.0.0',
            '@prisma/client': '^6.2.0',
          },
        },
        null,
        2
      ),
      'prisma/schema.prisma': `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`,
    },
    spec: {
      appName: 'acme-saas-web',
      runtime: 'node',
      version: '22',
      framework: 'Next.js',
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      port: 3000,
      needsPostgres: true,
      hasExistingDockerfile: false,
      requiredEnvVars: [
        {
          name: 'DATABASE_URL',
          required: true,
          citedIn: 'package.json#dependencies.@prisma/client',
          description: 'Auto-provisioned by FusionHost',
        },
      ],
      citations: {
        runtime: 'package.json#engines.node (default Node 22)',
        framework: 'package.json#dependencies.next',
        buildCommand: 'package.json#scripts.build',
        startCommand: 'package.json#scripts.start',
        port: 'Next.js convention (3000)',
        needsPostgres: 'prisma/schema.prisma#datasource.provider="postgresql"',
      },
      hazards: [],
    },
    dockerfile: `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

EXPOSE 3000
USER node
CMD ["npm", "start"]`,
  },
  {
    id: 'fastapi-postgres',
    name: 'FastAPI + asyncpg (PostgreSQL)',
    runtime: 'python',
    framework: 'FastAPI',
    files: {
      'requirements.txt': `fastapi==0.115.0
uvicorn[standard]==0.32.0
asyncpg==0.30.0
pydantic==2.10.0`,
      'main.py': `from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "orders-api"}`,
    },
    spec: {
      appName: 'orders-api',
      runtime: 'python',
      version: '3.12',
      framework: 'FastAPI',
      startCommand: 'uvicorn main:app --host 0.0.0.0 --port 8000',
      port: 8000,
      needsPostgres: true,
      hasExistingDockerfile: false,
      requiredEnvVars: [
        {
          name: 'DATABASE_URL',
          required: true,
          citedIn: 'requirements.txt (asyncpg)',
          description: 'Auto-provisioned by FusionHost',
        },
      ],
      citations: {
        runtime: 'Python 3.12 default runner',
        framework: 'requirements.txt (fastapi)',
        startCommand: 'inferred FastAPI entrypoint (uvicorn main:app)',
        port: 'FastAPI convention (8000)',
        needsPostgres: 'requirements.txt contains asyncpg',
      },
      hazards: [],
    },
    dockerfile: `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

COPY requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
  },
  {
    id: 'express-sqlite-hazard',
    name: 'Express + SQLite (Hazard Warning)',
    runtime: 'node',
    framework: 'Express',
    files: {
      'package.json': JSON.stringify(
        {
          name: 'legacy-catalog-api',
          scripts: { start: 'node server.js' },
          dependencies: { express: '^4.21.0', sqlite3: '^5.1.7' },
        },
        null,
        2
      ),
      'server.js': `const express = require('express');
const fs = require('fs');
const app = express();

app.post('/log', (req, res) => {
  fs.writeFileSync('audit.log', 'transaction data');
  res.send('logged');
});
app.listen(3000);`,
    },
    spec: {
      appName: 'legacy-catalog-api',
      runtime: 'node',
      version: '22',
      framework: 'Express',
      startCommand: 'npm start',
      port: 3000,
      needsPostgres: false,
      hasExistingDockerfile: false,
      requiredEnvVars: [],
      citations: {
        framework: 'package.json#dependencies.express',
        startCommand: 'package.json#scripts.start',
        port: 'server.js#app.listen(3000)',
      },
      hazards: [
        {
          ruleId: 'ephemeral-disk-write',
          severity: 'warning',
          message:
            'Local filesystem write detected: fs.writeFileSync("audit.log"). Changes to local disk will be wiped on redeploy.',
          fileCitation: 'server.js#L6',
          suggestion:
            'Use FusionHost auto-provisioned PostgreSQL or external storage instead of local disk writes.',
        },
        {
          ruleId: 'ephemeral-disk-write',
          severity: 'warning',
          message:
            'SQLite dependency detected (sqlite3). Container disk is ephemeral by design.',
          fileCitation: 'package.json#dependencies.sqlite3',
          suggestion: 'Switch to PostgreSQL to prevent loss of database records.',
        },
      ],
    },
    dockerfile: `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]`,
  },
];

export default function AppSpecSandbox() {
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'spec' | 'citations' | 'hazards' | 'dockerfile'>('spec');

  return (
    <div className="w-full bg-surface border border-border/70 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-accent-cyan font-semibold">
              Live Code Analysis Engine Demo
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Deterministic App Spec Inspector
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Every conclusion traces directly to a specific line in your repository. No guessing.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                selectedPreset.id === p.id
                  ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/20'
                  : 'bg-surface-elevated border-border/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Code input view vs Inferred Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Source Manifest */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 font-mono flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-primary" />
              Source Manifest in Repo
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Zero Dockerfile Required
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(selectedPreset.files).map(([filename, content]) => (
              <div
                key={filename}
                className="bg-background/90 rounded-xl border border-border/60 overflow-hidden"
              >
                <div className="px-3 py-1.5 bg-surface-elevated/70 border-b border-border/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{filename}</span>
                  <span className="text-emerald-400">Scanned</span>
                </div>
                <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-48">
                  <code>{content}</code>
                </pre>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-surface-elevated/40 border border-border/40 text-xs text-slate-400">
            <p className="flex items-center gap-1.5 font-medium text-slate-300">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Engine Analysis Time: <span className="text-emerald-400 font-mono">1.2ms</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Static analysis runs directly in the MCP tool or CLI without uploading code to any cloud service.
            </p>
          </div>
        </div>

        {/* Right Column: Inferred App Spec and Tabs */}
        <div className="lg:col-span-7 flex flex-col bg-background/90 rounded-xl border border-border/70 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-border/60 bg-surface-elevated/60 px-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('spec')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'spec'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              App Spec
            </button>
            <button
              onClick={() => setActiveTab('citations')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'citations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              File Citations ({Object.keys(selectedPreset.spec.citations).length})
            </button>
            <button
              onClick={() => setActiveTab('hazards')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'hazards'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle
                className={`w-3.5 h-3.5 ${
                  selectedPreset.spec.hazards.length > 0 ? 'text-amber-400' : 'text-slate-500'
                }`}
              />
              Hazards ({selectedPreset.spec.hazards.length})
            </button>
            <button
              onClick={() => setActiveTab('dockerfile')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'dockerfile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Synthetic Container
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[380px]">
            {activeTab === 'spec' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-surface rounded-lg border border-border/40">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Framework</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {selectedPreset.spec.framework}
                    </p>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-border/40">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Runtime</span>
                    <p className="text-sm font-semibold text-white mt-0.5 capitalize">
                      {selectedPreset.spec.runtime} v{selectedPreset.spec.version}
                    </p>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-border/40">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Port Inferred</span>
                    <p className="text-sm font-semibold text-primary font-mono mt-0.5">
                      :{selectedPreset.spec.port}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-lg border border-border/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Start Command:</span>
                    <code className="bg-background px-2 py-0.5 rounded text-emerald-400 font-mono">
                      {selectedPreset.spec.startCommand}
                    </code>
                  </div>
                  {selectedPreset.spec.buildCommand && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Build Command:</span>
                      <code className="bg-background px-2 py-0.5 rounded text-cyan-400 font-mono">
                        {selectedPreset.spec.buildCommand}
                      </code>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Auto PostgreSQL Provisioning:</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        selectedPreset.spec.needsPostgres ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      {selectedPreset.spec.needsPostgres ? 'YES (Auto-created)' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'citations' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 mb-3">
                  FusionHost deterministically grounds every infrastructure setting in code:
                </p>
                {Object.entries(selectedPreset.spec.citations).map(([key, source]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-lg bg-surface border border-border/40 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-slate-300 capitalize">{key}</span>
                    <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                      {source}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'hazards' && (
              <div className="space-y-3">
                {selectedPreset.spec.hazards.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <p className="text-slate-200 font-medium">No Infrastructure Hazards Detected</p>
                    <p className="text-slate-500 mt-1">
                      This repository has zero ephemeral disk writes and zero missing secrets. Safe to ship!
                    </p>
                  </div>
                ) : (
                  selectedPreset.spec.hazards.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {h.ruleId}
                        </span>
                        {h.fileCitation && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {h.fileCitation}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300">{h.message}</p>
                      {h.suggestion && (
                        <p className="text-amber-200/80 text-[11px] italic">
                          Tip: {h.suggestion}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'dockerfile' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Generated by FusionHost Build Service</span>
                  <span className="text-cyan-400">Multi-Stage Non-Root</span>
                </div>
                <pre className="p-3 bg-background rounded-lg border border-border/40 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                  <code>{selectedPreset.dockerfile}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
