// eslint.config.js  (flat-config – ESLint v9+)
import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
  // JS/TS common rules
  js.configs.recommended,

  // TypeScript-ESLint (rules + type-aware)
  ...ts.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['./tsconfig.json'] },
    },
  },

  // Prettier integration
  {
    plugins: { prettier },
    rules: { 'prettier/prettier': 'error' },
  },
];
