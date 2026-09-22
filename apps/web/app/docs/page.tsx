import Link from 'next/link';
import {
  Terminal,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  ShieldAlert,
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentation &amp; Agent Protocol</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          FusionHost Documentation
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Learn how to deploy your apps with a single instruction or connect your coding agent autonomously.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: AI Agent Setup */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface border border-border/70">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="text-xl font-bold text-white">Connecting Your AI Coding Agent</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            FusionHost provides an official Model Context Protocol (MCP) server. Configure it in Claude Code, Cursor, or Windsurf:
          </p>

          <div className="bg-background rounded-xl p-4 border border-border/60 overflow-x-auto mb-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
              ~/.cursor/mcp.json or claude_desktop_config.json
            </span>
            <pre className="text-xs font-mono text-cyan-300">
              <code>{`{
  "mcpServers": {
    "fusionhost": {
      "command": "node",
      "args": ["${'path-to-fusionhost'}/packages/mcp/dist/bin/fusionhost-mcp.js"]
    }
  }
}`}</code>
            </pre>
          </div>

          <div className="p-3 bg-surface-elevated/50 rounded-lg text-xs text-slate-300 flex items-center justify-between">
            <span>Machine-readable instruction file for agents:</span>
            <Link
              href="/api/agent-md"
              target="_blank"
              className="text-primary hover:underline font-mono inline-flex items-center gap-1"
            >
              /api/agent-md
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* Section 2: Zero-Config Container Packaging */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface border border-border/70">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="text-xl font-bold text-white">Zero-Config Container Engine</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            You don't need to write or maintain a Dockerfile. When you trigger a deploy, the FusionHost engine:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc list-inside mb-4">
            <li>Detects your language: Node.js (package.json) or Python (requirements.txt / pyproject.toml).</li>
            <li>Infers start commands (e.g. <code className="text-slate-200">next start</code>, <code className="text-slate-200">npm start</code>, <code className="text-slate-200">uvicorn main:app</code>).</li>
            <li>Synthesizes an in-memory multi-stage container build targeting slim, non-root runner images.</li>
            <li>Respects existing Dockerfiles if already present in the root of your repository.</li>
          </ul>
        </section>

        {/* Section 3: Automatic PostgreSQL Provisioning */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface border border-border/70">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              3
            </div>
            <h2 className="text-xl font-bold text-white">Automatic PostgreSQL Provisioning</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            If your application imports <code className="text-cyan-300">pg</code>, <code className="text-cyan-300">@prisma/client</code>, <code className="text-cyan-300">drizzle-orm</code>, <code className="text-cyan-300">psycopg2</code>, or <code className="text-cyan-300">asyncpg</code>, FusionHost will:
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 bg-background/80 p-4 rounded-xl border border-border/40 font-mono">
            <p className="text-emerald-400">&gt; 1. Auto-spin containerized PostgreSQL on fusionhost-net</p>
            <p className="text-emerald-400">&gt; 2. Execute CREATE DATABASE "fusionhost_&lt;app&gt;"</p>
            <p className="text-emerald-400">&gt; 3. Auto-inject DATABASE_URL into application runtime environment</p>
          </div>
        </section>

        {/* Section 4: Scale-to-Zero & Operations */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface border border-border/70">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              4
            </div>
            <h2 className="text-xl font-bold text-white">Scale-to-Zero &amp; Instant Rollback</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            Apps sleep when idle for 10 minutes, consuming zero compute. On the next HTTP visit, the ingress proxy holds the socket connection, wakes the container in ~1.8 seconds, and forwards the buffered request.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every successful release image is tagged and preserved locally. If a new deployment breaks your application, click <strong>"Rollback"</strong> in the dashboard or have your agent call <code className="text-purple-300">rollback_app</code> to revert immediately.
          </p>
        </section>
      </div>

      <div className="mt-16 p-8 rounded-2xl border border-border/70 bg-surface/50 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Ready to test FusionHost?</h3>
        <p className="text-xs text-slate-400 mb-6">Explore the web dashboard or upload a local directory directly.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-primary-hover transition-colors"
        >
          Open Console Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
