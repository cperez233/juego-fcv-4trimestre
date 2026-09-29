import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { SECURITY_HEADERS, DEV_SECURITY_HEADERS } from "./security-headers.js";

/**
 * En local el juego funciona sin PHP (localStorage + CSV).
 * Si tienes PHP en otro puerto (ej. 8080), define:
 *   CH_API_PROXY=http://127.0.0.1:8080
 */
const apiProxy = process.env.CH_API_PROXY || "";

function securityHeadersPlugin(headers) {
  return {
    name: "ch-security-headers",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
        for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeadersPlugin(DEV_SECURITY_HEADERS)],
  server: {
    host: true,
    port: 5173,
    open: false,
    headers: DEV_SECURITY_HEADERS,
    proxy: apiProxy
      ? {
          "/api": {
            target: apiProxy,
            changeOrigin: true,
          },
        }
      : undefined,
  },
  preview: {
    host: true,
    port: 5005,
    headers: SECURITY_HEADERS,
  },
});
