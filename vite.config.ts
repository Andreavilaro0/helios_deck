/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  // better-sqlite3 is a native Node addon — must not be bundled by Rollup
  // in the SSR build. Let Node load it at runtime instead.
  ssr: {
    external: ["better-sqlite3"],
  },
  test: {
    globals: false,
    server: {
      deps: {
        // Native addons cannot be processed by Vite's transform pipeline.
        external: ["better-sqlite3"],
      },
    },
  },
});
