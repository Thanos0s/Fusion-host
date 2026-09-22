'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Database,
  Terminal,
  Zap,
  RotateCcw,
  Clock,
  Check,
  AlertTriangle,
} from 'lucide-react';
import AppSpecSandbox from '@/components/AppSpecSandbox';

const phrases = ['agents=', 'data=', 'startups=', 'builders=', 'apps=', 'scale='];

export default function HomePage() {
  const [typedText, setTypedText] = useState('agents=');

  useEffect(() => {
    let pi = 0;
    let ci = 0;
    let del = false;
    let pause = false;
    let timer: NodeJS.Timeout;

    function tick() {
      if (pause) {
        timer = setTimeout(() => {
          pause = false;
          tick();
        }, 1400);
        return;
      }
      const cur = phrases[pi];
      if (!del) {
        ci++;
        setTypedText(cur.slice(0, ci));
        if (ci === cur.length) {
          pause = true;
          del = true;
        }
        timer = setTimeout(tick, del && !pause ? 55 : 85);
      } else {
        ci--;
        setTypedText(cur.slice(0, ci));
        if (ci === 0) {
          del = false;
          pi = (pi + 1) % phrases.length;
        }
        timer = setTimeout(tick, 48);
      }
    }

    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ background: '#000', color: '#fff', overflowX: 'hidden' }}>
      {/* HERO SECTION */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 'calc(100vh - 100px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 65% 55% at 72% 42%, rgba(109,40,217,0.28) 0%, rgba(76,29,149,0.12) 50%, transparent 82%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '60px 20px 48px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 64, alignItems: 'center' }}>
            {/* Left Column */}
            <div>
              <h1
                style={{
                  fontSize: 'clamp(46px, 5.5vw, 68px)',
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: '-0.025em',
                  color: '#fff',
                  margin: '0 0 24px',
                }}
              >
                Your fastest path to
                <br />
                production for
                <br />
                <span style={{ color: '#8b5cf6' }}>{typedText}</span>
                <span
                  style={{
                    display: 'inline-block',
                    width: 3,
                    height: '0.82em',
                    background: '#8b5cf6',
                    marginLeft: 3,
                    verticalAlign: 'middle',
                    animation: 'blink 1s step-end infinite',
                  }}
                />
              </h1>

              <p style={{ fontSize: 17, lineHeight: 1.68, color: 'rgba(255,255,255,0.5)', margin: '0 0 36px', maxWidth: 480 }}>
                Intuitive infrastructure to scale any app or agent from your first user to your billionth.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Link
                  href="/dashboard"
                  style={{
                    background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.52)',
                    color: '#fff',
                    padding: '11px 24px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.85)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.52)';
                  }}
                >
                  Start for free
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </Link>

                <Link
                  href="/pricing"
                  style={{
                    background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.17)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '11px 24px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.17)';
                  }}
                >
                  Talk to sales
                </Link>
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div style={{ position: 'relative' }}>
              {/* Git push floating card */}
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  top: -12,
                  zIndex: 20,
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(17,17,17,0.96)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 10,
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>$</span>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#fff', fontWeight: 600 }}>git push</span>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>origin main</span>
              </div>

              {/* Dashboard panel */}
              <div
                style={{
                  marginTop: 40,
                  marginLeft: 24,
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                }}
              >
                <div
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.28)',
                    }}
                  >
                    Production
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace' }}>live</span>
                  </div>
                </div>

                <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {/* app-backend 1 */}
                  <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>app-backend</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>Available</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>MEMORY</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <defs>
                            <linearGradient id="g1_react" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,15 C5,12 8,7 14,9 C20,11 22,5 28,4 C34,3 36,8 42,6 C48,4 52,9 60,7" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                          <path d="M0,15 C5,12 8,7 14,9 C20,11 22,5 28,4 C34,3 36,8 42,6 C48,4 52,9 60,7 L60,18 L0,18Z" fill="url(#g1_react)" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>INSTANCES</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>CPU</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <defs>
                            <linearGradient id="g2_react" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,13 C4,9 10,15 16,11 C22,7 24,4 30,6 C36,8 38,3 44,5 C50,7 55,11 60,9" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                          <path d="M0,13 C4,9 10,15 16,11 C22,7 24,4 30,6 C36,8 38,3 44,5 C50,7 55,11 60,9 L60,18 L0,18Z" fill="url(#g2_react)" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>REQUESTS</span>
                      </div>
                    </div>
                  </div>

                  {/* app-backend 2 */}
                  <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>app-backend</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>Available</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>MEMORY</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <path d="M0,11 C6,7 10,13 16,9 C22,5 26,11 32,7 C38,3 42,9 48,5 C52,3 56,7 60,5" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>INSTANCES</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>CPU</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <path d="M0,17 C5,15 8,9 14,11 C20,13 24,7 30,9 C36,11 40,5 46,7 C52,9 56,13 60,11" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>REQS</span>
                      </div>
                    </div>
                  </div>

                  {/* app-database */}
                  <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>app-database</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>Available</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>MEMORY</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <path d="M0,9 C8,5 12,13 18,7 C24,1 28,9 34,5 C40,1 44,7 50,3 C54,1 57,5 60,3" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>STORAGE</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>CPU</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <path d="M0,15 C5,11 10,17 16,13 C22,9 26,5 32,7 C38,9 42,3 48,5 C54,7 57,11 60,9" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>CONNECTIONS</span>
                      </div>
                    </div>
                  </div>

                  {/* app-frontend */}
                  <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>app-frontend</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>Available</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>MEMORY</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <path d="M0,17 C4,13 8,9 14,11 C20,13 24,7 30,5 C36,3 40,9 46,7 C52,5 56,9 60,7" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>BANDWIDTH</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>CPU</span>
                        <svg viewBox="0 0 60 18" style={{ width: '100%', display: 'block', marginTop: 2 }} height="16">
                          <path d="M0,13 C6,9 10,15 16,11 C22,7 26,13 32,9 C38,5 42,11 48,7 C54,3 57,7 60,5" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                        </svg>
                        <span style={{ fontSize: 7.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>REQUESTS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED STRIP */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '18px 0' }}>
        <p style={{ textAlign: 'center', fontSize: 10.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
          Trusted by over 7 million builders
        </p>
      </div>

      {/* APP SPEC SANDBOX SECTION */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, color: '#8b5cf6', margin: '0 0 12px' }}>Interactive Demo</p>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Deterministic In-Memory Analysis</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', marginTop: 8 }}>Test how the engine inspects code and synthesizes containers without committing a Dockerfile.</p>
        </div>
        <AppSpecSandbox />
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '96px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, color: '#8b5cf6', margin: '0 0 12px' }}>Platform</p>
            <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Everything you need to ship</h2>
            <p style={{ fontSize: 16, marginTop: 12, color: 'rgba(255,255,255,0.42)', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              From first commit to billionth request &mdash; no ops team required.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Bento Card 1 */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 28, gridColumn: 'span 2' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(124,58,237,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Zap style={{ width: 18, height: 18, color: '#8b5cf6' }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px' }}>Zero-config container synthesis</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.42)', margin: '0 0 20px', maxWidth: 520 }}>
                No Dockerfile. No CI YAML. FusionHost reads your package.json or requirements.txt, synthesizes an optimized multi-stage container in memory, and keeps every layer cached without committing a single config file.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>$ </span>
                <span style={{ color: '#8b5cf6' }}>git push</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}> origin main</span>
                <br />
                <span style={{ color: '#22c55e' }}>&#10003; Container built in 14.2s &middot; 0 config files committed</span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(96,165,250,0.11)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Database style={{ width: 18, height: 18, color: '#60a5fa' }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px' }}>Auto-provisioned PostgreSQL</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.42)', margin: '0 0 16px' }}>
                Import pg, Prisma, or asyncpg and a dedicated database is created and injected automatically.
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#60a5fa', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 6, padding: '8px 12px' }}>
                DATABASE_URL=postgres://auto...
              </div>
            </div>

            {/* Bento Card 3 */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(124,58,237,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <RotateCcw style={{ width: 18, height: 18, color: '#8b5cf6' }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px' }}>Instant rollback &lt; 4s</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.42)', margin: 0 }}>
                Every release image is preserved. Revert to any past build with a single click or MCP tool call.
              </p>
            </div>

            {/* Bento Card 4 */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,0.11)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Clock style={{ width: 18, height: 18, color: '#22c55e' }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px' }}>Scale-to-zero, 1.8s wake</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.42)', margin: 0 }}>
                Idle apps sleep and cost nothing. The reverse proxy wakes them on first request without dropped connections.
              </p>
            </div>

            {/* Bento Card 5 */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(251,191,36,0.11)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Terminal style={{ width: 18, height: 18, color: '#fbbf24' }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px' }}>Native MCP server</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.42)', margin: 0 }}>
                Agents deploy, inspect, and self-heal without human relay. One <code style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>npx @fusionhost/mcp</code> command.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RADICAL TRANSPARENCY / LIMITATIONS BANNER */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(251,191,36,0.25)',
              background: 'rgba(251,191,36,0.04)',
              padding: '28px 36px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
            }}
          >
            <div style={{ maxWidth: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                <AlertTriangle style={{ width: 14, height: 14 }} />
                Product Principle: Radical Transparency
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>Say what&apos;s out of scope, loudly.</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                We publish our constraints right on the front door: single-instance per app, PostgreSQL only, and ephemeral filesystem. We don&apos;t want you discovering our architectural edges in production.
              </p>
            </div>
            <Link
              href="/limitations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(251,191,36,0.1)',
                color: '#fbbf24',
                border: '1px solid rgba(251,191,36,0.35)',
                padding: '9px 18px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Read Explicit Constraints
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '96px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 16px' }}>Ready to ship with zero config?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', margin: '0 0 32px' }}>
            Join developers and coding agents building on FusionHost. Deploys take seconds, and failed builds never cost a rupee.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link
              href="/dashboard"
              style={{
                background: '#fff',
                color: '#000',
                padding: '11px 26px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Open Management Console
              <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
            <Link
              href="/pricing"
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.2)',
                padding: '11px 26px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
