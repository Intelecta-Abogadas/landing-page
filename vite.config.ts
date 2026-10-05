import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vitest/config";

// The build is one self-contained index.html: it opens with a double click and deploys anywhere.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./",
  build: { target: "es2022" },
  test: { environment: "node" },
});
