/**
 * Puntaje por evento a partir del registro. Lógica pura.
 * Reglas: docs/02_GUION.md, secciones 3, 4, 8.6 y 9.
 *
 * Cada evaluador recibe la lista cronológica de acciones de su clave y devuelve
 * { puntos, accion, etiqueta?, banderas[], recupero?, ms? }.
 * "accion" es la acción que decide el puntaje (la que se muestra en el rebobinado).
 */
import { accionesDe } from "./registro.js";
import { pendientes as PENDIENTES } from "../data/eventos.js";
import { config } from "../data/config.js";

const nombres = (lista) => lista.map((a) => a.accion);
const primera = (lista, nombre) => lista.find((a) => a.accion === nombre);
const indice = (lista, nombre) => lista.findIndex((a) => a.accion === nombre);

function resultado(puntos, accion, lista, extra = {}) {
  const a = accion ? primera(lista, accion) : null;
  return { puntos, accion, ms: a?.ms ?? null, horaJuego: a?.horaJuego ?? null, banderas: [], ...extra };
}

/** Recupera +1 si reenvió a Seguridad después del error (guion 8.6). */
function conRecuperacion(res, lista, accionError, accionReporte) {
  const iErr = indice(lista, accionError);
  const iRep = lista.findIndex((a, i) => i > iErr && a.accion === accionReporte);
  return iErr >= 0 && iRep > iErr ? { ...res, puntos: res.puntos + 1, recupero: true } : res;
}

export function evaluarE1(lista) {
  const a = nombres(lista);
  let res = null;
  let error = null;
  if (a.includes("escribir_credenciales")) {
    error = "escribir_credenciales";
    res = resultado(-4, error, lista, { etiqueta: "CREDENCIALES" });
  } else if (a.includes("clic_enlace")) {
    error = "clic_enlace";
    const cerro = a.includes("cerrar_sin_escribir");
    res = resultado(cerro ? -1 : -2, cerro ? "cerrar_sin_escribir" : "clic_enlace", lista);
  } else if (a.includes("responder")) {
    error = "responder";
    res = resultado(-1, "responder", lista);
  }
  if (res) return conRecuperacion(res, lista, error, "reportar");
  if (a.includes("reportar")) return resultado(3, "reportar", lista);
  if (a.includes("spam")) return resultado(1, "spam", lista);
  if (a.includes("eliminar")) return resultado(1, "eliminar", lista);
  return resultado(0, "ignorar", lista);
}

export function evaluarE2(lista) {
  const a = nombres(lista);
  if (a.includes("reportar")) return resultado(-1, "reportar", lista, { banderas: ["FP"] });
  if (a.includes("spam")) return resultado(-1, "spam", lista, { banderas: ["FP"] });
  if (a.includes("abrir_adjunto") && a.includes("responder")) {
    const r = resultado(2, "abrir_adjunto_y_responder", lista);
    return { ...r, ms: Math.max(primera(lista, "abrir_adjunto").ms, primera(lista, "responder").ms) };
  }
  return resultado(0, "no_abrir", lista);
}

export function evaluar3A(lista) {
  const a = nombres(lista);
  if (a.includes("3A_abrir_adjunto")) {
    return conRecuperacion(resultado(-3, "3A_abrir_adjunto", lista, { etiqueta: "MALWARE" }), lista, "3A_abrir_adjunto", "3A_reportar");
  }
  if (a.includes("3A_reportar")) return resultado(2, "3A_reportar", lista);
  if (a.includes("3A_eliminar")) return resultado(1, "3A_eliminar", lista);
  return resultado(0, "3A_ignorar", lista);
}

/** 3B: leerlo cuenta (apertura registrada). */
export function evaluar3B(lista, abierto) {
  const a = nombres(lista);
  if (a.includes("3B_reportar")) return resultado(-1, "3B_reportar", lista, { banderas: ["FP"] });
  if (a.includes("3B_no_es_spam")) return resultado(1, "3B_no_es_spam", lista);
  if (a.includes("3B_eliminar")) return resultado(0, "3B_eliminar", lista);
  if (abierto != null) return { puntos: 1, accion: "3B_leer", ms: abierto, banderas: [] };
  return resultado(0, "3B_ignorar", lista);
}

