import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: ["**/node_modules/**", "**/.*", "**/dist", "**/coverage"],
  },
  {
    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "core", pattern: "src/core/*" },
        { type: "types", pattern: "src/types/*" },
        { type: "test-helpers", pattern: "src/test-helpers/*" },
        { type: "data", pattern: "src/data/*" },
        { type: "client", pattern: "src/client/*" },
      ],
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
