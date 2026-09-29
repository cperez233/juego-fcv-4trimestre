/**
 * Servidor de "Un día cualquiera": sirve dist/ con cabeceras de seguridad y expone la API.
 * Adaptado de CiberHéroes Doomsday (server.js). Cambios:
 *  - safeJoin verifica el prefijo con separador (evita escapar a carpetas hermanas como dist-x/).
 *  - El cuerpo JSON tiene tamaño máximo.
 *  - Rutas nuevas /api/validar, /api/iniciar, /api/resultado (se implementan en la Fase 5).
 *  - data/ (cédulas y participaciones) vive fuera de dist/ y nunca se sirve.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECURITY_HEADERS } from "./security-headers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const port = Number(process.env.PORT || 5005);
const host = process.env.HOST || "0.0.0.0";
const MAX_BODY_BYTES = 64 * 1024;

function responseHeaders(req, extra = {}) {
  const h = { ...SECURITY_HEADERS, ...extra };
  const proto = req.headers["x-forwarded-proto"] || (req.socket.encrypted ? "https" : "http");
  if (proto !== "https") delete h["Strict-Transport-Security"];
  return h;
}

function wantsHttpsRedirect(req) {
  return req.headers["x-forwarded-proto"] === "http";
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".woff2": "font/woff2",
};

function safeJoin(root, reqPath) {
  let decoded;
  try {
    decoded = decodeURIComponent((reqPath || "/").split("?")[0]);
  } catch {
    return null;
  }
  const full = path.join(root, path.normalize(decoded));
  if (full !== root && !full.startsWith(root + path.sep)) return null;
  return full;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("too_large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(req, res, code, obj) {
  res.writeHead(code, {
    ...responseHeaders(req),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(obj));
}

// Fase 5: validar cédula contra data/cedulas.csv, marcar inicio y guardar resultado.
const API_ROUTES = new Set(["/api/validar", "/api/iniciar", "/api/resultado"]);

async function handleApi(req, res, route) {
  if (req.method !== "POST") {
    sendJson(req, res, 405, { ok: false, error: "Método no permitido" });
    return;
  }
  try {
    await readJsonBody(req);
  } catch (e) {
    sendJson(req, res, e?.message === "too_large" ? 413 : 400, { ok: false, error: "Solicitud inválida" });
    return;
  }
  sendJson(req, res, 501, { ok: false, error: `${route} aún no está implementado` });
}

const server = http.createServer((req, res) => {
  if (wantsHttpsRedirect(req)) {
    const hostHeader = req.headers.host || "localhost";
    res.writeHead(301, { ...responseHeaders(req), Location: `https://${hostHeader}${req.url || "/"}` });
    res.end();
    return;
  }

  const reqPath = (req.url || "/").split("?")[0];

  if (API_ROUTES.has(reqPath)) {
    handleApi(req, res, reqPath);
    return;
  }
  if (reqPath.startsWith("/api/")) {
    sendJson(req, res, 404, { ok: false, error: "No encontrado" });
    return;
  }

  let filePath = safeJoin(distDir, reqPath === "/" ? "/index.html" : reqPath);
  if (!filePath) {
    res.writeHead(403, responseHeaders(req)).end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) filePath = path.join(distDir, "index.html");

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, responseHeaders(req)).end("Not found");
        return;
      }
      const cache =
        ext === ".html"
          ? { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", Pragma: "no-cache", Expires: "0" }
          : { "Cache-Control": "public, max-age=31536000, immutable" };
      res.writeHead(200, { ...responseHeaders(req), "Content-Type": type, ...cache });
      res.end(data);
    });
  });
});

server.on("error", (err) => {
  console.error("un-dia-cualquiera: error al escuchar:", err);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`un-dia-cualquiera escuchando en http://${host}:${port}`);
});
