import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/** Deploy under a subpath (e.g. `/shop/`) by setting `VITE_BASE_PATH=/shop/` at build time */
const BASE = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  base: BASE,
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  server: {
    host: "::",
    port: 8080,
    // Proxy API during dev so requests stay same-origin (no browser CORS to localhost:4000).
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
