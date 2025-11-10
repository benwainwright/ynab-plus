import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules/**"],
  },
  {
    plugins: {
      import: importPlugin,
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
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
