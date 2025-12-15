import { defineConfig } from "vite";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  publicDir: false,
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, "src/start-server.ts"),
      formats: ["cjs"],
      fileName: () => "start-server.cjs",
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "node24",
  },
  plugins: [
    tsconfigPaths({
      projects: [
        "./tsconfig.json",
        "../application/tsconfig.json",
        "../integration-adapters/tsconfig.json",
        "../node-adapters/tsconfig.json",
        "../domain/tsconfig.json",
        "../sqlite-adapters/tsconfig.json",
      ],
    }),
  ],
});
