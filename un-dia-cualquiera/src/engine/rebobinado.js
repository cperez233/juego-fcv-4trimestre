/**
 * Selección de tarjetas de "Después del clic" y cadena de dominó (guion P6). Lógica pura.
 * Todos los errores + máx. 3 aciertos de seguridad, en orden cronológico inverso.
 */
import { eventoPorId, pendientes as PENDIENTES } from "../data/eventos.js";

// Guion 10.3: todos los errores (también distracciones y pendientes tarde o sin hacer) + los aciertos más importantes.
export const MAX_ACIERTOS = 3;

function esError(e) {
  return e.puntos < 0 || (e.banderas || []).includes("FP");
}

function esAciertoDeSeguridad(e) {
  if (e.id === "E7") return true;
  const naturaleza = eventoPorId[e.id]?.naturaleza;
  if (naturaleza !== "trampa" && naturaleza !== "mixto") return false;
  // En los eventos mixtos, la parte legítima (leer el correo real, responder la encuesta) es productividad.
  return !/^(3B_|14A_)/.test(e.accion);
}

export function seleccionarTarjetas(evaluacion) {
  const lista = Object.entries(evaluacion.eventos)
    .filter(([, e]) => e.accion !== "no_llego")
    // El correo falso de E14 (parte 14B) llega aparte, con su propia hora (guion 21).
    .map(([id, e]) => ({ id, ...e, hora: (id === "E14" && /^14B_/.test(e.accion) ? eventoPorId.E14B?.hora : eventoPorId[id]?.hora) ?? e.horaJuego ?? "12:15", error: esError(e) }));
  const errores = lista.filter((e) => e.error);
  // Guion 11.4: los aciertos que se muestran son de seguridad (trampas que esquivó y su reacción), no de productividad.
  const aciertos = lista
    .filter((e) => !e.error && e.puntos > 0 && esAciertoDeSeguridad(e))
    .sort((a, b) => (b.id === "E7") - (a.id === "E7") || b.puntos - a.puntos || (a.hora < b.hora ? 1 : -1))
    .slice(0, MAX_ACIERTOS);
  // Cada distracción es un error con su hora (le quitó tiempo y productividad).
  const distracciones = (evaluacion.distraccionesLista || []).map((d) => ({
    id: `D_${d.sitio}`,
    tipo: "distraccion",
    sitio: d.sitio,
    hora: d.horaJuego || "08:00",
    puntos: -1,
    error: true,
  }));
  // Pendientes hechos después de su hora límite.
  const estado = evaluacion.pendientesEstado || {};
  const tarde = PENDIENTES.filter((p) => estado[p.id] === "tarde").map((p) => ({ id: `P_${p.id}`, tipo: "tarde", pendiente: p, hora: p.limite, puntos: 0, error: true }));
  const cronologicas = [...errores, ...distracciones, ...tarde, ...aciertos].sort((a, b) => (a.hora < b.hora ? 1 : -1));
  // Al final, los pendientes que no se hicieron (explica el resto de la productividad perdida).
  const sinHacer = PENDIENTES.filter((p) => !estado[p.id]);
  return sinHacer.length ? [...cronologicas, { id: "P_sin", tipo: "sinHacer", lista: sinHacer, hora: "13:00", puntos: -sinHacer.length, error: true }] : cronologicas;
}

/**
 * Cadena de dominó: parte de la etiqueta más grave. Si reportó en 7A, la cadena se corta.
 * Devuelve { pasos: [...], cortada: bool, tReaccionMs }.
 */
export function cadenaDomino(evaluacion, etiquetaMasGrave, cadenas) {
  const e7 = evaluacion.eventos.E7;
  if (!etiquetaMasGrave) return null;
  const base = cadenas[etiquetaMasGrave];
  const cortada = (e7.banderas || []).includes("REPORTO");
  return { pasos: base, cortada, tReaccionMs: e7.tReaccionMs ?? null, etiqueta: etiquetaMasGrave };
}
