import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      'dist',
      '*.config.js',
      'coverage',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  {
    // Pragmatic severity tuning: noisy/advisory/false-positive rules are
    // warnings (or off) so they never block CI; high-signal correctness rules
    // (no-undef, no-case-declarations, jsx-key, no-empty-pattern, ...) stay as
    // errors. Existing `any`/unused debt is preserved as warnings to pay down.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      // react-three-fiber relies on custom JSX props this rule can't recognize.
      'react/no-unknown-property': 'off',
      // Cosmetic; routinely fires on apostrophes in user-facing copy.
      'react/no-unescaped-entities': 'off',
      // React Compiler advisory rules: surface as warnings rather than block.
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // public/ holds static assets (service worker, etc.) served as-is by Vite,
    // not part of the module graph — don't lint them.
    ignores: ['public/**', 'replace-framer-motion.js'],
  },
);
