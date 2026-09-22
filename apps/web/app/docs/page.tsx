import Link from 'next/link';

export default function DocsPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 20px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(139,92,246,0.35)', background: 'rgba(124,58,237,0.1)', fontSize: 12, fontWeight: 600, color: '#8b5cf6', marginBottom: 16 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          Documentation &amp; Agent Protocol
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 12px', color: '#fff' }}>FusionHost Documentation</h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.65 }}>
          Learn how to deploy your apps with a single instruction or connect your coding agent autonomously.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Section 1 */}
        <section style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontWeight: 700, fontSize: 14 }}>1</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>Connecting Your AI Coding Agent</h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, margin: '0 0 16px' }}>
            FusionHost provides an official Model Context Protocol (MCP) server. Configure it in Claude Code, Cursor, or Windsurf:
          </p>
          <div style={{ background: '#000', borderRadius: 8, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', display: 'block', marginBottom: 10, letterSpacing: '0.1em' }}>
              ~/.cursor/mcp.json or claude_desktop_config.json
            </span>
            <pre style={{ margin: 0, fontSize: 12.5, fontFamily: 'monospace', color: '#8b5cf6', lineHeight: 1.8 }}>{`{
  "mcpServers": {
    "fusionhost": {
      "command": "node",
      "args": ["path-to/packages/mcp/dist/bin/fusionhost-mcp.js"]
    }
  }
}`}</pre>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>Machine-readable instruction file for agents:</span>
            <Link href="/api/agent-md" target="_blank" style={{ color: '#8b5cf6', fontFamily: 'monospace', textDecoration: 'none', fontWeight: 600 }}>/api/agent-md →</Link>
          </div>
        </section>

        {/* Section 2 */}
        <section style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontWeight: 700, fontSize: 14 }}>2</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>Zero-Config Container Engine</h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, margin: '0 0 16px' }}>
            You don&apos;t need to write or maintain a Dockerfile. When you trigger a deploy, the FusionHost engine:
          </p>
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
            <li>Detects your language: Node.js (package.json) or Python (requirements.txt / pyproject.toml).</li>
            <li>Infers start commands (e.g. <code style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: 3 }}>next start</code>, <code style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: 3 }}>npm start</code>, <code style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: 3 }}>uvicorn main:app</code>).</li>
            <li>Synthesizes an in-memory multi-stage container build targeting slim, non-root runner images.</li>
            <li>Respects existing Dockerfiles if already present in the root of your repository.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: 14 }}>3</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>Automatic PostgreSQL Provisioning</h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, margin: '0 0 16px' }}>
            If your application imports{' '}
            {['pg', '@prisma/client', 'drizzle-orm', 'psycopg2', 'asyncpg'].map((pkg, i, a) => (
              <span key={pkg}><code style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '1px 6px', borderRadius: 3 }}>{pkg}</code>{i < a.length - 1 ? ', ' : ''}</span>
            ))}, FusionHost will:
          </p>
          <div style={{ background: '#000', borderRadius: 8, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'monospace', fontSize: 13, lineHeight: 2 }}>
            <p style={{ color: '#22c55e', margin: 0 }}>&gt; 1. Auto-spin containerized PostgreSQL on fusionhost-net</p>
            <p style={{ color: '#22c55e', margin: 0 }}>&gt; 2. Execute CREATE DATABASE &quot;fusionhost_&lt;app&gt;&quot;</p>
            <p style={{ color: '#22c55e', margin: 0 }}>&gt; 3. Auto-inject DATABASE_URL into application runtime environment</p>
          </div>
        </section>

        {/* Section 4 */}
        <section style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontWeight: 700, fontSize: 14 }}>4</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>Scale-to-Zero &amp; Instant Rollback</h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, margin: '0 0 12px' }}>
            Apps sleep when idle for 10 minutes, consuming zero compute. On the next HTTP visit, the ingress proxy holds the socket connection, wakes the container in ~1.8 seconds, and forwards the buffered request.
          </p>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, margin: 0 }}>
            Every successful release image is tagged and preserved locally. If a new deployment breaks your application, click <strong style={{ color: '#fff' }}>&quot;Rollback&quot;</strong> in the dashboard or have your agent call <code style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: 3 }}>rollback_app</code> to revert immediately.
          </p>
        </section>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 56, background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '40px 32px', textAlign: 'center' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Ready to test FusionHost?</h3>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.42)', margin: '0 0 24px' }}>Explore the web dashboard or upload a local directory directly.</p>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7c3aed', color: '#fff', fontWeight: 600, padding: '10px 22px', borderRadius: 6, textDecoration: 'none', fontSize: 14 }}>
          Open Console Dashboard
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
