/**
 * Guarda resultados del juego en carpetas por participación + SQLite.
 * Estructura:
 *   data-ciber-heroes/
 *     21082026 - 1007511633/
 *       resultado.json
 *       eventos.jsonl
 *       resumen.txt
 *     ciberheroes.db
 *
 * Puntaje: 1 punto por cada pregunta correcta.
 * ronda: 1, 2, 3 o 4 (no índice 0).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = path.resolve(__dirname, "..", "data-ciber-heroes");
const DB_SCRIPT = path.resolve(__dirname, "..", "scripts", "db_ciberheroes.py");

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function folderDateStamp(d = new Date()) {
  return `${pad2(d.getDate())}${pad2(d.getMonth() + 1)}${d.getFullYear()}`;
}

export function participationFolderName(documento, when = new Date()) {
  const doc = String(documento || "").replace(/\D+/g, "");
  return `${folderDateStamp(when)} - ${doc}`;
}

export function getDataRoot() {
  return process.env.CH_DATA_DIR
    ? path.resolve(process.env.CH_DATA_DIR)
    : DEFAULT_DIR;
}

export function getSqlitePath() {
  return process.env.CH_SQLITE_PATH
    ? path.resolve(process.env.CH_SQLITE_PATH)
    : path.join(getDataRoot(), "ciberheroes.db");
}

function saveToSqlite(payload) {
  try {
    const env = { ...process.env, CH_SQLITE_PATH: getSqlitePath() };
    const r = spawnSync("python3", [DB_SCRIPT, "save"], {
      input: JSON.stringify(payload),
      encoding: "utf8",
      env,
      timeout: 8000,
    });
    if (r.status !== 0) {
      return { ok: false, error: (r.stderr || r.stdout || "sqlite error").trim() };
    }
    const out = JSON.parse((r.stdout || "{}").trim() || "{}");
    return { ok: true, id: out.id };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

function rondaUno(payload) {
  if (payload?.ronda != null) return Math.max(1, Number(payload.ronda) || 1);
  return (Number(payload?.rondaIdx) || 0) + 1;
}

/**
 * Escribe carpeta + evento SQLite. No lanza: best-effort.
 */
export function saveParticipationFolder(payload) {
  try {
    const doc = String(payload?.documento || "").replace(/\D+/g, "");
    if (!doc) return { ok: false, error: "Falta documento" };

    const started = payload?.startedAt ? new Date(payload.startedAt) : null;
    const folderWhen = started && Number.isFinite(started.getTime()) ? started : new Date();
    const when = payload?.endedAt ? new Date(payload.endedAt) : new Date();
    const stamp = Number.isFinite(when.getTime()) ? when : new Date();
    const root = getDataRoot();
    const dir = path.join(root, participationFolderName(doc, folderWhen));
    fs.mkdirSync(dir, { recursive: true });

    const ronda = rondaUno(payload);
    const evento = payload.evento || "fin";
    const startedAt = payload.startedAt || null;
    const endedAt = payload.endedAt || stamp.toISOString();
    let durationMs = Number(payload.durationMs) || 0;
    if (durationMs <= 0 && startedAt) {
      const a = Date.parse(startedAt);
      const b = Date.parse(endedAt);
      if (Number.isFinite(a) && Number.isFinite(b) && b >= a) durationMs = b - a;
    }
    const durationS = Math.max(0, Math.floor(durationMs / 1000));
    const h = Math.floor(durationS / 3600);
    const m = Math.floor((durationS % 3600) / 60);
    const s = durationS % 60;
    const parts = [];
    if (h) parts.push(h === 1 ? "1 hora" : `${h} horas`);
    if (m) parts.push(m === 1 ? "1 minuto" : `${m} minutos`);
    if (s || !parts.length) parts.push(s === 1 ? "1 segundo" : `${s} segundos`);
    const tiempo = parts.join(" ");
    const respuestasCorrectas = payload.respuestasCorrectas ?? payload.puntaje ?? 0;
    const record = {
      documento: doc,
      evento,
      puntaje: respuestasCorrectas,
      respuestasCorrectas,
      gano: !!payload.gano,
      durationMs,
      durationS,
      tiempo,
      startedAt,
      endedAt,
      resultados: Array.isArray(payload.resultados) ? payload.resultados : [],
      ronda,
      rondaIdx: ronda - 1,
      aciertosRonda: payload.aciertosRonda ?? 0,
      preguntasRonda: payload.preguntasRonda ?? payload.aciertosRonda ?? 0,
      vidasRestantes: payload.vidasRestantes ?? null,
      juego: payload.juego || "ciber-heroes-doomsday",
      guardadoEn: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(dir, "resultado.json"), JSON.stringify(record, null, 2), "utf8");
    fs.appendFileSync(path.join(dir, "eventos.jsonl"), JSON.stringify(record) + "\n", "utf8");

    const resumen = [
      `Cédula: ${doc}`,
      `Fecha: ${folderDateStamp(folderWhen)}`,
      `Último evento: ${evento}`,
      `Resultado: ${record.gano ? "GANÓ" : (evento === "ronda_ok" ? "EN CURSO" : "PERDIÓ")}`,
      `Puntaje / respuestas correctas: ${record.respuestasCorrectas}`,
      `Ronda: ${ronda} de 4`,
      `Aciertos en esta ronda: ${record.aciertosRonda}`,
      `Preguntas respondidas en esta ronda: ${record.preguntasRonda}`,
      `Rayos restantes: ${record.vidasRestantes ?? "-"}`,
      `Duración: ${record.tiempo}`,
      `Inicio: ${record.startedAt || "-"}`,
      `Fin: ${record.endedAt || "-"}`,
    ].join("\n");
    fs.writeFileSync(path.join(dir, "resumen.txt"), resumen + "\n", "utf8");

    const db = saveToSqlite(record);
    return { ok: true, dir, dbId: db.id, dbError: db.ok ? undefined : db.error };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}
