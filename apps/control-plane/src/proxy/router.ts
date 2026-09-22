import * as http from 'node:http';
import { store } from '../store/memory.js';

export function handleProxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  targetAppName: string,
  strippedPath: string
): void {
  const route = store.getRoute(targetAppName);

  if (!route) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>FusionHost — App Not Found</title></head>
        <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center;">
          <h1 style="color: #38bdf8;">FusionHost Proxy</h1>
          <p>Application <strong>"${targetAppName}"</strong> is not currently running or deployed.</p>
          <a href="http://localhost:3000/dashboard" style="color: #4ade80;">Go to Dashboard</a>
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
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>FusionHost — Bad Gateway</title></head>
        <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center;">
          <h2 style="color: #f87171;">502 Bad Gateway</h2>
          <p>Could not connect to application container for <strong>"${targetAppName}"</strong> on port ${route.targetPort}.</p>
          <pre style="background: #1e293b; padding: 12px; border-radius: 6px; display: inline-block;">${err.message}</pre>
        </body>
      </html>
    `);
  });

  req.pipe(proxyReq, { end: true });
}
