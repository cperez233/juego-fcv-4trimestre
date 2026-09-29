/**
 * Registro de la jornada: lo que el jugador hace y si inspeccionó antes de actuar.
 * Lógica pura (sin React). Todas las funciones devuelven un registro nuevo.
 *
 * "clave" identifica la unidad medida: "E1", "E2", "3A", "3B", "E6"…
 * Los tiempos (ms) son de juego activo: no cuentan mientras la pestaña está oculta.
 */

export function crearRegistro() {
  return { llegadas: {}, aperturas: {}, inspecciones: {}, acciones: [] };
}

/** Momento en que el evento aparece (llega el correo, llega el chat…). Solo se guarda la primera vez. */
export function registrarLlegada(reg, clave, ms) {
  if (reg.llegadas[clave] != null) return reg;
  return { ...reg, llegadas: { ...reg.llegadas, [clave]: ms } };
}

/** Primera vez que el jugador abre el correo del evento. */
export function registrarApertura(reg, clave, ms) {
  if (reg.aperturas[clave] != null) return reg;
  return { ...reg, aperturas: { ...reg.aperturas, [clave]: ms } };
}

/**
 * Inspección: abrir la tarjeta de detalles del remitente ("remitente") o ver la URL real de un enlace ("enlace").
 * Se conserva la primera vez de cada tipo.
 */
export function registrarInspeccion(reg, clave, tipo, ms) {
  const previa = reg.inspecciones[clave] || {};
  if (previa[tipo] != null) return reg;
  return { ...reg, inspecciones: { ...reg.inspecciones, [clave]: { ...previa, [tipo]: ms } } };
}

// Tipos que cuentan como inspección voluntaria. "enlace_movil" (hoja que se abre sola al tocar
// un enlace en el celular) se guarda aparte y no cuenta (guion 8.6 y respuesta de Cristian).
const TIPOS_INSPECCION = ["remitente", "enlace"];

/** ¿Inspeccionó la clave antes (o en el mismo instante) de `ms`? */
export function inspeccionoAntes(reg, clave, ms) {
  const insp = reg.inspecciones[clave];
  if (!insp) return false;
  return TIPOS_INSPECCION.some((t) => insp[t] != null && insp[t] <= ms);
}

/**
 * Acción del jugador sobre un evento.
 * tDecisionMs se mide desde que vio la situación (abrió el correo, vio la página o la alerta)
 * o, si actuó sin abrirla, desde que llegó. null si no hay referencia.
 */
export function registrarAccion(reg, { clave, evento, accion, ms, horaJuego, detalle }) {
  const inicio = reg.aperturas[clave] ?? reg.llegadas[clave] ?? null;
  const entrada = {
    clave,
    evento,
    accion,
    inspecciono: inspeccionoAntes(reg, clave, ms),
    tDecisionMs: inicio == null ? null : Math.max(0, Math.round(ms - inicio)),
    horaJuego,
    ms: Math.round(ms),
    ...(detalle ? { detalle } : {}),
  };
  return { ...reg, acciones: [...reg.acciones, entrada] };
}

export function accionesDe(reg, clave) {
  return reg.acciones.filter((a) => a.clave === clave);
}
