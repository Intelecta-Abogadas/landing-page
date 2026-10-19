import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vitest/config";

// Each page builds as one self-contained index.html, in its own pass: the landing (default mode)
// empties dist/, then `--mode terminos`, `--mode privacidad` and `--mode buscar` add their folders next to it.
const PAGINAS: Record<string, string> = {
  terminos: "terminos/index.html",
  privacidad: "privacidad/index.html",
  buscar: "buscar/index.html",
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), viteSingleFile()],
  base: "./",
  build: {
    target: "es2022",
    emptyOutDir: !(mode in PAGINAS),
    rollupOptions: { input: PAGINAS[mode] ?? "index.html" },
  },
  test: { environment: "node" },
}));
