import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Hazard } from '@fusionhost/types';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '__pycache__',
  '.venv',
  'venv',
  '.gemini',
  '.turbo'
]);

const SCANNED_EXTENSIONS = new Set([
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.mjs',
  '.cjs',
  '.py',
  '.json',
  '.env.example'
]);

export function detectHazards(
  dirPath: string,
  suppliedEnvVars: Record<string, string> = {}
): Hazard[] {
  const hazards: Hazard[] = [];
  const foundEnvRefs = new Set<{ name: string; file: string; line: number }>();

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(dirPath, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();

        // Detect SQLite database file presence
        if (['.sqlite', '.sqlite3', '.db'].includes(ext)) {
          hazards.push({
            ruleId: 'ephemeral-disk-write',
            severity: 'warning',
            message: `SQLite database file detected (${relPath}). FusionHost container disk is ephemeral; changes will be lost on redeploy.`,
            fileCitation: relPath,
            suggestion: 'Use FusionHost auto-provisioned PostgreSQL or mount an S3-compatible bucket.'
          });
          continue;
        }

        if (!SCANNED_EXTENSIONS.has(ext)) continue;

        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          lines.forEach((line, idx) => {
            const lineNum = idx + 1;

            // 1. Ephemeral disk write detection
            if (
              line.includes('fs.writeFileSync') ||
              line.includes('fs.writeFile(') ||
              line.includes('fs.promises.writeFile') ||
              /open\s*\([^)]*['"][wWaA][+]?['"]\)/.test(line)
            ) {
              // Avoid duplicate flood
              if (!hazards.some(h => h.ruleId === 'ephemeral-disk-write' && h.fileCitation?.startsWith(relPath))) {
                hazards.push({
                  ruleId: 'ephemeral-disk-write',
                  severity: 'warning',
                  message: `Local filesystem write detected: ${line.trim().slice(0, 80)}. Changes to local disk are wiped on redeploy.`,
                  fileCitation: `${relPath}#L${lineNum}`,
                  suggestion: 'Store persistent user uploads in object storage or databases.'
                });
              }
            }

            // 2. Unsupported external service detection
            const unsupportedServices = [
              { pattern: /['"](?:redis|ioredis)['"]|import\s+redis/, service: 'Redis' },
              { pattern: /['"](?:mongodb|mongoose)['"]|import\s+pymongo/, service: 'MongoDB' },
              { pattern: /['"]amqplib['"]|import\s+pika|from\s+celery/, service: 'RabbitMQ / Celery' },
              { pattern: /['"]kafkajs['"]|import\s+kafka/, service: 'Kafka' },
            ];

            for (const item of unsupportedServices) {
              if (item.pattern.test(line)) {
                if (!hazards.some(h => h.ruleId === 'unsupported-service' && h.message.includes(item.service))) {
                  hazards.push({
                    ruleId: 'unsupported-service',
                    severity: 'info',
                    message: `${item.service} detected. FusionHost only auto-provisions PostgreSQL.`,
                    fileCitation: `${relPath}#L${lineNum}`,
                    suggestion: `Bring your own ${item.service} instance and provide the connection URL as an environment variable.`
                  });
                }
              }
            }

            // 3. Collect environment variable references
            const nodeEnvMatches = line.matchAll(/process\.env\.([A-Z0-9_]{3,})/g);
            for (const match of nodeEnvMatches) {
              const varName = match[1];
              if (!['NODE_ENV', 'PORT', 'PATH', 'DATABASE_URL'].includes(varName)) {
                foundEnvRefs.add({ name: varName, file: relPath, line: lineNum });
              }
            }

            const pyEnvMatches = line.matchAll(/os\.environ(?:\.get)?\(\s*['"]([A-Z0-9_]{3,})['"]/g);
            for (const match of pyEnvMatches) {
              const varName = match[1];
              if (!['PORT', 'PATH', 'DATABASE_URL'].includes(varName)) {
                foundEnvRefs.add({ name: varName, file: relPath, line: lineNum });
              }
            }
          });
        } catch {
          // ignore binary or unreadable file
        }
      }
    }
  }

  walk(dirPath);

  // Check missing environment variables
  const exampleEnvPath = path.join(dirPath, '.env.example');
  const exampleEnvVars = new Set<string>();
  if (fs.existsSync(exampleEnvPath)) {
    const exampleContent = fs.readFileSync(exampleEnvPath, 'utf8');
    exampleContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const key = trimmed.split('=')[0]?.trim();
        if (key) exampleEnvVars.add(key);
      }
    });
  }

  for (const envRef of foundEnvRefs) {
    if (!suppliedEnvVars[envRef.name] && !exampleEnvVars.has(envRef.name)) {
      hazards.push({
        ruleId: 'missing-env-var',
        severity: 'warning',
        message: `Environment variable "${envRef.name}" is referenced in code but missing from environment configuration.`,
        fileCitation: `${envRef.file}#L${envRef.line}`,
        suggestion: `Define ${envRef.name} in your secrets or .env.example file.`
      });
    }
  }

  return hazards;
}
