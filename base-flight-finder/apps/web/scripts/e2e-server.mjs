import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));

process.env.APP_SURFACE = 'application';
process.env.SELF_HOSTED = 'true';
process.env.E2E = '1';
if (process.platform === 'win32' && !process.env.CHROME_PATH) {
  process.env.CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}
process.chdir(webRoot);
process.argv = [process.execPath, nextBin, 'dev', '--port', '3013'];

require(nextBin);
