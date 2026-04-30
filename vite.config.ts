/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When Vitest runs, the React Router plugin's HMR preamble check fails in
// jsdom. Swap it for a plain React plugin that handles JSX without the
// preamble requirement. The app-level reactRouter() plugin is only needed
// for the dev server and production build, not for tests.
const isTest = process.env["VITEST"] !== undefined;

export default defineConfig({
  plugins: isTest ? [tailwindcss(), react()] : [tailwindcss(), reactRouter()],
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
    setupFiles: ["./vitest.setup.ts"],
    // Per-file environment is set via the // @vitest-environment comment at the
    // top of each test file. Component tests use jsdom; server tests use node.
    server: {
      deps: {
        // Native addons cannot be processed by Vite's transform pipeline.
        external: ["better-sqlite3"],
      },
    },
  },
});
