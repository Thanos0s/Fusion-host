import Link from 'next/link';

const LIMITATIONS = [
  {
    id: 'single-instance',
    title: 'One Instance Per Application',
    tag: 'Single Container',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.25)',
    description: 'FusionHost runs exactly 1 container instance per application. We do not provision autoscaling pools behind a horizontal load balancer.',
    whenAcceptable: 'Side projects, early-stage MVPs, internal tooling, agent experiments, low-to-medium traffic SaaS apps.',
    whenNotRecommended: 'High-throughput distributed systems requiring zero-downtime rolling blue-green upgrades or active-active multi-region failover.',
  },
  {
    id: 'postgres-only',
    title: 'PostgreSQL Only (Managed)',
    tag: 'Database Boundary',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.25)',
    description: 'We automatically provision PostgreSQL when your code imports a Postgres client. We do not provision Redis, MongoDB, MySQL, Cassandra, or Elasticsearch.',
    whenAcceptable: 'Apps using relational schema, Prisma, Drizzle, TypeORM, SQLAlchemy, or Postgres-as-queue.',
    whenNotRecommended: 'If you need Redis or Mongo, you must bring your own (e.g. Upstash, MongoDB Atlas) and pass credentials as environment variables.',
  },
  {
    id: 'ephemeral-disk',
    title: 'Ephemeral Local Filesystem',
    tag: 'No Local Disk Persistence',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.25)',
    description: 'Anything written to local disk (e.g. fs.writeFile, local SQLite file, temporary file uploads) is wiped when the container restarts or redeploys.',
    whenAcceptable: 'Stateless web applications storing persistent files in object storage and state in PostgreSQL.',
    whenNotRecommended: 'Applications relying on local SQLite databases or storing media uploads directly on the local server filesystem without S3.',
  },
  {
    id: 'no-staging-urls',
    title: 'No Per-Branch Preview Environments',
    tag: 'Single Release Track',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.25)',
    description: 'FusionHost deploys one active release per project. We do not generate ephemeral preview URLs for every pull request or git branch in v1.',
    whenAcceptable: 'Fast-iterating solo builders and AI agents working on the main track with instant one-click rollback if something breaks.',
    whenNotRecommended: 'Enterprise teams requiring formal multi-stage staging / QA approval sign-offs on separate URLs.',
  },
  {
    id: 'limited-cron-no-workers',
    title: 'Limited Cron, No Background Worker Daemons',
    tag: 'Process Scope',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
    description: 'You can schedule a small number of cron HTTP triggers. However, separate background worker processes (e.g. Celery workers, BullMQ queues) defined in Procfile do not run.',
    whenAcceptable: 'Typical web applications where async tasks run in-process or via scheduled cron webhooks.',
    whenNotRecommended: 'Heavy background worker fleets with complex distributed message broker topologies.',
  },
  {
    id: 'no-custom-domains-free',
    title: 'No Custom Domains on Free Tier',
    tag: 'Tiers & DNS',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.25)',
    description: 'Free tier apps are served under the default *.fusionhost.local or generated subdomain. Custom domains (with auto-TLS certificate renewal) require the Pro plan.',
    whenAcceptable: 'Development, testing, agent sandbox environments, internal demonstrations.',
    whenNotRecommended: 'Commercial brand deployments that require a primary apex domain (e.g. yourcompany.com) on day one without upgrading.',
  },
];

export default function LimitationsPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.08)', fontSize: 12, fontWeight: 600, color: '#fbbf24', marginBottom: 16 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          Explicit Platform Constraints
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 16px', color: '#fff' }}>Where FusionHost Stops</h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', margin: '0 auto', maxWidth: 580, lineHeight: 1.65 }}>
          Most cloud platforms hide their architectural edges in small print. We believe a short, honest limitations list beats a long feature list nobody trusts.
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 56 }}>
        {LIMITATIONS.map(item => (
          <div key={item.id} style={{ background: '#0d0d0d', border: `1px solid ${item.border}`, borderRadius: 12, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" stroke={item.color} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <span style={{ fontSize: 10.5, fontFamily: 'monospace', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', background: '#000', padding: '3px 9px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.07)' }}>
                {item.tag}
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>{item.title}</h3>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.52)', lineHeight: 1.68, margin: '0 0 20px' }}>{item.description}</p>
            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="#22c55e" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>Great for: </span>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{item.whenAcceptable}</span>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>
                  <span style={{ color: '#f43f5e', fontWeight: 600 }}>Not suited for: </span>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{item.whenNotRecommended}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '40px 32px', textAlign: 'center' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Does your application fit within these constraints?</h3>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.42)', margin: '0 0 28px' }}>If so, you will enjoy the fastest, zero-config deployment experience available for AI agents and humans alike.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7c3aed', color: '#fff', fontWeight: 600, padding: '10px 22px', borderRadius: 6, textDecoration: 'none', fontSize: 14 }}>
            Deploy on FusionHost
          </Link>
          <Link href="/compare" style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
            See how we compare vs Vercel &amp; Railway →
          </Link>
        </div>
      </div>
    </div>
  );
}
