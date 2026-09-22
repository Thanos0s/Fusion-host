'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, ShieldAlert, Cpu, Layers, ExternalLink, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-emerald flex items-center justify-center text-slate-950 font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-primary transition-colors">
                FusionHost
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-surface-elevated text-accent-cyan border border-accent-cyan/30">
                Agent-PaaS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
            <Link
              href="/#sandbox"
              className="hover:text-white transition-colors"
            >
              Sandbox
            </Link>
            <Link
              href="/limitations"
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                pathname === '/limitations' ? 'text-accent-cyan font-semibold' : ''
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Limitations
            </Link>
            <Link
              href="/pricing"
              className={`hover:text-white transition-colors ${
                pathname === '/pricing' ? 'text-accent-cyan font-semibold' : ''
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/compare"
              className={`hover:text-white transition-colors ${
                pathname === '/compare' ? 'text-accent-cyan font-semibold' : ''
              }`}
            >
              Compare
            </Link>
            <Link
              href="/docs"
              className={`hover:text-white transition-colors ${
                pathname === '/docs' ? 'text-accent-cyan font-semibold' : ''
              }`}
            >
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/api/agent-md"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-700/60 bg-surface px-2.5 py-1.5 rounded-md transition-colors"
            title="Machine-readable instructions for AI agents"
          >
            <Terminal className="w-3 h-3 text-emerald-400" />
            agent.md
            <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent-cyan hover:from-primary-hover hover:to-accent-cyan text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-primary/20 transition-all"
          >
            Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
