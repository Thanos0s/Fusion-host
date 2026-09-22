import Link from 'next/link';
import { Layers, ShieldCheck, Github, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/50 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-white">FusionHost</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-4 leading-relaxed">
              "Tell your agent once, ship your app." Zero Dockerfile, zero CI/CD YAML, zero cloud consoles. Built agent-first, human-complete.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Platform Services Operational
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/#sandbox" className="hover:text-white transition-colors">App Spec Sandbox</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Console Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Limits</Link></li>
              <li><Link href="/limitations" className="hover:text-white transition-colors">Explicit Constraints</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-sm mb-3">Agents & Docs</h4>
            <ul className="space-y-2">
              <li><Link href="/docs" className="hover:text-white transition-colors">MCP Quickstart</Link></li>
              <li><Link href="/api/agent-md" target="_blank" className="hover:text-white transition-colors">agent.md Reference</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Competitor Comparison</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-sm mb-3">Guarantees</h4>
            <ul className="space-y-2">
              <li className="text-slate-500">Deterministic Analysis</li>
              <li className="text-slate-500">Scale-to-Zero Compute</li>
              <li className="text-slate-500">Auto PostgreSQL</li>
              <li className="text-slate-500">Failed Deploys Are Free</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            &copy; 2026 FusionHost. Built for autonomous AI coding agents and human builders.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Privacy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
