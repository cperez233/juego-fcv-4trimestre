/**
 * Un intento oficial por cédula — control LOCAL provisional (guion 8.1).
 * El control real lo hace el servidor en la Fase 5; esto solo evita repetir en el mismo navegador.
 * No se guarda la cédula: solo una huella (hash) de ella.
 */
const CLAVE = "udc:intentos";

function huella(cedula) {
  let h = 0x811c9dc5;
  for (const ch of `udc|${cedula}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "[]");
  } catch {
    return [];
  }
}

export function yaJugoLocal(cedula) {
  return leer().includes(huella(cedula));
}

export function marcarIntentoLocal(cedula) {
  try {
    const l = leer();
    const h = huella(cedula);
    if (!l.includes(h)) localStorage.setItem(CLAVE, JSON.stringify([...l, h]));
  } catch {
    /* sin almacenamiento */
  }
}
