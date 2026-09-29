/**
 * Banderas y etiquetas 🏷 (guion, sección 4). Lógica pura.
 */
import { etiquetasPorGravedad } from "../data/eventos.js";
import { config } from "../data/config.js";

const PRISA_EVENTOS = { E1: true, E5: true };

/** Etiquetas de error de toda la jornada, de la más grave a la menos grave. */
export function etiquetas(evaluacion) {
  const todas = new Set();
  for (const e of Object.values(evaluacion.eventos)) {
    if (e.etiqueta) todas.add(e.etiqueta);
    for (const t of e.etiquetas || []) todas.add(t);
  }
  return etiquetasPorGravedad.filter((t) => todas.has(t));
}

export function etiquetaMasGrave(evaluacion) {
  return etiquetas(evaluacion)[0] || null;
}

/**
 * @param evaluacion resultado de evaluarJornada
 * @param reg registro (para los tiempos de decisión de PRISA)
 * @param umbralMs config.prisaUmbralMs
 */
export function calcularBanderas(evaluacion, reg, umbralMs) {
  const b = { ERR: false, ALERTA: false, FP: false, REPORTO: false, PRISA: false, PASIVO: false };
  b.ERR = etiquetas(evaluacion).length > 0;
  // Guion 18.3: sin caer en nada, pero dejando pasar la mayoría (menos de la mitad del máximo).
  b.PASIVO = (evaluacion.puntajeCrudo ?? 0) < config.puntajeMaximo * config.umbralPasivo;
  for (const e of Object.values(evaluacion.eventos)) {
    for (const f of e.banderas || []) if (f in b) b[f] = true;
  }
  // PRISA: error en E1 o E5 decidido en menos del umbral.
  for (const [id, e] of Object.entries(evaluacion.eventos)) {
    if (!PRISA_EVENTOS[id] || e.puntos >= 0) continue;
    const errores = ["escribir_credenciales", "clic_enlace", "responder", "descargar_programa", "instalar_extension"];
    const decision = reg.acciones.find((a) => a.clave === id && errores.includes(a.accion));
    if (decision && decision.tDecisionMs != null && decision.tDecisionMs < umbralMs) b.PRISA = true;
  }
  return b;
}
