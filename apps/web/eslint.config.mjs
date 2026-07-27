import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.next-local/**',
      '**/.next-flight-finder/**',
      '**/.next-flight-finder.stale-*/**',
      '**/.next-e2e/**',
      '**/prisma/generated/**',
      'next-env.d.ts',
      'public/sw.js',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        fetch: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
      },
    },
  }
);