export function evaluarE3(l3A, l3B, abierto3B) {
  const a = evaluar3A(l3A);
  const b = evaluar3B(l3B, abierto3B);
  return {
    puntos: a.puntos + b.puntos,
    accion: a.puntos < 0 || (a.puntos >= b.puntos && b.puntos >= 0) ? a.accion : b.accion,
    ms: a.ms ?? b.ms,
    etiqueta: a.etiqueta,
    banderas: [...a.banderas, ...b.banderas],
    partes: { "3A": a, "3B": b },
  };
}

export function evaluarE4(lista) {
  const a = nombres(lista);
  const extra = a.includes("advertir_julian") ? 1 : 0;
  let res;
  if (a.includes("llenar_formulario")) res = resultado(-3, "llenar_formulario", lista, { etiqueta: "CREDENCIALES_BANCO" });
  else if (a.includes("intranet")) res = resultado(3, "cerrar_y_intranet", lista, { ms: primera(lista, "intranet").ms });
  else if (a.includes("cerrar")) res = resultado(1, "cerrar", lista);
  else res = resultado(0, "ignorar", lista);
  return extra ? { ...res, puntos: res.puntos + extra, advirtio: true } : res;
}

// Total del evento 5 según lo que hizo en 5B.
const TOTAL_5B = { permitir: -4, cerrar_x: -3, cuarentena: 0 };

export function evaluarE5(lista) {
  const a = nombres(lista);
  const candidatos = [];
  if (a.includes("descargar_programa")) {
    let r;
    if (a.includes("permitir")) r = resultado(TOTAL_5B.permitir, "permitir", lista, { etiqueta: "MALWARE" });
    else if (a.includes("cerrar_x")) r = resultado(TOTAL_5B.cerrar_x, "cerrar_x", lista, { etiqueta: "MALWARE", banderas: ["ALERTA"] });
    else if (a.includes("cuarentena")) {
      const info = indice(lista, "mas_info");
      const cuar = indice(lista, "cuarentena");
      r = info >= 0 && info < cuar ? resultado(1, "mas_info_cuarentena", lista, { ms: lista[cuar].ms }) : resultado(0, "cuarentena", lista);
    } else r = resultado(-2, "descargar_programa", lista);
    candidatos.push(r);
  }
  if (a.includes("instalar_extension")) candidatos.push(resultado(-2, "instalar_extension", lista, { etiqueta: "EXTENSION" }));
  if (candidatos.length) {
    // Vale la más riesgosa. Si hubo dos etiquetas, se conservan las dos.
    candidatos.sort((x, y) => x.puntos - y.puntos);
    const peor = candidatos[0];
    const etiquetas = candidatos.map((c) => c.etiqueta).filter(Boolean);
    return { ...peor, etiquetas, banderas: [...new Set(candidatos.flatMap((c) => c.banderas))] };
  }
  if (a.includes("enviar_pdf")) return resultado(3, "guardar_pdf_y_enviar", lista, { ms: primera(lista, "enviar_pdf").ms });
  if (a.includes("mesa_ayuda")) return resultado(2, "mesa_ayuda", lista);
  return resultado(0, "ignorar", lista);
}

export function evaluarE6(lista) {
  const a = nombres(lista);
  if (a.includes("continuar")) {
    if (a.includes("permitir")) return resultado(-3, "continuar_permitir", lista, { etiqueta: "PERMISOS", banderas: ["ALERTA"], ms: primera(lista, "permitir").ms });
    return resultado(0, "continuar_bloquear", lista, { banderas: ["ALERTA"], ms: primera(lista, "continuar").ms });
  }
  if (a.includes("volver")) {
    const iV = indice(lista, "volver");
    const respondio = lista.some((x, i) => i > iV && x.accion === "responder");
    // Guion 14.3: volver ya es lo correcto (+3). Escribirle al proveedor no suma aparte; solo cambia la tarjeta.
    return respondio ? resultado(3, "volver_y_responder", lista, { ms: lista.find((x, i) => i > iV && x.accion === "responder").ms }) : resultado(3, "volver", lista);
  }
  if (a.includes("responder")) return resultado(3, "responder_sin_abrir", lista);
  return resultado(0, "ignorar", lista);
}

