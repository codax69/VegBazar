import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],

    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },

      proxy: {
        "/api": {
          target: "https://vegbazar.cloud/api",
          changeOrigin: true,
        },
      },
    },
  };
});
