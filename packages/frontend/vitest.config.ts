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
  // @ts-expect-error don't know what is going on here, but it defo works correctly
  plugins: [tsconfigPaths()],
});
