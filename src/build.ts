await Bun.build({
  entrypoints: ["./src/start.ts"],
  target: "bun",
  outdir: "dist",
  sourcemap: "linked",
  naming: "[dir]/[name].[ext]",
});
