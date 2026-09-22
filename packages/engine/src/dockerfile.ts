import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AppSpec } from '@fusionhost/types';

export interface DockerfileResult {
  hasExistingDockerfile: boolean;
  dockerfileContent: string;
}

export function generateDockerfile(dirPath: string, spec: Partial<AppSpec>): DockerfileResult {
  const customDockerfilePath = path.join(dirPath, 'Dockerfile');
  if (fs.existsSync(customDockerfilePath)) {
    return {
      hasExistingDockerfile: true,
      dockerfileContent: fs.readFileSync(customDockerfilePath, 'utf8')
    };
  }

  const runtime = spec.runtime || 'node';
  const port = spec.port || 3000;
  const startCommand = spec.startCommand || (runtime === 'python' ? 'python main.py' : 'npm start');
  const buildCommand = spec.buildCommand;

  let content = '';

  if (runtime === 'node') {
    const cmdTokens = startCommand.split(' ').filter(Boolean);
    content = `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .
${buildCommand ? `RUN ${buildCommand}` : ''}

EXPOSE ${port}
USER node
CMD [${cmdTokens.map(t => `"${t}"`).join(', ')}]
`;
  } else if (runtime === 'python') {
    const cmdTokens = startCommand.split(' ').filter(Boolean);
    content = `# Synthesized by FusionHost (Deterministic Zero-Config Container)
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PORT=${port}

COPY requirements.txt* pyproject.toml* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

COPY . .

EXPOSE ${port}
CMD [${cmdTokens.map(t => `"${t}"`).join(', ')}]
`;
  } else {
    // Static fallback
    content = `# Synthesized by FusionHost (Static Site)
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
  }

  return {
    hasExistingDockerfile: false,
    dockerfileContent: content
  };
}