const PUNTOS_7A = { desconectar_y_reportar: 5, reportar: 4, mesa_ayuda: 3, contar_companero: 0, desconectar: 0, reiniciar: -2, nada: -4 };
const PUNTOS_7B = { reportar: 5, cambiar_clave: 1, andrea: 0, tranquilo: -2, sin_respuesta: 0 };

export function evaluarE7(lista) {
  const a = nombres(lista);
  const version = a.includes("inicio_B") ? "B" : a.includes("inicio_A") ? "A" : null;
  if (version === "B") {
    const r = lista.find((x) => x.accion.startsWith("respuesta_"));
    const clave = r ? r.accion.replace("respuesta_", "") : "sin_respuesta";
    return { puntos: PUNTOS_7B[clave], accion: clave, version, ms: r?.ms ?? null, banderas: [], tReaccionMs: r?.tDecisionMs ?? null };
  }
  if (version === "A") {
    const final = lista.find((x) => ["reportar", "mesa_ayuda", "contar_companero", "reiniciar", "nada"].includes(x.accion));
    const desconecto = a.includes("desconectar");
    let clave = final ? final.accion : desconecto ? "desconectar" : "nada";
    if (clave === "reportar" && desconecto) clave = "desconectar_y_reportar";
    const reporto = ["desconectar_y_reportar", "reportar", "mesa_ayuda"].includes(clave);
    return {
      puntos: PUNTOS_7A[clave],
      accion: clave,
      version,
      ms: final?.ms ?? null,
      banderas: reporto ? ["REPORTO"] : [],
      tReaccionMs: reporto ? final.tDecisionMs : null,
      canal: final?.detalle?.canal,
    };
  }
  return { puntos: 0, accion: "no_llego", version: null, ms: null, banderas: [] };
}

// ───── Eventos v5 (guion 9.4) ─────

// Descargas desde un anuncio o una página dudosa (E9, E13, EX): la protección del equipo decide.
const TOTAL_DESCARGA = { permitir: -4, cerrar_x: -3, cuarentena: -1, mas_info_cuarentena: 0 };

/** null si no descargó nada; si descargó, el resultado según lo que hizo en la protección del equipo. */
function evaluarDescarga(lista) {
  const a = nombres(lista);
  if (!a.includes("descargar")) return null;
  if (a.includes("permitir")) return resultado(TOTAL_DESCARGA.permitir, "permitir", lista, { etiqueta: "MALWARE" });
  if (a.includes("cerrar_x")) return resultado(TOTAL_DESCARGA.cerrar_x, "cerrar_x", lista, { etiqueta: "MALWARE", banderas: ["ALERTA"] });
  if (a.includes("cuarentena")) {
    const info = indice(lista, "mas_info");
    const cuar = indice(lista, "cuarentena");
    return info >= 0 && info < cuar
      ? resultado(TOTAL_DESCARGA.mas_info_cuarentena, "mas_info_cuarentena", lista, { ms: lista[cuar].ms, horaJuego: lista[cuar].horaJuego })
      : resultado(TOTAL_DESCARGA.cuarentena, "cuarentena", lista);
  }
  return resultado(-2, "descargar", lista);
}

/** E8 — capacitación (legítimo). */
export function evaluarE8(lista) {
  const a = nombres(lista);
  if (a.includes("reportar")) return resultado(-1, "reportar", lista, { banderas: ["FP"] });
  if (a.includes("spam")) return resultado(-1, "spam", lista, { banderas: ["FP"] });
  if (a.includes("inscribirse")) return resultado(2, "inscribirse", lista);
  if (a.includes("eliminar")) return resultado(0, "eliminar", lista);
  return resultado(0, "ignorar", lista);
}

/** E9 — video del grupo: no abrirlo +1; la "actualización del reproductor" decide si hubo daño. */
export function evaluarE9(lista) {
  const d = evaluarDescarga(lista);
  if (d) return d;
  if (nombres(lista).includes("abrir_video")) return resultado(0, "abrir_video", lista);
  return resultado(1, "no_abrir", lista);
}

