#!/usr/bin/env node
import { spawn } from 'node:child_process';
import * as path from 'node:path';

console.log('\x1b[35m%s\x1b[0m', '⚡ Starting FusionHost Platform...');
console.log('\x1b[90m%s\x1b[0m', '• Control Plane: http://localhost:4000');
console.log('\x1b[90m%s\x1b[0m', '• Web Dashboard: http://localhost:3000/dashboard\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Start Control Plane
const cpProcess = spawn(npmCmd, ['--workspace=@fusionhost/control-plane', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

// 2. Start Web Front-end
const webProcess = spawn(npmCmd, ['--workspace=@fusionhost/web', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down FusionHost services...');
  try { cpProcess.kill('SIGTERM'); } catch {}
  try { webProcess.kill('SIGTERM'); } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
