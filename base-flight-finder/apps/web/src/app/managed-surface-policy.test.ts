import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('managed application surface', () => {
  it('keeps the fare-transparency marketing section off the application home', () => {
    const homePage = readFileSync(resolve(process.cwd(), 'src/app/page.tsx'), 'utf8')
      .replaceAll('\r\n', '\n');

    expect(homePage).toContain(
      '{!isApplicationSurface && (\n        <section className={styles.why}>',
    );
  });
});
