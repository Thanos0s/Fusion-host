import Link from 'next/link';
import {
  Sparkles,
  Terminal,
  Cpu,
  Database,
  ArrowRight,
  GitBranch,
  FolderUp,
  RotateCcw,
  Zap,
  ShieldCheck,
  Check,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import AppSpecSandbox from '@/components/AppSpecSandbox';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform-as-a-Service for the AI Agent Era</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          "Tell your agent once,{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-cyan to-accent-emerald">
            ship your app
          </span>
          "
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          No Dockerfile. No CI/CD YAML. No cloud console clicks. FusionHost inspects your code, provisions PostgreSQL automatically, builds a secure container, and keeps it running.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent-cyan hover:from-primary-hover hover:to-accent-cyan text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            Launch Console Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-elevated text-slate-200 border border-border px-6 py-3.5 rounded-xl font-medium transition-colors"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            Install MCP for Claude / Cursor
          </Link>
        </div>

        {/* Live Timings & Benchmarks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border border-border/60 bg-surface/50 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
          <div className="text-left border-r border-border/40 pr-4 last:border-0">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Code Analysis</span>
            <p className="text-2xl font-bold text-white mt-0.5">&lt; 1.5s</p>
            <span className="text-[11px] text-emerald-400">100% deterministic</span>
          </div>
          <div className="text-left border-r border-border/40 pr-4 last:border-0">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Server App Build</span>
            <p className="text-2xl font-bold text-white mt-0.5">&lt; 22s</p>
            <span className="text-[11px] text-emerald-400">Multi-stage cache</span>
          </div>
          <div className="text-left border-r border-border/40 pr-4 last:border-0">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Cold-Start Wake</span>
            <p className="text-2xl font-bold text-white mt-0.5">~1.8s</p>
            <span className="text-[11px] text-accent-cyan">Scale-to-zero idle</span>
          </div>
          <div className="text-left">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Instant Rollback</span>
            <p className="text-2xl font-bold text-white mt-0.5">&lt; 4s</p>
            <span className="text-[11px] text-primary">Pre-built image tag</span>
          </div>
        </div>
      </section>

      {/* Interactive App Spec Sandbox */}
      <section id="sandbox" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AppSpecSandbox />
      </section>

      {/* Three Ways In Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase text-primary font-semibold tracking-wider">
            Ingestion &amp; Deploy Triggers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            "Three Ways In"
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Equally engineered for autonomous AI coding agents and hands-on human builders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Way 1 */}
          <div className="bg-surface rounded-2xl border border-border/60 p-6 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. From a Coding Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Your agent connects via our official MCP server. It analyzes the repo, reviews hazards, deploys, reads back logs on failure, and iterates autonomously without relaying errors through you.
              </p>
            </div>
            <div className="bg-background rounded-lg p-2.5 font-mono text-[11px] text-primary border border-border/40">
              npx @fusionhost/mcp
            </div>
          </div>

          {/* Way 2 */}
          <div className="bg-surface rounded-2xl border border-border/60 p-6 flex flex-col justify-between hover:border-accent-cyan/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan mb-4">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. From a Git Repository</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Connect your GitHub or GitLab repo once. Every push to the default branch packages and releases automatically, with a toggle for instant auto-ship vs. manual confirmation.
              </p>
            </div>
            <div className="bg-background rounded-lg p-2.5 font-mono text-[11px] text-accent-cyan border border-border/40">
              git push origin main
            </div>
          </div>

          {/* Way 3 */}
          <div className="bg-surface rounded-2xl border border-border/60 p-6 flex flex-col justify-between hover:border-accent-emerald/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center text-accent-emerald mb-4">
                <FolderUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. From a Local Folder</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                No Git commit required. Pick or drag a local directory in the FusionHost web dashboard. The engine analyzes and deploys your local work-in-progress code instantly.
              </p>
            </div>
            <div className="bg-background rounded-lg p-2.5 font-mono text-[11px] text-accent-emerald border border-border/40">
              Drag &amp; drop to /dashboard
            </div>
          </div>
        </div>
      </section>

      {/* Radical Honesty / Limitations Teaser */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              Product Principle: Radical Transparency
            </div>
            <h3 className="text-2xl font-bold text-white">
              Say what's out of scope, loudly.
            </h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              We publish our limitations right on the front door. FusionHost is single-instance, PostgreSQL-only, with an ephemeral filesystem and scale-to-zero compute. We don't want you discovering our boundaries in production.
            </p>
          </div>
          <Link
            href="/limitations"
            className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
          >
            Read Explicit Constraints
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="border border-border/60 bg-gradient-to-b from-surface to-background p-10 sm:p-16 rounded-3xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Ready to ship with zero config?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Join developers and coding agents building on FusionHost. Deploys take seconds, and failed builds never cost a rupee.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-cyan text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Open Management Console
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-surface hover:bg-surface-elevated border border-border text-slate-300 font-medium px-6 py-3.5 rounded-xl transition-colors"
            >
              View Free &amp; Pro Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
