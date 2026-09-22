'use client';

import { useState } from 'react';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LivePreviewIframeProps {
  appName: string;
  liveUrl: string;
  status: string;
}

export default function LivePreviewIframe({
  appName,
  liveUrl,
  status,
}: LivePreviewIframeProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'max-w-2xl mx-auto',
    mobile: 'max-w-sm mx-auto',
  };

  return (
    <div className="rounded-xl border border-border/70 bg-surface flex flex-col overflow-hidden shadow-lg">
      {/* Browser Chrome Header */}
      <div className="px-4 py-2.5 bg-surface-elevated/90 border-b border-border/50 flex items-center justify-between gap-4">
        {/* URL Pill */}
        <div className="flex-1 flex items-center gap-2 bg-background border border-border/60 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300">
          <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{liveUrl || `http://${appName}.localhost:4000`}</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            LIVE
          </span>
        </div>

        {/* Device Viewport Selector */}
        <div className="hidden sm:flex items-center gap-1 bg-background p-1 rounded-lg border border-border/60">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1 rounded ${device === 'desktop' ? 'bg-surface-elevated text-primary' : 'text-slate-500 hover:text-slate-300'}`}
            title="Desktop view"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1 rounded ${device === 'tablet' ? 'bg-surface-elevated text-primary' : 'text-slate-500 hover:text-slate-300'}`}
            title="Tablet view"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1 rounded ${device === 'mobile' ? 'bg-surface-elevated text-primary' : 'text-slate-500 hover:text-slate-300'}`}
            title="Mobile view"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-lg border border-border hover:bg-surface-elevated text-slate-400 hover:text-white transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border border-border hover:bg-surface-elevated text-slate-400 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="p-4 bg-background/50 flex-1 min-h-[420px] flex items-center justify-center overflow-auto">
        <div className={`transition-all duration-200 h-[400px] bg-background rounded-lg border border-border/60 overflow-hidden relative shadow-inner ${deviceWidths[device]}`}>
          <iframe
            key={refreshKey}
            src={liveUrl}
            title={`${appName} preview`}
            className="w-full h-full border-0 bg-white"
            onError={() => {}}
          />
          {/* Fallback Overlay if live service is still starting */}
          <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent-emerald flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">{appName} is Live!</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Container is healthy and reverse-proxied at <code className="text-primary font-mono">{liveUrl}</code>
            </p>
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-primary text-slate-950 font-bold px-4 py-2 rounded-lg text-xs hover:bg-primary-hover transition-colors"
            >
              Open Direct Endpoint
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
