import Link from 'next/link';
import {
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Bot,
  Zap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const COMPETITORS = [
  {
    name: 'Vercel',
    dateUpdated: 'September 2026',
    tagline: 'Best for Next.js frontend teams needing global edge CDN and per-branch preview URLs.',
    fusionhostAdvantage:
      'Agent-native MCP entrypoint; auto-provisions full PostgreSQL; no serverless timeout cliffs for background tasks.',
    whenCompetitorBetter:
      'Choose Vercel if you need instant global edge network caching for static assets, preview comments on PRs, or advanced ISR/Next.js edge middleware.',
    matrix: {
      agentNativeMcp: false,
      zeroConfigPostgres: false,
      noDockerfileRequired: true,
      perBranchPreviews: true,
      scaleToZeroContainers: false,
      failureIsFree: false,
    },
  },
  {
    name: 'Railway',
    dateUpdated: 'September 2026',
    tagline: 'Versatile PaaS with canvas template orchestration and broad database support.',
    fusionhostAdvantage:
      'Single-instruction agent deployment; deterministic manifest citations; no canvas clicking required.',
    whenCompetitorBetter:
      'Choose Railway if you need horizontal multi-container autoscaling, managed Redis/MySQL/MongoDB out of the box, or visual canvas topology editing.',
    matrix: {
      agentNativeMcp: false,
      zeroConfigPostgres: true,
      noDockerfileRequired: true,
      perBranchPreviews: true,
      scaleToZeroContainers: true,
      failureIsFree: false,
    },
  },
  {
    name: 'Render',
    dateUpdated: 'September 2026',
    tagline: 'Traditional cloud replacement with managed services and background workers.',
    fusionhostAdvantage:
      'Instant AI agent feedback loop; faster cold starts; zero YAML committed to your repository.',
    whenCompetitorBetter:
      'Choose Render if you need persistent SSD disk mounts, dedicated background worker processes (Celery/Sidekiq), or private networks between services.',
    matrix: {
      agentNativeMcp: false,
      zeroConfigPostgres: true,
      noDockerfileRequired: true,
      perBranchPreviews: true,
      scaleToZeroContainers: true,
      failureIsFree: false,
    },
  },
  {
    name: 'Heroku',
    dateUpdated: 'September 2026',
    tagline: 'The pioneer of git-push PaaS with a mature dyno and add-on ecosystem.',
    fusionhostAdvantage:
      'Built agent-first for the 2026 AI era; generous free tier with scale-to-zero; modern buildpack engine.',
    whenCompetitorBetter:
      'Choose Heroku if your enterprise relies on established add-on marketplace partners or legacy Ruby/Java enterprise buildpacks.',
    matrix: {
      agentNativeMcp: false,
      zeroConfigPostgres: true,
      noDockerfileRequired: true,
      perBranchPreviews: true,
      scaleToZeroContainers: false,
      failureIsFree: false,
    },
  },
  {
    name: 'Cloudflare Pages / Workers',
    dateUpdated: 'September 2026',
    tagline: 'Hyper-distributed serverless V8 isolates with 0ms cold starts.',
    fusionhostAdvantage:
      'Runs real standard Node.js & Python runtime containers without non-standard edge runtime workarounds.',
    whenCompetitorBetter:
      'Choose Cloudflare if your app can run inside standard V8 isolates, needs global ultra-low latency, and uses D1/KV storage.',
    matrix: {
      agentNativeMcp: false,
      zeroConfigPostgres: false,
      noDockerfileRequired: true,
      perBranchPreviews: true,
      scaleToZeroContainers: true,
      failureIsFree: true,
    },
  },
];

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Radically Sourced Comparisons
        </h1>
        <p className="text-base sm:text-lg text-slate-400 mt-4 leading-relaxed">
          FusionHost is not trying to be everything to everyone. Here is an honest, dated breakdown of how we compare against the landscape — including when competitors are genuinely the better choice.
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-8 mb-20">
        {COMPETITORS.map((comp) => (
          <div
            key={comp.name}
            className="rounded-2xl border border-border/70 bg-surface/70 p-6 sm:p-8 flex flex-col space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/40">
              <div>
                <h3 className="text-2xl font-bold text-white">FusionHost vs {comp.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{comp.tagline}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-background px-2.5 py-1 rounded border border-border/40 self-start sm:self-auto">
                Updated: {comp.dateUpdated}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Why FusionHost is Built Different
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {comp.fusionhostAdvantage}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="font-semibold text-amber-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  When {comp.name} is the Better Choice
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {comp.whenCompetitorBetter}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Matrix */}
      <div className="rounded-2xl border border-border/70 bg-surface p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-6">At a Glance Feature Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 text-slate-400 font-mono">
                <th className="pb-3 pr-4">Feature</th>
                <th className="pb-3 px-4 text-primary font-bold">FusionHost</th>
                <th className="pb-3 px-4">Vercel</th>
                <th className="pb-3 px-4">Railway</th>
                <th className="pb-3 px-4">Render</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-slate-300">
              <tr>
                <td className="py-3 pr-4 font-medium text-white">Agent-First MCP Protocol</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Native Stdio &amp; agent.md</td>
                <td className="py-3 px-4 text-slate-500">No</td>
                <td className="py-3 px-4 text-slate-500">No</td>
                <td className="py-3 px-4 text-slate-500">No</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">Deterministic Citations</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">File-cited App Spec</td>
                <td className="py-3 px-4 text-slate-500">Opaque build</td>
                <td className="py-3 px-4 text-slate-500">Nixpacks inferred</td>
                <td className="py-3 px-4 text-slate-500">Manual config</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">Auto-Provision PostgreSQL</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Automatic on client import</td>
                <td className="py-3 px-4 text-slate-500">Paid add-on</td>
                <td className="py-3 px-4 text-slate-300">Manual plugin</td>
                <td className="py-3 px-4 text-slate-300">Manual database</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">Failed Deploys Cost</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Always ₹0 (Free)</td>
                <td className="py-3 px-4 text-slate-400">Counts against build min</td>
                <td className="py-3 px-4 text-slate-400">Billed per second</td>
                <td className="py-3 px-4 text-slate-400">Billed per minute</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">Published Limitations Page</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Yes (/limitations)</td>
                <td className="py-3 px-4 text-slate-500">Buried in docs</td>
                <td className="py-3 px-4 text-slate-500">Buried in docs</td>
                <td className="py-3 px-4 text-slate-500">Buried in docs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
