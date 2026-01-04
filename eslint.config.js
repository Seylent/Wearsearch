import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_"
      }],
    },
  },
  {
    files: ["src/test/**/*.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    rules: {
      // Tests often use simplified mocks and helpers; keep them readable.
      "@typescript-eslint/no-explicit-any": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/examples/**/*.{ts,tsx}"],
    rules: {
      // Example code is educational/experimental; don't fail PRs on its lint noise.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/pages/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
    ],
    rules: {
      // Enforce data-layer: no direct HTTP in UI code
      "no-restricted-globals": ["error", "fetch"],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "Do not use axios in UI code. Use React Query hooks in the data-layer (src/hooks/*) and services.",
            },
            {
              name: "@/services/api",
              message: "Do not import the low-level API client in UI code. Use data-layer hooks/services instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      // shadcn/ui components often export helpers/constants; disabling avoids noise.
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/contexts/**/*.{ts,tsx}"],
    rules: {
      // Context modules commonly export hooks/helpers alongside providers.
      "react-refresh/only-export-components": "off",
    },
  },
);
