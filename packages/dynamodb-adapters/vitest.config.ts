import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    globalSetup: "./src/test-helpers/global-setup.ts",
    coverage: {
      provider: "v8",
      include: ["./src/**/*.ts"],
      exclude: ["./src/test-helpers/**"]
    }
  },
  plugins: [tsconfigPaths()]
});
