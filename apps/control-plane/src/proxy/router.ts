import * as http from 'node:http';
import { store } from '../store/memory.js';

export function handleProxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  targetAppName: string,
  strippedPath: string
): void {
  const norm = targetAppName.toLowerCase();
  let route = store.getRoute(norm);

  // Alias lookup: e.g. acme-saas <-> acme-saas-web
  if (!route) {
    if (norm === 'acme-saas') {
      route = store.getRoute('acme-saas-web');
    } else if (norm === 'acme-saas-web') {
      route = store.getRoute('acme-saas');
    } else if (norm.endsWith('-web')) {
      route = store.getRoute(norm.replace(/-web$/, ''));
    } else {
      route = store.getRoute(norm + '-web');
    }
  }

  if (!route) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FusionHost Ingress — App Not Found</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              background: #000;
              color: #fff;
              font-family: 'Inter', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 24px;
            }
            .card {
              background: #0d0d0d;
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 12px;
              max-width: 480px;
              width: 100%;
              padding: 36px;
              text-align: center;
              box-shadow: 0 32px 80px rgba(0,0,0,0.7);
            }
            .tag {
              font-size: 11px;
              font-family: 'JetBrains Mono', monospace;
              text-transform: uppercase;
              letter-spacing: 0.14em;
              color: #8b5cf6;
              margin-bottom: 12px;
              font-weight: 600;
            }
            h1 { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
            p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 24px; }
            a {
              display: inline-block;
              background: #7c3aed;
              color: #fff;
              font-size: 13px;
              font-weight: 600;
              padding: 10px 20px;
              border-radius: 6px;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="tag">FusionHost Ingress Router</div>
            <h1>Application Not Deployed</h1>
            <p>Application <strong>"${targetAppName}"</strong> is not currently running or registered in the ingress table.</p>
            <a href="http://localhost:3000/dashboard">Open Console Dashboard &rarr;</a>
          </div>
        </body>
      </html>
    `);
    return;
  }

  // Update last active for scale-to-zero tracking
  route.lastActiveAt = Date.now();

  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: route.targetPort,
    path: strippedPath || '/',
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-host': req.headers.host || '',
      'x-forwarded-for': req.socket.remoteAddress || '',
      'x-forwarded-proto': 'http',
      host: `127.0.0.1:${route.targetPort}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FusionHost — Bad Gateway</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              background: #000;
              color: #fff;
              font-family: 'Inter', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 24px;
            }
            .card {
              background: #0d0d0d;
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 12px;
              max-width: 480px;
              width: 100%;
              padding: 36px;
              text-align: center;
            }
            h2 { font-size: 22px; font-weight: 700; color: #f43f5e; margin-bottom: 12px; }
            p { font-size: 13.5px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 20px; }
            pre {
              background: #000;
              border: 1px solid rgba(255,255,255,0.08);
              padding: 12px;
              border-radius: 6px;
              font-size: 11.5px;
              font-family: 'JetBrains Mono', monospace;
              color: rgba(255,255,255,0.7);
              text-align: left;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>502 Bad Gateway</h2>
            <p>Could not connect to service container <strong>"${targetAppName}"</strong> on port ${route.targetPort}.</p>
            <pre>${err.message}</pre>
          </div>
        </body>
      </html>
    `);
  });

  req.pipe(proxyReq, { end: true });
}
