import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockLaunch, mockServerlessExecutablePath } = vi.hoisted(() => ({
  mockLaunch: vi.fn(),
  mockServerlessExecutablePath: vi.fn().mockResolvedValue('/tmp/chromium'),
}));

vi.mock('playwright', () => ({
  chromium: {
    launch: (...args: unknown[]) => mockLaunch(...args),
  },
}));

vi.mock('@sparticuz/chromium', () => ({
  default: {
    args: ['--serverless-chromium'],
    executablePath: (...args: unknown[]) => mockServerlessExecutablePath(...args),
  },
}));

import { launchBrowser } from './browser';

const originalVercel = process.env.VERCEL;
const originalChromePath = process.env.CHROME_PATH;

beforeEach(() => {
  mockLaunch.mockReset().mockResolvedValue({ close: vi.fn() });
  mockServerlessExecutablePath.mockClear();
  delete process.env.VERCEL;
  delete process.env.CHROME_PATH;
});

afterAll(() => {
  if (originalVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = originalVercel;
  if (originalChromePath === undefined) delete process.env.CHROME_PATH;
  else process.env.CHROME_PATH = originalChromePath;
});

describe('launchBrowser', () => {
  it('launches the bundled serverless Chromium binary on Vercel', async () => {
    process.env.VERCEL = '1';

    await launchBrowser();

    expect(mockServerlessExecutablePath).toHaveBeenCalledOnce();
    expect(mockLaunch).toHaveBeenCalledWith(expect.objectContaining({
      headless: true,
      executablePath: '/tmp/chromium',
      args: expect.arrayContaining([
        '--serverless-chromium',
        '--disable-blink-features=AutomationControlled',
      ]),
    }));
  });

  it('keeps an explicit local Chrome path authoritative', async () => {
    process.env.CHROME_PATH = 'C:\\Chrome\\chrome.exe';

    await launchBrowser();

    expect(mockServerlessExecutablePath).not.toHaveBeenCalled();
    expect(mockLaunch).toHaveBeenCalledWith(expect.objectContaining({
      executablePath: 'C:\\Chrome\\chrome.exe',
      args: expect.not.arrayContaining([
        '--single-process',
        '--disable-gpu',
      ]),
    }));
  });
});
