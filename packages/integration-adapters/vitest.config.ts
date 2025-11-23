import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "./src/test-helpers/setup.ts",
    globals: true,
    coverage: {
      provider: "v8",
      include: ["./src/**/*.ts"],
      exclude: ["./src/test-helpers/**"],
    },
  },
  plugins: [tsconfigPaths()],
});