/** E10 — Julián pide tu clave. */
export function evaluarE10(lista) {
  const a = nombres(lista);
  if (a.includes("dar_clave")) return resultado(-3, "dar_clave", lista, { etiqueta: "CREDENCIALES" });
  if (a.includes("prestar_sesion")) return resultado(-1, "prestar_sesion", lista);
  if (a.includes("mesa")) return resultado(3, "mesa", lista);
  if (a.includes("negar")) return resultado(1, "negar", lista);
  return resultado(0, "sin_respuesta", lista);
}

/** E11 — impresora: solo pendiente (sin puntos de seguridad). */
export function evaluarE11(lista) {
  return nombres(lista).includes("caso_impresora") ? resultado(0, "caso_impresora", lista) : resultado(0, "ignorar", lista);
}

/** E12 — "Andrea" desde un número nuevo. */
export function evaluarE12(lista) {
  const a = nombres(lista);
  if (a.includes("enviar_codigos")) return conRecuperacion(resultado(-3, "enviar_codigos", lista, { etiqueta: "FRAUDE" }), lista, "enviar_codigos", "reportar");
  if (a.includes("comprar")) return conRecuperacion(resultado(-1, "comprar", lista), lista, "comprar", "reportar");
  if (a.includes("reportar") && a.includes("verificar_andrea")) {
    const r = resultado(3, "reportar_y_verificar", lista);
    const rep = primera(lista, "reportar");
    return { ...r, ms: rep.ms, horaJuego: rep.horaJuego };
  }
  if (a.includes("reportar")) return resultado(3, "reportar", lista);
  if (a.includes("verificar_andrea")) return resultado(2, "verificar_andrea", lista);
  if (a.includes("bloquear")) return resultado(1, "bloquear", lista);
  return resultado(0, "ignorar", lista);
}

/** E13 — solicitud de vacaciones: vale la más riesgosa. */
export function evaluarE13(lista) {
  const d = evaluarDescarga(lista);
  if (d) return d;
  if (nombres(lista).includes("intranet")) return resultado(2, "intranet", lista);
  return resultado(0, "ignorar", lista);
}

/** EX — trampas de la navegación libre (noticias, tienda). Máximo 0; vale la más riesgosa. */
export function evaluarEX(lista) {
  const a = nombres(lista);
  const candidatos = [];
  const d = evaluarDescarga(lista);
  if (d) candidatos.push(d);
  if (a.includes("llamar")) candidatos.push(resultado(-2, "llamar", lista));
  if (a.includes("cupon_tarjeta")) candidatos.push(resultado(-3, "cupon_tarjeta", lista, { etiqueta: "FRAUDE" }));
  if (!candidatos.length) return resultado(0, "no_llego", lista);
  candidatos.sort((x, y) => x.puntos - y.puntos);
  const etiquetas = candidatos.map((c) => c.etiqueta).filter(Boolean);
  return { ...candidatos[0], etiquetas, banderas: [...new Set(candidatos.flatMap((c) => c.banderas))] };
}

/** 14A — encuesta real de Mesa de Ayuda (legítimo). */
export function evaluar14A(lista) {
  const a = nombres(lista);
  if (a.includes("14A_reportar")) return resultado(-1, "14A_reportar", lista, { banderas: ["FP"] });
  if (a.includes("14A_spam")) return resultado(-1, "14A_spam", lista, { banderas: ["FP"] });
  if (a.includes("14A_encuesta")) return resultado(1, "14A_encuesta", lista);
  return resultado(0, "14A_ignorar", lista);
}

/** 14B — "buzón lleno" falso: mismas reglas que E1 con valores de guion 10.1. */
export function evaluar14B(lista) {
  const a = nombres(lista);
  let res = null;
  let error = null;
  if (a.includes("14B_escribir_credenciales")) {
    error = "14B_escribir_credenciales";
    res = resultado(-3, error, lista, { etiqueta: "CREDENCIALES" });
  } else if (a.includes("14B_clic_enlace")) {
    error = "14B_clic_enlace";
    const cerro = a.includes("14B_cerrar_sin_escribir");
    res = resultado(cerro ? -1 : -2, cerro ? "14B_cerrar_sin_escribir" : "14B_clic_enlace", lista);
  } else if (a.includes("14B_responder")) {
    error = "14B_responder";
    res = resultado(-1, error, lista);
  }
  if (res) return conRecuperacion(res, lista, error, "14B_reportar");
  if (a.includes("14B_reportar")) return resultado(2, "14B_reportar", lista);
  if (a.includes("14B_spam")) return resultado(1, "14B_spam", lista);
  if (a.includes("14B_eliminar")) return resultado(1, "14B_eliminar", lista);
  return resultado(0, "14B_ignorar", lista);
}

