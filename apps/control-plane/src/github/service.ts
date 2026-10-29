import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { GitHubUser, GitHubRepo, GitHubImportResult } from '@fusionhost/types';
import { analyzeProject } from '@fusionhost/engine';

export class GitHubService {
  private token: string | null = null;
  private user: GitHubUser | null = null;
  private mockRepos?: GitHubRepo[];
  private mockBranches?: Record<string, string[]>;

  /**
   * Set mock user for testing without live GitHub API
   */
  setMockUser(user: GitHubUser, token: string = 'mock-token'): void {
    this.user = user;
    this.token = token;
  }

  /**
   * Set mock repositories for testing
   */
  setMockRepos(repos: GitHubRepo[]): void {
    this.mockRepos = repos;
  }

  /**
   * Set mock branches for testing
   */
  setMockBranches(branchesMap: Record<string, string[]>): void {
    this.mockBranches = branchesMap;
  }

  /**
   * Authenticate with GitHub using Personal Access Token
   */
  async connect(token: string): Promise<GitHubUser> {
    if (!token || !token.trim()) {
      throw new Error('GitHub personal access token is required');
    }
    const cleanToken = token.trim();

    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'User-Agent': 'FusionHost-Control-Plane',
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`GitHub authentication failed (${res.status}): ${errorText}`);
    }

    const data: any = await res.json();
    const user: GitHubUser = {
      login: data.login,
      name: data.name || undefined,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
      publicRepos: data.public_repos ?? 0,
      totalPrivateRepos: data.total_private_repos ?? undefined,
    };

    this.token = cleanToken;
    this.user = user;
    return user;
  }

  /**
   * Returns whether GitHub is authenticated
   */
  isConnected(): boolean {
    return Boolean(this.token && this.user);
  }

  /**
   * Get current authenticated user profile
   */
  getUser(): GitHubUser | null {
    return this.user;
  }

  /**
   * Disconnect and clear session
   */
  disconnect(): void {
    this.token = null;
    this.user = null;
    this.mockRepos = undefined;
    this.mockBranches = undefined;
  }

  /**
   * List user repositories, optionally filtering by search term
   */
  async listRepositories(search?: string): Promise<GitHubRepo[]> {
    if (this.mockRepos) {
      return this.filterRepos(this.mockRepos, search);
    }

    if (!this.token) {
      throw new Error('GitHub account is not connected');
    }

    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'User-Agent': 'FusionHost-Control-Plane',
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to list repositories (${res.status}): ${errorText}`);
    }

    const rawRepos = (await res.json()) as any[];
    const repos: GitHubRepo[] = rawRepos.map((item) => ({
      id: item.id,
      name: item.name,
      fullName: item.full_name,
      private: Boolean(item.private),
      htmlUrl: item.html_url,
      cloneUrl: item.clone_url,
      description: item.description || undefined,
      defaultBranch: item.default_branch || 'main',
      language: item.language || undefined,
      stars: item.stargazers_count ?? 0,
      updatedAt: item.updated_at,
    }));

    return this.filterRepos(repos, search);
  }

  private filterRepos(repos: GitHubRepo[], search?: string): GitHubRepo[] {
    if (!search || !search.trim()) {
      return repos;
    }
    const q = search.trim().toLowerCase();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }

  /**
   * List branches for a specific repository
   */
  async listBranches(owner: string, repo: string): Promise<string[]> {
    const key = `${owner}/${repo}`;
    if (this.mockBranches && this.mockBranches[key]) {
      return this.mockBranches[key];
    }

    if (!this.token) {
      throw new Error('GitHub account is not connected');
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'User-Agent': 'FusionHost-Control-Plane',
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to list branches for ${owner}/${repo} (${res.status}): ${errorText}`);
    }

    const branches = (await res.json()) as any[];
    return branches.map((b) => b.name);
  }

  /**
   * Clone or fetch repository and analyze project spec
   */
  async importRepository(
    repoUrl: string,
    branch: string = 'main',
    appName?: string
  ): Promise<GitHubImportResult> {
    const { owner, repo } = this.parseOwnerAndRepo(repoUrl);
    const targetDir = path.resolve(process.cwd(), '.fusionhost/repos', owner, repo);

    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(targetDir), { recursive: true });

    // Clean existing target dir if it exists
    if (fs.existsSync(targetDir)) {
      try {
        fs.rmSync(targetDir, { recursive: true, force: true });
      } catch {
        // Continue if clean fails
      }
    }

    if (fs.existsSync(repoUrl)) {
      // Local source directory (e.g. testing or simulated repository)
      fs.mkdirSync(targetDir, { recursive: true });
      fs.cpSync(repoUrl, targetDir, { recursive: true });
    } else {
      let cloneUrl = repoUrl;
      if (this.token && repoUrl.startsWith('https://github.com/')) {
        const encodedToken = encodeURIComponent(this.token);
        cloneUrl = repoUrl.replace('https://github.com/', `https://${encodedToken}@github.com/`);
      }

      try {
        execFileSync('git', ['-c', 'credential.helper=', 'clone', '--depth', '1', '-b', branch, cloneUrl, targetDir], {
          stdio: 'pipe',
          timeout: 60000,
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: '0',
            GCM_INTERACTIVE: 'never',
          },
        });
      } catch (err: any) {
        // If git clone fails, check if local directory fallback or target exists
        if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
          const stderrText = err.stderr ? err.stderr.toString() : '';
          let errMsg = stderrText || err.message || String(err);
          if (this.token) {
            errMsg = errMsg
              .replaceAll(this.token, '***')
              .replaceAll(encodeURIComponent(this.token), '***');
          }
          throw new Error(`Failed to clone repository: ${errMsg.trim()}`);
        }
      }
    }

    const spec = await analyzeProject(targetDir);
    const finalAppName = appName || spec.appName || repo;

    return {
      success: true,
      localPath: targetDir,
      appName: finalAppName,
      spec,
    };
  }

  /**
   * Parse owner and repository name from URL or path
   */
  private parseOwnerAndRepo(repoUrl: string): { owner: string; repo: string } {
    const ghMatch = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?/i);
    if (ghMatch) {
      return { owner: ghMatch[1], repo: ghMatch[2] };
    }

    const trimmed = repoUrl.trim().replace(/^https?:\/\//, '').replace(/\.git$/, '');
    const parts = trimmed.split(/[\/\\]/).filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
    }

    const baseName = path.basename(repoUrl).replace(/\.git$/, '') || 'repo';
    return { owner: 'local', repo: baseName };
  }
}

export const githubService = new GitHubService();
