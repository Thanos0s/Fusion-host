import { NextResponse } from 'next/server';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function GET() {
  try {
    // Look for agent.md at monorepo root or local directory
    const candidates = [
      path.resolve(process.cwd(), '../../agent.md'),
      path.resolve(process.cwd(), 'agent.md'),
      path.resolve(process.cwd(), '../agent.md'),
    ];

    let content = '';
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        content = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    if (!content) {
      content = `# FusionHost Agent Guide\n"Tell your agent once, ship your app"\nConnect via MCP to deploy apps with zero config.`;
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
