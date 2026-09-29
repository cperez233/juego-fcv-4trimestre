import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { SECURITY_HEADERS, DEV_SECURITY_HEADERS } from "./security-headers.js";

/**
 * En desarrollo la API la sirve server.js (puerto 5005). Para probarla junto a Vite:
 *   npm run build && npm start      (en otra terminal)
 *   UDC_API_PROXY=http://127.0.0.1:5005 npm run dev
 */
const apiProxy = process.env.UDC_API_PROXY || "";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    headers: DEV_SECURITY_HEADERS,
    proxy: apiProxy ? { "/api": { target: apiProxy, changeOrigin: true } } : undefined,
  },
  preview: {
    host: true,
    port: 5005,
    headers: SECURITY_HEADERS,
  },
  test: {
    include: ["tests/**/*.test.js"],
  },
});
