'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  Github,
  Search,
  Lock,
  Globe,
  Star,
  GitBranch,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Rocket,
  Code2,
} from 'lucide-react';
import type { AppSpec, GitHubUser, GitHubRepo, GitHubBranch, GitHubImportResult } from '@fusionhost/types';
import AppSpecCard from './AppSpecCard';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (sourcePath: string, appName: string) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dockerfile: '#384d54',
  Shell: '#89e051',
};

export default function GitHubDeployModal({ isOpen, onClose, onDeploy }: GitHubDeployModalProps) {
  const [activeTab, setActiveTab] = useState<'folder' | 'github'>('github');

  // --- Local Folder Tab State ---
  const [folderPath, setFolderPath] = useState('examples/sample-node-app');
  const [folderAppName, setFolderAppName] = useState('sample-node-app');
  const [analyzingFolder, setAnalyzingFolder] = useState(false);
  const [folderSpec, setFolderSpec] = useState<AppSpec | null>(null);

  // --- GitHub Tab State ---
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);

  // Disconnected PAT input
  const [patToken, setPatToken] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Connected Repos state
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Repo for config & deploy
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [customAppName, setCustomAppName] = useState('');

  // Import & Analysis state
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<GitHubImportResult | null>(null);

  // Fetch GitHub Status on mount or when opening
  useEffect(() => {
    if (!isOpen) return;

    const checkStatus = async () => {
      setLoadingStatus(true);
      try {
        const res = await fetch('http://localhost:4000/api/github/status');
        if (res.ok) {
          const data = await res.json();
          setGithubConnected(Boolean(data.connected));
          setGithubUser(data.user || null);
          if (data.connected) {
            fetchRepos();
          }
        } else {
          setGithubConnected(false);
        }
      } catch {
        setGithubConnected(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    checkStatus();
  }, [isOpen]);

  // Fetch Repositories
  const fetchRepos = async (query?: string) => {
    setLoadingRepos(true);
    setReposError(null);
    try {
      const url = query
        ? `http://localhost:4000/api/github/repos?search=${encodeURIComponent(query)}`
        : 'http://localhost:4000/api/github/repos';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRepos(data.repos || []);
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to fetch repositories' }));
        setReposError(err.error || 'Failed to fetch repositories');
      }
    } catch {
      setReposError('Control plane is unreachable');
    } finally {
      setLoadingRepos(false);
    }
  };

  // Connect GitHub PAT
  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!patToken.trim()) return;

    setConnecting(true);
    setConnectError(null);
    try {
      const res = await fetch('http://localhost:4000/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: patToken.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGithubConnected(true);
        setGithubUser(data.user);
        setPatToken('');
        fetchRepos();
      } else {
        setConnectError(data.error || 'Failed to authenticate with GitHub token');
      }
    } catch {
      setConnectError('Could not reach control plane server at http://localhost:4000');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect GitHub
  const handleDisconnect = async () => {
    try {
      await fetch('http://localhost:4000/api/github/disconnect', { method: 'POST' });
    } catch {}
    setGithubConnected(false);
    setGithubUser(null);
    setRepos([]);
    setSelectedRepo(null);
    setImportResult(null);
  };

  // Select Repo & fetch branches
  const handleSelectRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setCustomAppName(repo.name);
    setSelectedBranch(repo.defaultBranch || 'main');
    setImportResult(null);
    setImportError(null);

    // Fetch branches for selected repo
    const [owner, name] = repo.fullName.split('/');
    if (owner && name) {
      setLoadingBranches(true);
      try {
        const res = await fetch(`http://localhost:4000/api/github/repos/${owner}/${name}/branches`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.branches) && data.branches.length > 0) {
            setBranches(data.branches);
          } else {
            setBranches([{ name: repo.defaultBranch || 'main' }]);
          }
        } else {
          setBranches([{ name: repo.defaultBranch || 'main' }]);
        }
      } catch {
        setBranches([{ name: repo.defaultBranch || 'main' }]);
      } finally {
        setLoadingBranches(false);
      }
    } else {
      setBranches([{ name: repo.defaultBranch || 'main' }]);
    }
  };

  // Analyze & Import selected repo
  const handleAnalyzeRepo = async () => {
    if (!selectedRepo) return;
    setImporting(true);
    setImportError(null);

    try {
      const res = await fetch('http://localhost:4000/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: selectedRepo.cloneUrl || selectedRepo.htmlUrl,
          branch: selectedBranch || selectedRepo.defaultBranch,
          appName: customAppName || selectedRepo.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult(data);
      } else {
        setImportError(data.error || 'Failed to import and analyze repository manifest');
      }
    } catch {
      setImportError('Failed to connect to control plane at http://localhost:4000');
    } finally {
      setImporting(false);
    }
  };

  // Filtered repositories based on search bar
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const q = searchQuery.toLowerCase();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.language && r.language.toLowerCase().includes(q))
    );
  }, [repos, searchQuery]);

  // Local Folder Analysis handler
  const handleSimulateFolderAnalysis = async () => {
    setAnalyzingFolder(true);
    try {
      const res = await fetch('http://localhost:4000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
      });
      if (res.ok) {
        const data = await res.json();
        setFolderSpec(data);
        if (data.appName && !folderAppName) {
          setFolderAppName(data.appName);
        }
        setAnalyzingFolder(false);
        return;
      }
    } catch {}

    setTimeout(() => {
      setAnalyzingFolder(false);
      setFolderSpec({
        appName: folderAppName || 'sample-node-app',
        runtime: 'node',
        version: '22',
        framework: 'Express',
        startCommand: 'node server.js',
        port: 3000,
        needsPostgres: true,
        hasExistingDockerfile: false,
        requiredEnvVars: [
          {
            name: 'DATABASE_URL',
            required: true,
            citedIn: 'package.json#dependencies.pg',
            description: 'Auto-provisioned by FusionHost',
          },
        ],
        citations: {
          framework: 'package.json#dependencies.express',
          startCommand: 'package.json#scripts.start',
          port: 'server.js#listen(3000)',
          needsPostgres: 'package.json#dependencies.pg',
        },
        hazards: [],
      });
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          maxWidth: 680,
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header & Tabs */}
        <div
          style={{
            padding: '20px 24px 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: '#000',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Rocket style={{ width: 18, height: 18, color: '#8b5cf6' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>Deploy Application</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>
                  Deploy seamlessly from GitHub or inspect a local directory
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Nav Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setActiveTab('github')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'github' ? '#fff' : 'rgba(255,255,255,0.45)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'github' ? '2px solid #8b5cf6' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              <Github style={{ width: 15, height: 15, color: activeTab === 'github' ? '#8b5cf6' : 'currentColor' }} />
              GitHub Repositories
            </button>
            <button
              onClick={() => setActiveTab('folder')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'folder' ? '#fff' : 'rgba(255,255,255,0.45)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'folder' ? '2px solid #8b5cf6' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              <Folder style={{ width: 15, height: 15, color: activeTab === 'folder' ? '#8b5cf6' : 'currentColor' }} />
              Local Folder
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* TAB 1: LOCAL FOLDER */}
          {activeTab === 'folder' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Folder Path
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    placeholder="examples/sample-node-app"
                    style={{
                      flex: 1,
                      background: '#000',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '10px 12px',
                      fontSize: 13,
                      fontFamily: 'monospace',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleSimulateFolderAnalysis}
                    disabled={analyzingFolder || !folderPath}
                    style={{
                      background: analyzingFolder ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.35)',
                      borderRadius: 6,
                      padding: '10px 16px',
                      fontSize: 13,
                      color: '#8b5cf6',
                      fontWeight: 600,
                      cursor: analyzingFolder ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {analyzingFolder ? (
                      <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Code2 style={{ width: 14, height: 14 }} />
                    )}
                    Analyze
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Application Name
                </label>
                <input
                  type="text"
                  value={folderAppName}
                  onChange={(e) => setFolderAppName(e.target.value)}
                  placeholder="my-cool-service"
                  style={{
                    width: '100%',
                    background: '#000',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6,
                    padding: '10px 12px',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {folderSpec && (
                <div style={{ marginTop: 6 }}>
                  <AppSpecCard spec={folderSpec} />
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 10,
                  paddingTop: 16,
                  marginTop: 8,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.45)',
                    fontWeight: 500,
                    padding: '8px 14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeploy(folderPath, folderAppName);
                    onClose();
                  }}
                  disabled={!folderPath.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#7c3aed',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 18px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: folderPath.trim() ? 'pointer' : 'not-allowed',
                    opacity: folderPath.trim() ? 1 : 0.6,
                  }}
                >
                  Deploy Now
                  <Rocket style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB REPOSITORIES */}
          {activeTab === 'github' && (
            <div>
              {loadingStatus ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, color: 'rgba(255,255,255,0.45)' }}>
                  <RefreshCw style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 13 }}>Checking GitHub status...</span>
                </div>
              ) : !githubConnected ? (
                /* STATE A: Disconnected - PAT Input Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div
                    style={{
                      background: 'rgba(124,58,237,0.06)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: 10,
                      padding: 16,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <Github style={{ width: 22, height: 22, color: '#8b5cf6', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 13, lineHeight: '1.5', color: 'rgba(255,255,255,0.85)' }}>
                      <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#fff' }}>Connect GitHub Account</p>
                      Enter a GitHub Personal Access Token (classic or fine-grained) to browse and 1-click deploy your public and private repositories.
                    </div>
                  </div>

                  <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.5)',
                            fontWeight: 600,
                          }}
                        >
                          Personal Access Token
                        </label>
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=FusionHost"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 11.5,
                            color: '#8b5cf6',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          Generate token with required scopes
                          <ExternalLink style={{ width: 12, height: 12 }} />
                        </a>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPat ? 'text' : 'password'}
                          value={patToken}
                          onChange={(e) => setPatToken(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          style={{
                            width: '100%',
                            background: '#000',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 6,
                            padding: '11px 40px 11px 12px',
                            fontSize: 13,
                            fontFamily: 'monospace',
                            color: '#fff',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPat(!showPat)}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.4)',
                            display: 'flex',
                          }}
                        >
                          {showPat ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>
                        Token requires <code style={{ color: '#8b5cf6' }}>repo</code> (for private repos) and <code style={{ color: '#8b5cf6' }}>read:user</code> permissions.
                      </p>
                    </div>

                    {connectError && (
                      <div
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: 8,
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12.5,
                          color: '#ef4444',
                        }}
                      >
                        <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                        <span>{connectError}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={onClose}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.45)',
                          fontWeight: 500,
                          padding: '8px 14px',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={connecting || !patToken.trim()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '10px 18px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: connecting || !patToken.trim() ? 'not-allowed' : 'pointer',
                          opacity: connecting || !patToken.trim() ? 0.6 : 1,
                        }}
                      >
                        {connecting ? (
                          <>
                            <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Github style={{ width: 14, height: 14 }} />
                            Connect GitHub Account
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : importResult ? (
                /* STATE B: Pre-Deploy Analysis Preview (AppSpec & Citations) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => setImportResult(null)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#8b5cf6',
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      <ArrowLeft style={{ width: 14, height: 14 }} />
                      Back to Repositories
                    </button>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      Cloned to: {importResult.localPath}
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(34,197,94,0.06)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: 10,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 style={{ width: 18, height: 18, color: '#22c55e' }} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>
                          Ready to Deploy: {importResult.appName}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                          Repository manifest analyzed successfully
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: '#8b5cf6',
                        background: 'rgba(139,92,246,0.12)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        padding: '3px 8px',
                        borderRadius: 4,
                      }}
                    >
                      branch: {selectedBranch}
                    </span>
                  </div>

                  {/* AppSpecCard Preview */}
                  <AppSpecCard spec={importResult.spec} />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 10,
                      paddingTop: 16,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <button
                      onClick={() => setImportResult(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.45)',
                        fontWeight: 500,
                        padding: '8px 14px',
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        onDeploy(importResult.localPath, importResult.appName);
                        onClose();
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#7c3aed',
                        border: 'none',
                        borderRadius: 6,
                        padding: '10px 20px',
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                      }}
                    >
                      <Rocket style={{ width: 14, height: 14 }} />
                      Confirm &amp; Deploy Now
                    </button>
                  </div>
                </div>
              ) : selectedRepo ? (
                /* STATE C: Configure Selected Repository (Branch & App Name) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => {
                        setSelectedRepo(null);
                        setImportError(null);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#8b5cf6',
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      <ArrowLeft style={{ width: 14, height: 14 }} />
                      Change Repository
                    </button>
                  </div>

                  {/* Selected Repo Card Summary */}
                  <div
                    style={{
                      background: '#000',
                      border: '1px solid rgba(139,92,246,0.35)',
                      borderRadius: 10,
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {selectedRepo.private ? (
                          <Lock style={{ width: 14, height: 14, color: '#fbbf24' }} />
                        ) : (
                          <Globe style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.45)' }} />
                        )}
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                          {selectedRepo.fullName}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: selectedRepo.private ? '#fbbf24' : '#22c55e',
                          background: selectedRepo.private ? 'rgba(251,191,36,0.1)' : 'rgba(34,197,94,0.1)',
                          border: `1px solid ${selectedRepo.private ? 'rgba(251,191,36,0.25)' : 'rgba(34,197,94,0.25)'}`,
                          borderRadius: 4,
                          padding: '2px 6px',
                        }}
                      >
                        {selectedRepo.private ? 'Private' : 'Public'}
                      </span>
                    </div>

                    {selectedRepo.description && (
                      <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px' }}>
                        {selectedRepo.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                      {selectedRepo.language && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: LANGUAGE_COLORS[selectedRepo.language] || '#8b5cf6',
                            }}
                          />
                          {selectedRepo.language}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Star style={{ width: 12, height: 12 }} />
                        {selectedRepo.stars}
                      </span>
                    </div>
                  </div>

                  {/* Configuration Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 11,
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: 'rgba(255,255,255,0.45)',
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Target Branch
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          disabled={loadingBranches || importing}
                          style={{
                            width: '100%',
                            background: '#000',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 6,
                            padding: '10px 12px',
                            fontSize: 13,
                            fontFamily: 'monospace',
                            color: '#fff',
                            outline: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                          }}
                        >
                          {branches.map((b) => (
                            <option key={b.name} value={b.name} style={{ background: '#0d0d0d', color: '#fff' }}>
                              {b.name} {b.name === selectedRepo.defaultBranch ? '(default)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 11,
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: 'rgba(255,255,255,0.45)',
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Application Name
                      </label>
                      <input
                        type="text"
                        value={customAppName}
                        onChange={(e) => setCustomAppName(e.target.value)}
                        placeholder={selectedRepo.name}
                        disabled={importing}
                        style={{
                          width: '100%',
                          background: '#000',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 6,
                          padding: '10px 12px',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          color: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {importError && (
                      <div
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: 8,
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12.5,
                          color: '#ef4444',
                        }}
                      >
                        <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                        <span>{importError}</span>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 10,
                        paddingTop: 16,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <button
                        onClick={() => setSelectedRepo(null)}
                        disabled={importing}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.45)',
                          fontWeight: 500,
                          padding: '8px 14px',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAnalyzeRepo}
                        disabled={importing}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#7c3aed',
                          border: 'none',
                          borderRadius: 6,
                          padding: '10px 18px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#fff',
                          cursor: importing ? 'not-allowed' : 'pointer',
                          opacity: importing ? 0.6 : 1,
                        }}
                      >
                        {importing ? (
                          <>
                            <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                            Cloning &amp; Analyzing Manifest...
                          </>
                        ) : (
                          <>
                            <Code2 style={{ width: 14, height: 14 }} />
                            Analyze &amp; Preview Spec
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* STATE D: Connected - Profile Card & Repository Explorer */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* User Profile Card */}
                  {githubUser && (
                    <div
                      style={{
                        background: '#000',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {githubUser.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={githubUser.avatarUrl}
                            alt={githubUser.login}
                            style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {githubUser.login[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>
                              {githubUser.name || githubUser.login}
                            </span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                              @{githubUser.login}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                            {githubUser.publicRepos + (githubUser.totalPrivateRepos || 0)} repositories accessible
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDisconnect}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  )}

                  {/* Search and Refresh Bar */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 14,
                          height: 14,
                          color: 'rgba(255,255,255,0.35)',
                        }}
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your repositories..."
                        style={{
                          width: '100%',
                          background: '#000',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6,
                          padding: '9px 12px 9px 34px',
                          fontSize: 13,
                          color: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <button
                      onClick={() => fetchRepos(searchQuery)}
                      disabled={loadingRepos}
                      title="Refresh repositories"
                      style={{
                        background: '#000',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        padding: '9px 12px',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: loadingRepos ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RefreshCw style={{ width: 14, height: 14, animation: loadingRepos ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                  </div>

                  {/* Repo list error */}
                  {reposError && (
                    <div
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 6,
                        padding: '10px 14px',
                        fontSize: 12.5,
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <AlertCircle style={{ width: 14, height: 14 }} />
                      <span>{reposError}</span>
                    </div>
                  )}

                  {/* Scrollable Repo List */}
                  <div
                    style={{
                      maxHeight: 320,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      paddingRight: 4,
                    }}
                  >
                    {loadingRepos ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                        <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                        Loading repositories...
                      </div>
                    ) : filteredRepos.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                        {searchQuery ? 'No repositories matching your search' : 'No repositories found in this account'}
                      </div>
                    ) : (
                      filteredRepos.map((repo) => (
                        <div
                          key={repo.id}
                          style={{
                            background: '#000',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 8,
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 16,
                            transition: 'border-color 0.15s, background 0.15s',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                            e.currentTarget.style.background = '#080808';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                            e.currentTarget.style.background = '#000';
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                              {repo.private ? (
                                <Lock style={{ width: 13, height: 13, color: '#fbbf24', flexShrink: 0 }} />
                              ) : (
                                <Globe style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                              )}
                              <span
                                style={{
                                  fontSize: 13.5,
                                  fontWeight: 600,
                                  color: '#fff',
                                  fontFamily: 'monospace',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {repo.fullName}
                              </span>
                            </div>

                            {repo.description && (
                              <p
                                style={{
                                  fontSize: 12,
                                  color: 'rgba(255,255,255,0.5)',
                                  margin: '0 0 8px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {repo.description}
                              </p>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>
                              {repo.language && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <span
                                    style={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: '50%',
                                      background: LANGUAGE_COLORS[repo.language] || '#8b5cf6',
                                    }}
                                  />
                                  {repo.language}
                                </span>
                              )}
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Star style={{ width: 11, height: 11 }} />
                                {repo.stars}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <GitBranch style={{ width: 11, height: 11 }} />
                                {repo.defaultBranch}
                              </span>
                              <span>
                                {repo.updatedAt ? `Updated ${new Date(repo.updatedAt).toLocaleDateString()}` : ''}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectRepo(repo)}
                            style={{
                              background: 'rgba(124,58,237,0.12)',
                              border: '1px solid rgba(124,58,237,0.3)',
                              color: '#8b5cf6',
                              borderRadius: 6,
                              padding: '8px 14px',
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              transition: 'all 0.15s',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#7c3aed';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
                              e.currentTarget.style.color = '#8b5cf6';
                            }}
                          >
                            Analyze &amp; Deploy
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
