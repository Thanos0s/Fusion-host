import Link from 'next/link';

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
  { q: 'Do failed deploys count against my monthly deploy limits?', a: 'No. Never. Failure is free on FusionHost. If a build fails or your application crashes on startup, it will never count against your deploy ceiling, nor will it cost anything.' },
  { q: 'What happens when an application is idle?', a: 'Applications scale-to-zero when there is no active traffic for 10 minutes. When a visitor (or agent) makes a new request, FusionHost wakes the container in ~1.8 seconds and forwards the buffered connection without dropping it.' },
  { q: 'How does the AI Model Gateway wallet work?', a: 'FusionHost provides a single unified API key that routes to OpenAI, Anthropic, and Google Gemini models. You fund a prepaid wallet; an app can never spend beyond the balance, guaranteeing a hard ceiling even if a key leaks.' },
  { q: 'Can I use a custom domain on the free tier?', a: 'No. As stated in our explicit platform constraints, custom domains are reserved for the Pro tier. Free tier apps receive a generated subdomain.' },
  { q: 'What if I need MongoDB or Redis?', a: 'FusionHost only provisions PostgreSQL automatically. If you require Redis, MongoDB, or MySQL, you can connect any third-party provider (e.g. Upstash, Mongo Atlas) and pass credentials via environment variables.' },
];

const CheckIcon = ({ highlight }: { highlight?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill={highlight ? '#8b5cf6' : '#22c55e'} style={{ flexShrink: 0, marginTop: 2 }}>
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export default function PricingPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, color: '#8b5cf6', margin: '0 0 12px' }}>Pricing</p>
        <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 16px', color: '#fff' }}>Simple, Honest Pricing</h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', margin: '0 auto', maxWidth: 520, lineHeight: 1.65 }}>
          Convert when you hit genuine physical ceilings — not arbitrary artificial paywalls.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 80 }}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            style={{
              background: plan.popular ? '#0e0a1a' : '#0d0d0d',
              border: `1px solid ${plan.popular ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', borderRadius: 99, padding: '3px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', color: '#fff' }}>
                Most popular
              </div>
            )}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#fff' }}>{plan.name}</h3>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', margin: '0 0 20px', lineHeight: 1.55 }}>{plan.tagline}</p>
              <div style={{ fontSize: 40, fontWeight: 700, margin: '0 0 24px', color: '#fff' }}>
                {plan.price}{' '}
                <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.32)' }}>/ {plan.frequency}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: f.highlight ? '#fff' : 'rgba(255,255,255,0.52)', fontWeight: f.highlight ? 500 : 400 }}>
                    <CheckIcon highlight={f.highlight} />
                    {f.name}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={plan.href}
              style={{
                display: 'block', textAlign: 'center', padding: '10px 16px', borderRadius: 6,
                background: plan.popular ? '#7c3aed' : 'transparent',
                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.14)',
                fontSize: 13.5, fontWeight: 600, color: '#fff', textDecoration: 'none',
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', margin: '0 0 32px', color: '#fff' }}>
          Frequently Asked Questions About Limits
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '20px 24px' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                <svg width="16" height="16" fill="none" stroke="#8b5cf6" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {faq.q}
              </h4>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.7, paddingLeft: 24 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
