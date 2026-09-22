import Link from 'next/link';

const cols = [
  { title: 'Product', links: [{ href: '/dashboard', label: 'Dashboard' }, { href: '/pricing', label: 'Pricing' }, { href: '/docs', label: 'Docs' }, { href: '/', label: 'Features' }] },
  { title: 'Developers', links: [{ href: '/docs', label: 'MCP Server' }, { href: '/api/agent-md', label: 'API Reference' }, { href: '/docs', label: 'CLI' }, { href: '/', label: 'Status' }] },
  { title: 'Resources', links: [{ href: '/compare', label: 'Comparisons' }, { href: '/limitations', label: 'Limitations' }, { href: '/', label: 'Blog' }, { href: '/', label: 'Changelog' }] },
  { title: 'Company', links: [{ href: '/', label: 'About' }, { href: '/', label: 'Careers' }, { href: '/', label: 'Privacy' }, { href: '/', label: 'Terms' }] },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 32, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.09 12.11A1 1 0 005 13.8H11V22l8.91-10.11A1 1 0 0019 10.2H13V2Z"/></svg>
              <span style={{ fontWeight: 600, fontSize: 14 }}>FusionHost</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.32)', lineHeight: 1.65, margin: 0 }}>The fastest path to production for AI agents and modern developers.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              <span style={{ fontSize: 11, color: '#22c55e', fontFamily: 'monospace' }}>All systems operational</span>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', margin: '0 0 12px' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(l => <li key={l.label}><Link href={l.href} style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.42)', textDecoration: 'none' }}>{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>&copy; 2025 FusionHost, Inc. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>Built for the AI coding agent era.</p>
        </div>
      </div>
    </footer>
  );
}
