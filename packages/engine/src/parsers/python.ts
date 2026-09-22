import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RequiredEnvVar } from '@fusionhost/types';

export interface PythonParseResult {
  appName: string;
  version: string;
  framework: string;
  buildCommand?: string;
  startCommand: string;
  port: number;
  needsPostgres: boolean;
  requiredEnvVars: RequiredEnvVar[];
  citations: Record<string, string>;
}

export function isPythonProject(dirPath: string): boolean {
  return (
    fs.existsSync(path.join(dirPath, 'requirements.txt')) ||
    fs.existsSync(path.join(dirPath, 'pyproject.toml')) ||
    fs.existsSync(path.join(dirPath, 'Pipfile')) ||
    fs.existsSync(path.join(dirPath, 'setup.py')) ||
    fs.existsSync(path.join(dirPath, 'main.py')) ||
    fs.existsSync(path.join(dirPath, 'app.py'))
  );
}

export function parsePythonProject(dirPath: string): PythonParseResult {
  const appName = path.basename(dirPath) || 'python-app';
  const citations: Record<string, string> = {};

  let reqsText = '';
  if (fs.existsSync(path.join(dirPath, 'requirements.txt'))) {
    reqsText += fs.readFileSync(path.join(dirPath, 'requirements.txt'), 'utf8') + '\n';
    citations['manifest'] = 'requirements.txt';
  }
  if (fs.existsSync(path.join(dirPath, 'pyproject.toml'))) {
    reqsText += fs.readFileSync(path.join(dirPath, 'pyproject.toml'), 'utf8') + '\n';
    citations['manifest'] = citations['manifest'] ? `${citations['manifest']}, pyproject.toml` : 'pyproject.toml';
  }

  const reqsLower = reqsText.toLowerCase();

  // Version
  const version = '3.12';
  citations['version'] = 'default (Python 3.12)';

  let framework = 'Python (Generic)';
  let port = 8000;
  let startCommand = 'python main.py';

  if (reqsLower.includes('fastapi') || reqsLower.includes('uvicorn')) {
    framework = 'FastAPI';
    port = 8000;
    startCommand = 'uvicorn main:app --host 0.0.0.0 --port 8000';
    citations['framework'] = 'requirements.txt (fastapi)';
    citations['startCommand'] = 'inferred FastAPI entrypoint (uvicorn main:app)';
    citations['port'] = 'FastAPI convention (8000)';
  } else if (reqsLower.includes('flask')) {
    framework = 'Flask';
    port = 5000;
    startCommand = 'python app.py';
    citations['framework'] = 'requirements.txt (flask)';
    citations['startCommand'] = 'app.py (Flask runner)';
    citations['port'] = 'Flask convention (5000)';
  } else if (reqsLower.includes('django')) {
    framework = 'Django';
    port = 8000;
    startCommand = 'python manage.py runserver 0.0.0.0:8000';
    citations['framework'] = 'requirements.txt (django)';
    citations['startCommand'] = 'manage.py runserver';
    citations['port'] = 'Django convention (8000)';
  } else {
    if (fs.existsSync(path.join(dirPath, 'app.py'))) {
      startCommand = 'python app.py';
      citations['startCommand'] = 'app.py (auto-detected)';
    } else if (fs.existsSync(path.join(dirPath, 'main.py'))) {
      startCommand = 'python main.py';
      citations['startCommand'] = 'main.py (auto-detected)';
    }
  }

  // Postgres detection
  let needsPostgres = false;
  const postgresPackages = ['psycopg2', 'psycopg2-binary', 'psycopg', 'asyncpg', 'sqlalchemy', 'tortoise-orm', 'dj-database-url'];
  for (const p of postgresPackages) {
    if (reqsLower.includes(p)) {
      needsPostgres = true;
      citations['needsPostgres'] = `requirements/pyproject contains ${p}`;
      break;
    }
  }

  const requiredEnvVars: RequiredEnvVar[] = [];
  if (needsPostgres) {
    requiredEnvVars.push({
      name: 'DATABASE_URL',
      required: true,
      citedIn: citations['needsPostgres'] || 'PostgreSQL client detected',
      description: 'Automatically provisioned by FusionHost'
    });
  }

  return {
    appName,
    version,
    framework,
    startCommand,
    port,
    needsPostgres,
    requiredEnvVars,
    citations,
  };
}
