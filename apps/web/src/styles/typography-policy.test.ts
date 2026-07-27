import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_EXTENSIONS = new Set(['.css', '.ts', '.tsx']);
const FORBIDDEN_FACE = ['IBM', 'Plex', 'Mono'].join(' ');
const LEGACY_TOKEN = ['--font', 'mono'].join('-');

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
  });
}

describe('typography policy', () => {
  it('keeps the retired face and legacy token out of the design system', () => {
    const files = [
      ...sourceFiles(resolve(process.cwd(), 'src')),
      resolve(process.cwd(), '../../DESIGN.md'),
    ];
    const violations = files.filter((file) => {
      const content = readFileSync(file, 'utf8');
      return content.includes(FORBIDDEN_FACE) || content.includes(LEGACY_TOKEN);
    });

    expect(violations).toEqual([]);
  });
});
