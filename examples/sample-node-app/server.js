const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', app: 'acme-saas-web', timestamp: new Date().toISOString() }));
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>acme-saas-web — Deployed on FusionHost</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #ffffff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      background: #0d0d0d;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      max-width: 580px;
      width: 100%;
      padding: 36px;
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.8);
      text-align: center;
    }
    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.25);
      padding: 4px 10px;
      border-radius: 99px;
      margin-bottom: 20px;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      display: inline-block;
      box-shadow: 0 0 10px #22c55e;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
    }
    p.lead {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 28px;
      text-align: left;
    }
    .metric {
      background: #000;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 12px 14px;
    }
    .metric-label {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(255, 255, 255, 0.35);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .metric-val {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      margin-top: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #7c3aed;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.7);
      margin-left: 10px;
    }
    .btn-secondary:hover { color: #fff; border-color: rgba(255, 255, 255, 0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge-live">
      <span class="dot"></span>
      Live Service &middot; Healthy
    </div>
    <h1>Shipped with FusionHost!</h1>
    <p class="lead">
      Zero Dockerfile &middot; Zero CI/CD YAML &middot; Zero Cloud Console clicks.
      <br>Your service was synthesized, provisioned, and routed automatically.
    </p>

    <div class="grid">
      <div class="metric">
        <div class="metric-label">App Identifier</div>
        <div class="metric-val" style="color: #8b5cf6;">acme-saas-web</div>
      </div>
      <div class="metric">
        <div class="metric-label">Target Port</div>
        <div class="metric-val">:${PORT}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Database</div>
        <div class="metric-val" style="color: #22c55e;">
          ${process.env.DATABASE_URL ? 'PostgreSQL (Active)' : 'PostgreSQL (Auto-Bound)'}
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">Runtime Engine</div>
        <div class="metric-val">Node.js LTS (v22)</div>
      </div>
    </div>

    <div>
      <a href="http://localhost:3000/dashboard" class="btn">
        Open Console Dashboard &rarr;
      </a>
      <a href="http://localhost:3000/docs" class="btn btn-secondary">
        View Docs
      </a>
    </div>
  </div>
</body>
</html>`);
});

server.listen(PORT, () => {
  console.log(`[Sample Node App] Listening on port ${PORT}`);
});
