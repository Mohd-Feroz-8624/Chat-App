import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import pkg from "vite-plugin-javascript-obfuscator";
// const obfuscator = pkg.obfuscator || pkg.default || pkg;

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode === "production" &&
      // obfuscator
      ({
        options: {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          disableConsoleOutput: true,
          identifierNamesGenerator: "hexadecimal",
          renameGlobals: false,
          stringArray: true,
          stringArrayEncoding: ["base64"],
          stringArrayRotate: true,
          stringArrayShuffle: true,
          splitStrings: true,
          splitStringsChunkLength: 8,
        },
      }),
  ].filter(Boolean),
  build: {
    // Do not publish source maps in production.
    sourcemap: false,
    minify: "esbuild",
    target: "es2018",
  },
  esbuild: {
    // Remove debug statements from production bundles.
    drop: ["console", "debugger"],
  },
}));