/** E14 — los dos correos de "Mesa de Ayuda". La tarjeta la decide el error, si hubo; si no, el mejor acierto. */
export function evaluarE14(l14A, l14B) {
  const a = evaluar14A(l14A);
  const b = evaluar14B(l14B);
  const conError = [b, a].find((x) => x.puntos < 0 || x.banderas.includes("FP"));
  const decide = conError || (b.puntos >= a.puntos ? b : a);
  return {
    puntos: a.puntos + b.puntos,
    accion: decide.accion,
    ms: decide.ms,
    horaJuego: decide.horaJuego,
    etiqueta: b.etiqueta,
    banderas: [...a.banderas, ...b.banderas],
    partes: { "14A": a, "14B": b },
  };
}

// ───── Eventos v5.6 (guion 15.2) ─────

/** E15 — tarea (reservar la sala): solo pendiente, sin puntos de seguridad. */
export function evaluarTarea(lista, accionHecha) {
  return nombres(lista).includes(accionHecha) ? resultado(0, accionHecha, lista) : resultado(0, "ignorar", lista);
}

/** E16 — "soporte técnico" falso por chat. Vale lo más riesgoso; reportar después de instalar recupera +1. */
export function evaluarE16(lista) {
  const a = nombres(lista);
  const d = evaluarDescarga(lista);
  if (d) return conRecuperacion(d, lista, d.accion, "reportar");
  if (a.includes("reportar")) return resultado(3, "reportar", lista);
  if (a.includes("verificar")) return resultado(2, "verificar", lista);
  if (a.includes("negar")) return resultado(1, "negar", lista);
  if (a.includes("bloquear")) return resultado(1, "bloquear", lista);
  if (a.includes("aceptar")) return resultado(0, "aceptar", lista);
  return resultado(0, "ignorar", lista);
}

/**
 * E17 — pestaña que se abre sola con una "actualización" del navegador. Cerrarla sin descargar +2.
 * Si nunca la vio (no volvió a usar el navegador), no pierde nada: +2, "no_llego".
 */
export function evaluarE17(lista, vista) {
  const d = evaluarDescarga(lista);
  if (d) return d;
  if (nombres(lista).includes("cerrar")) return resultado(2, "cerrar", lista);
  if (vista == null) return { puntos: 2, accion: "no_llego", ms: null, banderas: [] };
  return resultado(0, "ignorar", lista);
}

/** Distracciones de la jornada: primera visita a cada sitio, con su hora (guion 10.3). */
export function listaDistracciones(reg) {
  const vistos = new Map();
  for (const a of accionesDe(reg, "EX")) {
    if (!a.accion.startsWith("distraccion_")) continue;
    const sitio = a.accion.replace("distraccion_", "");
    if (!vistos.has(sitio)) vistos.set(sitio, { sitio, horaJuego: a.horaJuego });
  }
  return [...vistos.values()].slice(0, config.distraccionesMax);
}

/** E7J — Julián escribe durante el incidente (7A). No suma; solo puede restar (guion 9.6). */
export function evaluarE7J(lista) {
  if (!lista.length) return { puntos: 0, accion: "no_llego", ms: null, banderas: [] };
  const r = lista.find((x) => x.accion.startsWith("respuesta_"));
  const clave = r ? r.accion.replace("respuesta_", "") : "sin_respuesta";
  return { puntos: clave === "tranquilo" ? -2 : 0, accion: clave, ms: r?.ms ?? null, horaJuego: r?.horaJuego ?? null, banderas: [] };
}

/** Distracciones: sitios distintos visitados (videos, noticias, tienda), máximo config.distraccionesMax. */
export function contarDistracciones(reg) {
  const sitios = new Set(accionesDe(reg, "EX").filter((a) => a.accion.startsWith("distraccion_")).map((a) => a.accion));
  return Math.min(config.distraccionesMax, sitios.size);
}

