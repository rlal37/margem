import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'playwright-report', 'test-results'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
  // Test files run in Node/jsdom with Vitest globals.
  {
    files: [
      '**/*.{test,spec}.{ts,tsx}',
      'src/setupTests.ts',
      'tests/**/*.{ts,tsx}',
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  // Keep ESLint out of Prettier's way (formatting rules disabled).
  prettier,
)
