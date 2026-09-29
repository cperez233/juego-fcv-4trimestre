/**
 * Sonidos suaves generados con Web Audio (sin archivos). Nada crítico depende del audio.
 * La preferencia de silencio se guarda en el navegador (comodidad por persona).
 */
const CLAVE = "udc:sonido";
let ctx = null;

export function sonidoActivo() {
  try {
    return localStorage.getItem(CLAVE) !== "0";
  } catch {
    return true;
  }
}

export function guardarSonido(activo) {
  try {
    localStorage.setItem(CLAVE, activo ? "1" : "0");
  } catch {
    /* sin almacenamiento: solo dura esta sesión */
  }
}

const NOTAS = {
  correo: [[660, 0], [880, 0.09]],
  chat: [[740, 0], [990, 0.07]],
  ok: [[523, 0], [659, 0.08], [784, 0.16]],
  alerta: [[440, 0], [330, 0.14], [440, 0.28], [330, 0.42]],
  adelanto: [[392, 0], [523, 0.06]],
  // Rebobinado: la cinta corre y frena con un "clac" (guion 9.8).
  cinta: [[1200, 0], [1100, 0.05], [1000, 0.1], [900, 0.15], [800, 0.2], [700, 0.26], [600, 0.33], [500, 0.42]],
  stop: [[140, 0], [70, 0.035]],
};

const FORMA = { alerta: "square", stop: "square", cinta: "sawtooth" };
const VOLUMEN = { alerta: 0.03, stop: 0.09, cinta: 0.012 };

export function sonar(tipo) {
  if (!sonidoActivo() || !NOTAS[tipo]) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = ctx.currentTime;
    for (const [f, d] of NOTAS[tipo]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = FORMA[tipo] || "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + d);
      g.gain.exponentialRampToValueAtTime(VOLUMEN[tipo] || 0.06, t0 + d + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(t0 + d);
      o.stop(t0 + d + 0.18);
    }
  } catch {
    /* sin audio */
  }
}
