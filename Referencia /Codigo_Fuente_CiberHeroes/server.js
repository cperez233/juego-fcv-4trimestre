import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECURITY_HEADERS } from "./security-headers.js";
import { getDataRoot, getSqlitePath, saveParticipationFolder } from "./src/save-participation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const port = Number(process.env.PORT || 5005);
const host = process.env.HOST || "0.0.0.0";

function responseHeaders(req, extra = {}) {
  const h = { ...SECURITY_HEADERS, ...extra };
  if (h["Strict-Transport-Security"] === undefined) delete h["Strict-Transport-Security"];
  const proto = req.headers["x-forwarded-proto"] || (req.socket.encrypted ? "https" : "http");
  if (proto !== "https") delete h["Strict-Transport-Security"];
  return h;
}

function wantsHttpsRedirect(req) {
  const proto = req.headers["x-forwarded-proto"];
  if (proto === "http") return true;
  return false;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".csv": "text/csv; charset=utf-8",
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent((reqPath || "/").split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
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
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    ...responseHeaders(req),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function handleScoreApi(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, responseHeaders(req));
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendJson(req, res, 405, { ok: false, error: "Método no permitido" });
    return;
  }
  try {
    const payload = await readJsonBody(req);
    const documento = String(payload?.documento || "").replace(/\D+/g, "");
    if (!documento) {
      sendJson(req, res, 400, { ok: false, error: "Falta documento" });
      return;
    }
    const saved = saveParticipationFolder({ ...payload, documento });
    if (!saved.ok) {
      sendJson(req, res, 500, { ok: false, error: saved.error || "No se pudo guardar" });
      return;
    }
    sendJson(req, res, 200, { ok: true, dir: saved.dir, dbId: saved.dbId ?? null });
  } catch (e) {
    sendJson(req, res, 400, { ok: false, error: "JSON inválido" });
  }
}

const server = http.createServer((req, res) => {
  if (wantsHttpsRedirect(req)) {
    const hostHeader = req.headers.host || "localhost";
    res.writeHead(301, { ...responseHeaders(req), Location: `https://${hostHeader}${req.url || "/"}` });
    res.end();
    return;
  }

  const reqPath = (req.url || "/").split("?")[0];

  // API de resultados → carpeta data-ciber-heroes
  if (reqPath === "/api/score" || reqPath === "/api/score.php") {
    handleScoreApi(req, res);
    return;
  }

  let filePath = safeJoin(distDir, req.url === "/" ? "/index.html" : req.url);
  if (!filePath) {
    res.writeHead(403, responseHeaders(req)).end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      filePath = path.join(distDir, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, responseHeaders(req)).end("Not found");
        return;
      }
      const isHtml = ext === ".html" || filePath.endsWith("index.html");
      const cache = isHtml
        ? { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", Pragma: "no-cache", Expires: "0" }
        : { "Cache-Control": "public, max-age=31536000, immutable" };
      res.writeHead(200, { ...responseHeaders(req), "Content-Type": type, ...cache });
      res.end(data);
    });
  });
});

server.on("error", (err) => {
  console.error("game-fcv listen error:", err);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`game-fcv escuchando en http://${host}:${port}`);
  console.log(`resultados carpetas → ${getDataRoot()}/DDMMYYYY - CEDULA/`);
  console.log(`resultados SQLite   → ${getSqlitePath()}`);
});
