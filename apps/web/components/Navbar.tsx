'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Announcement bar */}
      <div style={{ background: 'linear-gradient(90deg,#3b1d8a 0%,#4c1d95 40%,#5b21b6 70%,#3b1d8a 100%)', padding: '8px 16px', textAlign: 'center', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
        Deploying your first agent app? Get up to &#8377;10,000 in launch credits.&nbsp;
        <Link href="/pricing" style={{ textDecoration: 'underline', textUnderlineOffset: 2, fontWeight: 600, color: 'inherit' }}>Apply now</Link>
      </div>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#000', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.09 12.11A1 1 0 005 13.8H11V22l8.91-10.11A1 1 0 0019 10.2H13V2Z"/></svg>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#fff', letterSpacing: '-0.01em' }}>FusionHost</span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13.5, fontWeight: 500 }} className="hidden md:flex">
              {[['/', 'Product'], ['/docs', 'Developers'], ['/compare', 'Resources'], ['/pricing', 'Pricing'], ['/limitations', 'Company']].map(([href, label]) => (
                <Link key={href} href={href} style={{ color: isActive(href) && href !== '/' ? '#fff' : 'rgba(255,255,255,0.52)', textDecoration: 'none' }}>{label}</Link>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/compare" className="hidden md:block" style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.52)', fontWeight: 500, textDecoration: 'none' }}>Migrate to FusionHost</Link>
            <Link href="/dashboard" style={{ background: '#fff', color: '#000', fontSize: 13.5, fontWeight: 600, padding: '6px 16px', borderRadius: 5, textDecoration: 'none' }}>Dashboard</Link>
          </div>
        </div>
      </header>
    </>
  );
}