/** Acción que completa cada pendiente (la primera que lo cumple). null si todavía no. */
function accionQueCumple(reg, id) {
  const de = (clave, accion) => accionesDe(reg, clave).find((a) => a.accion === accion) || null;
  switch (id) {
    case "beneficios":
      return de("E4", "intranet");
    case "informe":
      return de("E5", "enviar_pdf");
    case "capacitacion":
      return de("E8", "inscribirse");
    case "impresora":
      return de("E11", "caso_impresora");
    case "vacaciones":
      return de("E13", "intranet");
    case "reservar":
      return de("E15", "reservar");
    case "spam": {
      // Guion 11.2 y 20.1: "revisar" es revisar. Basta con abrir la carpeta y revisar (abrir o actuar sobre) los dos correos.
      const revisado = (clave) => reg.aperturas[clave] != null || accionesDe(reg, clave).length > 0;
      return accionesDe(reg, "E3").some((a) => a.accion === "abrir_spam") && revisado("3A") && revisado("3B") ? { horaJuego: null } : null;
    }
    default:
      return null;
  }
}

/** Estado de cada pendiente: "hecho" (a tiempo), "tarde" (después de su hora límite) o false. */
export function pendientesEstado(reg) {
  const r = {};
  for (const p of PENDIENTES) {
    const a = accionQueCumple(reg, p.id);
    if (!a) r[p.id] = false;
    else r[p.id] = p.limite && a.horaJuego && a.horaJuego > p.limite ? "tarde" : "hecho";
  }
  return r;
}

/** Pendientes cumplidos de forma segura y a tiempo (guion 9.5). */
export function pendientesCumplidos(reg) {
  return Object.fromEntries(Object.entries(pendientesEstado(reg)).map(([k, v]) => [k, v === "hecho"]));
}

/** Evalúa toda la jornada. Puntaje oficial = seguridad + productividad (guion 9.1). */
export function evaluarJornada(reg) {
  const eventos = {
    E1: evaluarE1(accionesDe(reg, "E1")),
    E2: evaluarE2(accionesDe(reg, "E2")),
    E3: evaluarE3(accionesDe(reg, "3A"), accionesDe(reg, "3B"), reg.aperturas["3B"]),
    E4: evaluarE4(accionesDe(reg, "E4")),
    E5: evaluarE5(accionesDe(reg, "E5")),
    E6: evaluarE6(accionesDe(reg, "E6")),
    E7: evaluarE7(accionesDe(reg, "E7")),
    E8: evaluarE8(accionesDe(reg, "E8")),
    E9: evaluarE9(accionesDe(reg, "E9")),
    E10: evaluarE10(accionesDe(reg, "E10")),
    E11: evaluarE11(accionesDe(reg, "E11")),
    E12: evaluarE12(accionesDe(reg, "E12")),
    E13: evaluarE13(accionesDe(reg, "E13")),
    EX: evaluarEX(accionesDe(reg, "EX")),
    E7J: evaluarE7J(accionesDe(reg, "E7J")),
    E14: evaluarE14(accionesDe(reg, "14A"), accionesDe(reg, "14B")),
    E15: evaluarTarea(accionesDe(reg, "E15"), "reservar"),
    E16: evaluarE16(accionesDe(reg, "E16")),
    E17: evaluarE17(accionesDe(reg, "E17"), reg.aperturas.E17),
  };
  const estado = pendientesEstado(reg);
  const pendientes = Object.fromEntries(Object.entries(estado).map(([k, v]) => [k, v === "hecho"]));
  const puntosPendientes = Object.values(pendientes).filter(Boolean).length;
  const distracciones = contarDistracciones(reg);
  const productividad = puntosPendientes - distracciones;
  const crudo = Object.values(eventos).reduce((s, e) => s + e.puntos, 0) + productividad;
  return {
    eventos,
    pendientes,
    pendientesEstado: estado,
    puntosPendientes,
    distracciones,
    distraccionesLista: listaDistracciones(reg),
    productividad,
    puntajeCrudo: crudo,
    puntaje: Math.max(0, crudo),
  };
}
