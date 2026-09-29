/**
 * Cabeceras de seguridad HTTP (CSP, anti-clickjacking, cache).
 * El juego inyecta CSS con <style>{CSS}</style> → hace falta style-src(-elem) 'unsafe-inline'.
 */
const CSP_BASE = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
].join("; ");

const CSP_PROD = [
  CSP_BASE,
  "script-src 'self'",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
].join("; ");

/** Producción / preview (puerto 5005) */
export const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP_PROD,
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/** Dev (Vite HMR necesita eval + websocket) */
export const DEV_SECURITY_HEADERS = {
  "Content-Security-Policy": [
    CSP_BASE,
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "connect-src 'self' ws: wss: https://fonts.googleapis.com https://fonts.gstatic.com",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export const CSP_HTACCESS = CSP_PROD;
