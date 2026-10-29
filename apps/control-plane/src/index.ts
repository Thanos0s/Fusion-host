import { createServer } from './server.js';
import { bootstrapDemoApps } from './bootstrap.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const { httpServer } = createServer();

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`[FusionHost Control Plane] Running on http://localhost:${PORT}`);
  console.log(`[FusionHost Ingress Proxy] Ready for *.localhost:${PORT} and /live/<app>`);
  await bootstrapDemoApps();
});
