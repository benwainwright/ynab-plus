import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    projects: ["packages/*"],
    coverage: {
      include: ["./**/*.ts", "**/*.tsx"],
      exclude: [
        "**/node_modules/**",
        "**/coverage/**",
        "**/dist/**",
        "**/test-helpers/**",
        ".husky/**",
        "packages/frontend/**/+types",
      ],
      provider: "v8",
    },
  },
});
