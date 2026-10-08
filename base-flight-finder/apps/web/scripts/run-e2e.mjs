import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const repositoryRoot = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
require('dotenv').config({
  path: join(repositoryRoot, 'apps', 'web', '.env.local'),
  quiet: true,
});
const serverScript = join(repositoryRoot, 'apps', 'web', 'scripts', 'e2e-server.mjs');
const playwrightRoot = dirname(require.resolve('playwright/package.json'));
const playwrightCli = join(playwrightRoot, 'cli.js');
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('npm_execpath is required to run the E2E database migration');
}
const migration = spawnSync(process.execPath, [npmCli, 'run', 'db:migrate'], {
  cwd: repositoryRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
});
if (migration.status !== 0) {
  if (migration.error) process.stderr.write(`${migration.error}\n`);
  process.exit(migration.status ?? 1);
}

const server = spawn(process.execPath, [serverScript], {
  cwd: repositoryRoot,
  env: process.env,
  stdio: ['ignore', 'inherit', 'inherit'],
  windowsHide: true,
});

let stopped = false;

function stopServer() {
  if (stopped) return;
  stopped = true;
  if (process.platform === 'win32') {
    spawnSync('taskkill.exe', ['/pid', String(server.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    return;
  }
  server.kill('SIGTERM');
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopServer();
    process.exit(1);
  });
}

async function waitForServer() {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`E2E server exited before becoming ready (code ${server.exitCode})`);
    }
    try {
      const response = await fetch('http://localhost:3013/api/health');
      if (response.ok) return;
    } catch {
      // The dev server is still compiling.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('E2E server did not become ready within 180 seconds');
}

let exitCode;
try {
  await waitForServer();
  const runner = spawn(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
    cwd: repositoryRoot,
    env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: '1' },
    stdio: 'inherit',
    windowsHide: true,
  });
  exitCode = await new Promise((resolve) => {
    runner.once('exit', (code) => resolve(code ?? 1));
  });
} finally {
  stopServer();
}

process.exit(exitCode ?? 1);
