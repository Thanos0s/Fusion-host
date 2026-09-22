import Link from 'next/link';

const COMPETITORS = [
  {
    name: 'Vercel',
    dateUpdated: 'September 2026',
    tagline: 'Best for Next.js frontend teams needing global edge CDN and per-branch preview URLs.',
    fusionhostAdvantage: 'Agent-native MCP entrypoint; auto-provisions full PostgreSQL; no serverless timeout cliffs for background tasks.',
    whenCompetitorBetter: 'Choose Vercel if you need instant global edge network caching for static assets, preview comments on PRs, or advanced ISR/Next.js edge middleware.',
  },
  {
    name: 'Railway',
    dateUpdated: 'September 2026',
    tagline: 'Versatile PaaS with canvas template orchestration and broad database support.',
    fusionhostAdvantage: 'Single-instruction agent deployment; deterministic manifest citations; no canvas clicking required.',
    whenCompetitorBetter: 'Choose Railway if you need horizontal multi-container autoscaling, managed Redis/MySQL/MongoDB out of the box, or visual canvas topology editing.',
  },
  {
    name: 'Render',
    dateUpdated: 'September 2026',
    tagline: 'Traditional cloud replacement with managed services and background workers.',
    fusionhostAdvantage: 'Instant AI agent feedback loop; faster cold starts; zero YAML committed to your repository.',
    whenCompetitorBetter: 'Choose Render if you need persistent SSD disk mounts, dedicated background worker processes (Celery/Sidekiq), or private networks between services.',
  },
  {
    name: 'Heroku',
    dateUpdated: 'September 2026',
    tagline: 'The pioneer of git-push PaaS with a mature dyno and add-on ecosystem.',
    fusionhostAdvantage: 'Built agent-first for the 2026 AI era; generous free tier with scale-to-zero; modern buildpack engine.',
    whenCompetitorBetter: 'Choose Heroku if your enterprise relies on established add-on marketplace partners or legacy Ruby/Java enterprise buildpacks.',
  },
  {
    name: 'Cloudflare Pages / Workers',
    dateUpdated: 'September 2026',
    tagline: 'Hyper-distributed serverless V8 isolates with 0ms cold starts.',
    fusionhostAdvantage: 'Runs real standard Node.js & Python runtime containers without non-standard edge runtime workarounds.',
    whenCompetitorBetter: 'Choose Cloudflare if your app can run inside standard V8 isolates, needs global ultra-low latency, and uses D1/KV storage.',
  },
];

const Yes = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="#22c55e">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
const No = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="#f43f5e">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default function ComparePage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, color: '#8b5cf6', margin: '0 0 12px' }}>Comparisons</p>
        <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 16px', color: '#fff' }}>Radically Honest Comparisons</h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', margin: '0 auto', maxWidth: 620, lineHeight: 1.65 }}>
          FusionHost is not trying to be everything to everyone. Here is an honest, dated breakdown — including when competitors are genuinely the better choice.
        </p>
      </div>

      {/* Comparison cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 56 }}>
        {COMPETITORS.map(comp => (
          <div key={comp.name} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>FusionHost vs {comp.name}</h3>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{comp.tagline}</p>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', background: '#000', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Updated: {comp.dateUpdated}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '16px 20px' }}>
                <h4 style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b5cf6', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Why FusionHost is Built Different
                </h4>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.65 }}>{comp.fusionhostAdvantage}</p>
              </div>
              <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '16px 20px' }}>
                <h4 style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  When {comp.name} is the Better Choice
                </h4>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.65 }}>{comp.whenCompetitorBetter}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Matrix table */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 32px' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', color: '#fff' }}>At a Glance Feature Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ paddingBottom: 12, paddingRight: 16, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Feature</th>
                <th style={{ paddingBottom: 12, paddingLeft: 16, paddingRight: 16, color: '#8b5cf6', fontWeight: 700 }}>FusionHost</th>
                <th style={{ paddingBottom: 12, paddingLeft: 16, paddingRight: 16, color: 'rgba(255,255,255,0.4)' }}>Vercel</th>
                <th style={{ paddingBottom: 12, paddingLeft: 16, paddingRight: 16, color: 'rgba(255,255,255,0.4)' }}>Railway</th>
                <th style={{ paddingBottom: 12, paddingLeft: 16, color: 'rgba(255,255,255,0.4)' }}>Render</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Agent-First MCP Protocol', 'Native Stdio & agent.md', false, false, false],
                ['Deterministic Citations', 'File-cited App Spec', false, false, false],
                ['Auto-Provision PostgreSQL', 'Automatic on client import', false, true, true],
                ['Failed Deploys Cost', 'Always ₹0 (Free)', false, false, false],
                ['Published Limitations Page', 'Yes (/limitations)', false, false, false],
              ].map(([feature, fh, v, r, rn], i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '13px 16px 13px 0', color: '#fff', fontWeight: 500 }}>{feature as string}</td>
                  <td style={{ padding: '13px 16px', color: '#22c55e', fontWeight: 700, fontSize: 12.5 }}>{fh as string}</td>
                  <td style={{ padding: '13px 16px' }}>{v ? <Yes /> : <No />}</td>
                  <td style={{ padding: '13px 16px' }}>{r ? <Yes /> : <No />}</td>
                  <td style={{ padding: '13px 16px' }}>{rn ? <Yes /> : <No />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
