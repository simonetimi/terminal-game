import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const rootDir = __dirname;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    fs: {
      allow: [path.resolve(__dirname, ".."), path.resolve(__dirname, "../../")],
    },
    watch: {
      ignored: (p) => !p || !p.startsWith(rootDir),
    },
  },
});
