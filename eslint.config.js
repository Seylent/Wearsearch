import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist', 'node_modules', '.next', 'out', 'scripts/**', '**/AdminContentBackup.tsx'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off', // Вимкнено для app router
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ],
    },
  },
  {
    files: ['src/test/**/*.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module', 
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/contexts/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off', // shadcn/ui та app router
    },
  },
]
