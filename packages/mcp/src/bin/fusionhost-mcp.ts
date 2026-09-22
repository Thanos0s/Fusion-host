#!/usr/bin/env node
import { runStdioServer } from '../server.js';

runStdioServer().catch((error) => {
  process.stderr.write(`FusionHost MCP server encountered fatal error: ${error.message}\n`);
  process.exit(1);
});
