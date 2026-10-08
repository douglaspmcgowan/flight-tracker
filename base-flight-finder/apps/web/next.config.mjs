import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Monorepo root, so Next traces workspace files into the standalone build
// instead of only inferring the root (which it warns about in 16).
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

import process from 'node:process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The legacy .next directory can be held by OneDrive after a standalone build.
  // Keep generated output isolated so local production builds remain restartable.
  distDir: process.env.VERCEL
    ? '.next'
    : process.env.E2E === '1'
      ? '.next-e2e'
      : '.next-flight-finder',
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: repoRoot,
  outputFileTracingIncludes: {
    '/*': [
      '../../node_modules/@sparticuz/chromium/bin/**/*',
      '../../node_modules/playwright-core/browsers.json',
    ],
  },
  serverExternalPackages: [
    'playwright',
    '@sparticuz/chromium',
    'better-sqlite3',
    'geoip-lite',
    'cron',
    'ioredis',
    'ua-parser-js',
    '@anthropic-ai/sdk',
    'openai',
    '@google/generative-ai',
  ],
};

export default withNextIntl(nextConfig);
