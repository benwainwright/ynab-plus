import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: [
        "./tsconfig.json",
        "../application/tsconfig.json",
        "../integration-adapters/tsconfig.json",
        "../node-adapters/tsconfig.json",
        "../sqlite-adapters/tsconfig.json",
      ],
    }),
  ],
});
