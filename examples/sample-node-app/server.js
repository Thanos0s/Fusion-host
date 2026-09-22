const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>FusionHost — Sample App</title></head>
      <body style="font-family: sans-serif; background: #090d16; color: #f8fafc; padding: 40px; text-align: center;">
        <h1 style="color: #38bdf8;">Shipped with FusionHost!</h1>
        <p>Zero Dockerfile, zero CI/CD YAML, zero cloud console clicks.</p>
        <p style="color: #4ade80;">DATABASE_URL: ${process.env.DATABASE_URL ? 'Connected (Auto-provisioned)' : 'Not set'}</p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`[Sample Node App] Listening on port ${PORT}`);
});
