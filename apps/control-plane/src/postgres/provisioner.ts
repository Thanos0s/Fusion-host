import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface PostgresBinding {
  dbName: string;
  internalUrl: string;
  externalUrl: string;
  containerName: string;
}

export class PostgresProvisioner {
  private networkName = 'fusionhost-net';
  private pgContainerName = 'fusionhost-postgres';
  private pgPassword = 'fusionhost_dev_secret';

  async isDockerRunning(): Promise<boolean> {
    try {
      await execAsync('docker info');
      return true;
    } catch {
      return false;
    }
  }

  async ensureNetwork(): Promise<void> {
    try {
      await execAsync(`docker network create ${this.networkName}`);
    } catch {
      // already exists
    }
  }

  async ensurePostgresServer(): Promise<void> {
    const isRunning = await this.isDockerRunning();
    if (!isRunning) return;

    await this.ensureNetwork();

    try {
      const { stdout } = await execAsync(`docker ps -a --filter "name=${this.pgContainerName}" --format "{{.Status}}"`);
      if (!stdout.trim()) {
        // Not created, create container
        await execAsync(
          `docker run -d --name ${this.pgContainerName} --network ${this.networkName} ` +
          `-e POSTGRES_PASSWORD=${this.pgPassword} -p 5432:5432 postgres:16-alpine`
        );
      } else if (!stdout.includes('Up')) {
        // Exists but stopped, start it
        await execAsync(`docker start ${this.pgContainerName}`);
      }
    } catch (err: any) {
      console.warn(`[PostgresProvisioner] Notice: Could not manage postgres container (${err.message})`);
    }
  }

  async provisionDatabase(appName: string): Promise<PostgresBinding> {
    const safeName = appName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const dbName = `fusionhost_${safeName}`;

    const internalUrl = `postgresql://postgres:${this.pgPassword}@${this.pgContainerName}:5432/${dbName}`;
    const externalUrl = `postgresql://postgres:${this.pgPassword}@localhost:5432/${dbName}`;

    const isDocker = await this.isDockerRunning();
    if (isDocker) {
      await this.ensurePostgresServer();
      try {
        // Create database if not exists
        await execAsync(
          `docker exec ${this.pgContainerName} psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${dbName}'"`
        ).then(async ({ stdout }) => {
          if (!stdout.trim().includes('1')) {
            await execAsync(`docker exec ${this.pgContainerName} psql -U postgres -c "CREATE DATABASE ${dbName};"`);
          }
        });
      } catch (err: any) {
        console.warn(`[PostgresProvisioner] Database creation notice: ${err.message}`);
      }
    }

    return {
      dbName,
      internalUrl,
      externalUrl,
      containerName: this.pgContainerName
    };
  }
}

export const postgresProvisioner = new PostgresProvisioner();
