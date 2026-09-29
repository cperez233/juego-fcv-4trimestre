/**
 * Sesión local (localStorage) + sync best-effort con /api/*
 * Clave: ch-sesion:{documento}
 */

const JUEGO = "ciber-heroes-doomsday";
const VIDAS_INICIAL = 3;
const PART_KEY = "ch-participados";
const keyFor = (doc) => `ch-sesion:${String(doc || "").trim()}`;

const nowIso = () => new Date().toISOString();

export function loadSession(documento) {
  const id = String(documento || "").trim();
  if (!id) return null;
  try {
    const raw = localStorage.getItem(keyFor(id));
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || s.documento !== id) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveSession(partial) {
  const id = String(partial?.documento || "").trim();
  if (!id) return null;
  const prev = loadSession(id) || {};
  const next = {
    documento: id,
    juego: JUEGO,
    pantalla: partial.pantalla ?? prev.pantalla ?? "intro",
    rondaIdx: partial.rondaIdx ?? prev.rondaIdx ?? 0,
    resultados: partial.resultados ?? prev.resultados ?? [],
    puntaje: partial.puntaje ?? prev.puntaje ?? 0,
    vidasRestantes: partial.vidasRestantes ?? prev.vidasRestantes ?? VIDAS_INICIAL,
    startedAt: partial.startedAt ?? prev.startedAt ?? null,
    updatedAt: nowIso(),
    estado: partial.estado ?? prev.estado ?? "en_curso",
    gano: partial.gano ?? prev.gano ?? null,
  };
  try {
    localStorage.setItem(keyFor(id), JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
  syncSesionApi(next);
  return next;
}

export function clearSession(documento) {
  const id = String(documento || "").trim();
  if (!id) return;
  try {
    localStorage.removeItem(keyFor(id));
  } catch {
    /* ignore */
  }
}

export function closeSession(documento, extra = {}) {
  const id = String(documento || "").trim();
  if (!id) return null;
  return saveSession({
    documento: id,
    ...extra,
    estado: "cerrada",
  });
}

export function hasOpenSession(documento) {
  const s = loadSession(documento);
  return canResumeSession(s);
}

/** Solo reanudar si la partida sigue en curso (cierre de pestaña / congelamiento), no tras derrota. */
export function canResumeSession(s) {
  if (!s || s.estado !== "en_curso") return false;
  if (s.pantalla === "resultado" || s.gano === false) return false;
  return true;
}

export function hasParticipated(documento) {
  const id = String(documento || "").trim();
  if (!id) return false;
  try {
    const raw = localStorage.getItem(PART_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) && list.includes(id);
  } catch {
    return false;
  }
}

export function markParticipated(documento) {
  const id = String(documento || "").trim();
  if (!id) return;
  try {
    const raw = localStorage.getItem(PART_KEY);
    let list = [];
    try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
    const set = new Set(Array.isArray(list) ? list : []);
    set.add(id);
    localStorage.setItem(PART_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
  saveSession({ documento: id, pantalla: "resultado", estado: "participado" });
}

export { JUEGO, VIDAS_INICIAL };

export function durationMsFrom(startedAt, endedAt = nowIso()) {
  if (!startedAt) return 0;
  const a = Date.parse(startedAt);
  const b = Date.parse(endedAt);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return 0;
  return b - a;
}

/** Segundos enteros y texto en español: 120 → "2 minutos". */
export function formatDuration(ms) {
  const durationS = Math.max(0, Math.floor(Number(ms) / 1000) || 0);
  const h = Math.floor(durationS / 3600);
  const m = Math.floor((durationS % 3600) / 60);
  const s = durationS % 60;
  const parts = [];
  if (h) parts.push(h === 1 ? "1 hora" : `${h} horas`);
  if (m) parts.push(m === 1 ? "1 minuto" : `${m} minutos`);
  if (s || !parts.length) parts.push(s === 1 ? "1 segundo" : `${s} segundos`);
  return { durationS, tiempo: parts.join(" ") };
}

async function postJson(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await r.json();
  } catch {
    data = null;
  }
  return { ok: r.ok, status: r.status, data };
}

/** Sync best-effort; nunca bloquea el juego si falla. */
function syncSesionApi(session) {
  postJson("/api/sesion.php", session).catch(() => {});
}

/**
 * Valida documento: intenta API PHP; si no hay backend, usa allow-list CSV del cliente.
 * @param {string} documento
 * @param {{ checkLocal: (id: string) => Promise<boolean> }} opts
 */
export async function validarDocumento(documento, { checkLocal } = {}) {
  const id = String(documento || "").trim();
  if (hasParticipated(id)) {
    return {
      ok: false,
      error: "Ya se participó en el juego con esta cédula. Ya no puede volver a participar.",
    };
  }
  try {
    const { ok, data } = await postJson("/api/validar.php", { documento: id });
    if (ok && data?.ok) {
      const local = loadSession(id);
      const remote = data.sesion || null;
      // Preferir la más reciente entre local y remota
      let sesion = remote || local;
      if (remote && local) {
        const rt = Date.parse(remote.updatedAt || remote.startedAt || 0) || 0;
        const lt = Date.parse(local.updatedAt || local.startedAt || 0) || 0;
        sesion = lt >= rt ? local : remote;
      }
      return { ok: true, sesion };
    }
    if (data?.error) {
      return { ok: false, error: data.error };
    }
    // API respondió pero sin ok claro → caer a local
  } catch {
    /* sin backend */
  }

  if (typeof checkLocal === "function") {
    const allowed = await checkLocal(id);
    if (!allowed) {
      return { ok: false, error: "Esta identificación no está autorizada para jugar." };
    }
  }
  if (hasParticipated(id)) {
    return {
      ok: false,
      error: "Ya se participó en el juego con esta cédula. Ya no puede volver a participar.",
    };
  }
  return { ok: true, sesion: loadSession(id) };
}

/**
 * Envía score final al servidor (y remoto vía PHP si está configurado).
 */
export async function enviarScore(payload) {
  const body = {
    juego: JUEGO,
    ...payload,
  };
  // Preferir endpoint Node (/api/score); caer a PHP si existe
  try {
    const r = await postJson("/api/score", body);
    if (r.ok) return;
  } catch {
    /* seguir */
  }
  try {
    await postJson("/api/score.php", body);
  } catch {
    /* silencio */
  }
}

