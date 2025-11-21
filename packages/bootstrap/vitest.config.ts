import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      include: ["./src/**/*.ts"],
      exclude: ["./src/test-helpers/**"],
    },
  },
  plugins: [tsconfigPaths()],
});
