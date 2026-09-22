import Link from 'next/link';
import {
  ShieldAlert,
  Server,
  Database,
  HardDrive,
  GitBranch,
  Clock,
  Globe,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

const LIMITATIONS = [
  {
    id: 'single-instance',
    title: 'One Instance Per Application',
    tag: 'Single Container',
    icon: Server,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    description:
      'FusionHost runs exactly 1 container instance per application. We do not provision autoscaling pools behind a horizontal load balancer.',
    whenAcceptable:
      'Side projects, early-stage MVPs, internal tooling, agent experiments, low-to-medium traffic SaaS apps.',
    whenNotRecommended:
      'High-throughput distributed systems requiring zero-downtime rolling blue-green upgrades or active-active multi-region failover.',
  },
  {
    id: 'postgres-only',
    title: 'PostgreSQL Only (Managed)',
    tag: 'Database Boundary',
    icon: Database,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    description:
      'We automatically provision PostgreSQL when your code imports a Postgres client. We do not provision Redis, MongoDB, MySQL, Cassandra, or Elasticsearch.',
    whenAcceptable:
      'Apps using relational schema, Prisma, Drizzle, TypeORM, SQLAlchemy, or Postgres-as-queue.',
    whenNotRecommended:
      'If you need Redis or Mongo, you must bring your own (e.g. Upstash, MongoDB Atlas) and pass credentials as environment variables.',
  },
  {
    id: 'ephemeral-disk',
    title: 'Ephemeral Local Filesystem',
    tag: 'No Local Disk Persistence',
    icon: HardDrive,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/10',
    description:
      'Anything written to local disk (e.g. fs.writeFile, local SQLite file, temporary file uploads) is wiped when the container restarts or redeploys.',
    whenAcceptable:
      'Stateless web applications storing persistent files in object storage and state in PostgreSQL.',
    whenNotRecommended:
      'Applications relying on local SQLite databases or storing media uploads directly on the local server filesystem without S3.',
  },
  {
    id: 'no-staging-urls',
    title: 'No Per-Branch Preview Environments',
    tag: 'Single Release Track',
    icon: GitBranch,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-500/10',
    description:
      'FusionHost deploys one active release per project. We do not generate ephemeral preview URLs for every pull request or git branch in v1.',
    whenAcceptable:
      'Fast-iterating solo builders and AI agents working on the main track with instant one-click rollback if something breaks.',
    whenNotRecommended:
      'Enterprise teams requiring formal multi-stage staging / QA approval sign-offs on separate URLs.',
  },
  {
    id: 'limited-cron-no-workers',
    title: 'Limited Cron, No Background Worker Daemons',
    tag: 'Process Scope',
    icon: Clock,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    description:
      'You can schedule a small number of cron HTTP triggers. However, separate background worker processes (e.g. Celery workers, BullMQ queues) defined in Procfile do not run.',
    whenAcceptable:
      'Typical web applications where async tasks run in-process or via scheduled cron webhooks.',
    whenNotRecommended:
      'Heavy background worker fleets with complex distributed message broker topologies.',
  },
  {
    id: 'no-custom-domains-free',
    title: 'No Custom Domains on Free Tier',
    tag: 'Tiers & DNS',
    icon: Globe,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    description:
      'Free tier apps are served under the default *.fusionhost.local or generated subdomain. Custom domains (with auto-TLS certificate renewal) require the Pro plan.',
    whenAcceptable:
      'Development, testing, agent sandbox environments, internal demonstrations.',
    whenNotRecommended:
      'Commercial brand deployments that require a primary apex domain (e.g. yourcompany.com) on day one without upgrading.',
  },
];

export default function LimitationsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-400 mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Section 10: Explicit Platform Constraints</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Where FusionHost Stops
        </h1>
        <p className="text-base sm:text-lg text-slate-400 mt-4 leading-relaxed">
          Most cloud platforms hide their architectural edges in small print. We believe a short, honest limitations list beats a long feature list nobody trusts.
        </p>
      </div>

      {/* Constraints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {LIMITATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border ${item.borderColor} bg-surface/70 p-6 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-background border border-border/40 text-slate-400">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/40 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-400">Great for: </span>
                    <span className="text-slate-400">{item.whenAcceptable}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-400">Not suited for: </span>
                    <span className="text-slate-400">{item.whenNotRecommended}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Callout */}
      <div className="rounded-2xl border border-border/60 bg-surface p-8 text-center max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-2">
          Does your application fit within these constraints?
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          If so, you will enjoy the fastest, zero-config deployment experience available for AI agents and humans alike.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-primary-hover transition-colors"
          >
            Deploy on FusionHost
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/compare"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            See how we compare vs Vercel &amp; Railway &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
