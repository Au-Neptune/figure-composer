import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const TAURI_DEV_SERVER_PORT = 5173;
const TAURI_HMR_PORT = 1421;
const tauriDevHost = process.env.TAURI_DEV_HOST;
const tauriDebug = Boolean(process.env.TAURI_ENV_DEBUG);

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    host: tauriDevHost || false,
    port: TAURI_DEV_SERVER_PORT,
    strictPort: true,
    hmr: tauriDevHost
      ? {
          protocol: "ws",
          host: tauriDevHost,
          port: TAURI_HMR_PORT,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    minify: !tauriDebug,
    sourcemap: tauriDebug,
  },
});
