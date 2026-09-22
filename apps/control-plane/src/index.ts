import { createServer } from './server.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const { httpServer } = createServer();

httpServer.listen(PORT, () => {
  console.log(`[FusionHost Control Plane] Running on http://localhost:${PORT}`);
  console.log(`[FusionHost Ingress Proxy] Ready for *.localhost:${PORT} and /live/<app>`);
});
