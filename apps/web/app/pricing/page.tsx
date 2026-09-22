import Link from 'next/link';
import { Check, HelpCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    tagline: 'For indie hackers, experiments, and testing coding agents.',
    price: '₹0',
    frequency: 'forever free',
    badge: 'Zero Risk',
    features: [
      { name: 'Unlimited static sites', highlight: true },
      { name: '2 live server applications' },
      { name: '10 successful deploys / month' },
      { name: 'Failed deploys cost ₹0 & never count against limits', highlight: true },
      { name: '1 auto-provisioned PostgreSQL database' },
      { name: '1 S3-compatible storage bucket' },
      { name: 'Subdomain routing (*.fusionhost.local)' },
      { name: 'Community support' },
    ],
    cta: 'Start Deploying Free',
    href: '/dashboard',
    popular: false,
  },
  {
    name: 'Pro',
    tagline: 'For growing side-projects, startups, and production tools.',
    price: '₹1,500',
    frequency: 'per month',
    badge: 'Most Popular',
    features: [
      { name: 'Unlimited static sites' },
      { name: '15 live server applications', highlight: true },
      { name: 'Unlimited successful deploys (Priority Queue)', highlight: true },
      { name: '5 custom domains with auto-renewing SSL' },
      { name: '3 auto-provisioned PostgreSQL databases' },
      { name: '3 S3-compatible storage buckets' },
      { name: 'Monthly AI Model Gateway credits included', highlight: true },
      { name: 'Priority email & ticket support' },
    ],
    cta: 'Upgrade to Pro',
    href: '/dashboard',
    popular: true,
  },
  {
    name: 'Enterprise',
    tagline: 'For organizations needing dedicated infra, SLAs, and invoicing.',
    price: 'Custom',
    frequency: 'annual agreement',
    badge: 'Dedicated',
    features: [
      { name: 'Unlimited applications & deploys' },
      { name: 'Dedicated single-tenant compute nodes' },
      { name: 'Invoiced billing & PO management' },
      { name: 'Custom data residency & SOC2 controls' },
      { name: 'Unlimited custom domains & databases' },
      { name: 'Unified AI Gateway with team wallet ceilings' },
      { name: '99.95% uptime SLA guarantee' },
      { name: 'Dedicated Slack channel & architect support' },
    ],
    cta: 'Contact Sales',
    href: 'mailto:sales@fusionhost.local',
    popular: false,
  },
];

const FAQS = [
  {
    q: 'Do failed deploys count against my monthly deploy limits?',
    a: 'No. Never. Failure is free on FusionHost. If a build fails or your application crashes on startup, it will never count against your deploy ceiling, nor will it cost anything.',
  },
  {
    q: 'What happens when an application is idle?',
    a: 'Applications scale-to-zero when there is no active traffic for 10 minutes. When a visitor (or agent) makes a new request, FusionHost wakes the container in ~1.8 seconds and forwards the buffered connection without dropping it.',
  },
  {
    q: 'How does the AI Model Gateway wallet work?',
    a: 'FusionHost provides a single unified API key that routes to OpenAI, Anthropic, and Google Gemini models. You fund a prepaid wallet; an app can never spend beyond the balance, guaranteeing a hard ceiling even if a key leaks.',
  },
  {
    q: 'Can I use a custom domain on the free tier?',
    a: 'No. As stated in our explicit platform constraints, custom domains are reserved for the Pro tier. Free tier apps receive a generated subdomain.',
  },
  {
    q: 'What if I need MongoDB or Redis?',
    a: 'FusionHost only provisions PostgreSQL automatically. If you require Redis, MongoDB, or MySQL, you can connect any third-party provider (e.g. Upstash, Mongo Atlas) and pass credentials via environment variables.',
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Simple, Honest Pricing
        </h1>
        <p className="text-base sm:text-lg text-slate-400 mt-4 leading-relaxed">
          Convert when you hit genuine physical ceilings — not arbitrary artificial paywalls.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 flex flex-col justify-between relative transition-all ${
              plan.popular
                ? 'bg-surface border-primary shadow-xl shadow-primary/10'
                : 'bg-surface/60 border-border/70 hover:border-slate-600'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-accent-cyan text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md">
                {plan.badge}
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                {!plan.popular && (
                  <span className="text-[10px] font-mono text-slate-400 border border-border px-2 py-0.5 rounded">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-6">{plan.tagline}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-xs text-slate-400">/{plan.frequency}</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs sm:text-sm">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        f.highlight ? 'text-primary' : 'text-emerald-400'
                      }`}
                    />
                    <span className={f.highlight ? 'text-white font-medium' : 'text-slate-300'}>
                      {f.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={plan.href}
              className={`w-full py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                plan.popular
                  ? 'bg-primary text-slate-950 hover:bg-primary-hover shadow-md'
                  : 'bg-surface-elevated text-slate-200 border border-border hover:bg-slate-700'
              }`}
            >
              {plan.cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Limits FAQ */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Frequently Asked Questions About Limits
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-surface border border-border/60 text-left"
            >
              <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
