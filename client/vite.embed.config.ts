import { defineConfig } from "vite";
import { resolve } from "path";

// Config para compilar embed.ts como script IIFE standalone
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/embed.ts"),
      name: "ChatWidget",
      fileName: () => "embed.js",
      formats: ["iife"],
    },
    outDir: "dist-embed",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
