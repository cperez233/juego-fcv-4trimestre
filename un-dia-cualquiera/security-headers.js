/**
 * Cabeceras de seguridad HTTP (CSP, anti-clickjacking, caché).
 * Adaptado de CiberHéroes Doomsday. Cambios:
 *  - Sin Google Fonts: el juego usa fuentes del sistema, así que no hay orígenes externos.
 *  - style-src de producción sin 'unsafe-inline' (Vite genera archivos .css);
 *    solo se permiten atributos style="" que React usa para posiciones puntuales.
 */
const CSP_BASE = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "style-src-attr 'unsafe-inline'",
].join("; ");

const CSP_PROD = [
  CSP_BASE,
  "style-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
].join("; ");

const COMUNES = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/** Producción / preview (puerto 5005) */
export const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP_PROD,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  ...COMUNES,
};

/** Desarrollo (Vite HMR necesita eval, estilos inyectados y websocket) */
export const DEV_SECURITY_HEADERS = {
  "Content-Security-Policy": [
    CSP_BASE,
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "connect-src 'self' ws: wss:",
  ].join("; "),
  ...COMUNES,
};
