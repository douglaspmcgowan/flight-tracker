import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const originalAppSurface = process.env.APP_SURFACE;
const originalSelfHosted = process.env.SELF_HOSTED;

async function loadProxy() {
  vi.resetModules();
  process.env.APP_SURFACE = 'application';
  process.env.SELF_HOSTED = 'false';
  return import('./proxy');
}

describe('managed application middleware', () => {
  beforeEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  afterEach(() => {
    vi.resetModules();
    if (originalAppSurface === undefined) delete process.env.APP_SURFACE;
    else process.env.APP_SURFACE = originalAppSurface;
    if (originalSelfHosted === undefined) delete process.env.SELF_HOSTED;
    else process.env.SELF_HOSTED = originalSelfHosted;
  });

  it('redirects an anonymous page request to the admin login', async () => {
    const { proxy } = await loadProxy();
    const response = await proxy(new NextRequest('https://flight.example/awards?mode=analyst'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://flight.example/admin/login?next=%2Fawards%3Fmode%3Danalyst',
    );
  });

  it('rejects an anonymous application API request', async () => {
    const { proxy } = await loadProxy();
    const response = await proxy(new NextRequest('https://flight.example/api/awards/searches'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Unauthorized' });
  });

  it.each(['/setup', '/api/setup/status', '/api/health', '/api/cron/scrape', '/api/test/scrape'])(
    'keeps %s reachable for its route-level protection',
    async (pathname) => {
      const { proxy } = await loadProxy();
      const response = await proxy(new NextRequest(`https://flight.example${pathname}`));

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    },
  );
});
