/**
 * Estado de la jornada y su proveedor de React.
 * Reloj por eventos (guion 8.2 y 9.7), buzón, chats (9.3), ventanas, navegador, descargas, Mesa de Ayuda, E7 y registro.
 * Las reglas de puntaje están en src/engine/ (lógica pura y probada).
 */
import { useEffect, useMemo, useReducer, useRef } from "react";
import { JuegoCtx, useJuego } from "./contexto.js";
import { config } from "../data/config.js";
import {
  eventos,
  chat as chatGuion,
  sugerencias,
  pendientes as pendientesGuion,
  reacciones,
  e7 as e7Datos,
  mesaAyuda,
  navegador as navDatos,
  proteccion,
} from "../data/eventos.js";
import { relleno } from "../data/relleno.js";
import { textos } from "../data/textos.js";
import { horaAMinutos, minutosAHHMM, isoHoy } from "../util/tiempo.js";
import * as R from "../engine/registro.js";
import { pendientesEstado, evaluarJornada } from "../engine/puntaje.js";
import { etiquetas, etiquetaMasGrave } from "../engine/banderas.js";
import { eventoResuelto } from "../engine/ritmo.js";

export { useJuego };

const RL = config.reloj;
const MIN_INICIO = horaAMinutos(RL.inicio);
const MIN_FIN = horaAMinutos(RL.fin);
const MIN_SUAVE = horaAMinutos(RL.suaveHasta);
const EVENTOS = eventos.map((e) => ({ ...e, minuto: horaAMinutos(e.hora) })).sort((a, b) => a.minuto - b.minuto);
const TT = textos.escritorio.toasts;

// Solo en desarrollo: ?rapido=N acorta las esperas del reloj para revisar la jornada.
const ACELERAR = import.meta.env.DEV ? Number(new URLSearchParams(window.location.search).get("rapido")) || 1 : 1;

function mezclar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let idToast = 0;
const MAX_NOTIFS = 40;
/**
 * Aviso. extra.estado = mensaje de estado de una app ("Mensaje enviado"): se ve dentro de la app y no va al centro de
 * notificaciones. Los demás quedan en el centro de notificaciones (guion 12.1) para atenderlos después.
 */
function conToast(s, texto, extra = {}) {
  idToast += 1;
  const t = { id: idToast, texto, ...extra };
  s = { ...s, toasts: [...s.toasts, t] };
  if (!extra.estado) s = { ...s, notifs: [...s.notifs, { ...t, hora: minutosAHHMM(s.minuto), leida: false }].slice(-MAX_NOTIFS) };
  return s;
}

let idMsg = 0;
/** Mensaje de chat. conv = conversación (por defecto, quien escribe). */
function conChat(s, de, texto, extra = {}) {
  idMsg += 1;
  const conv = extra.conv || de;
  if (de !== "yo" && !extra.silencio) {
    idToast += 1;
    const n = { id: idToast, tipo: "chat", conv, de, texto, hora: minutosAHHMM(s.minuto), leida: false };
    s = { ...s, ultimoMsgMs: s.msReal, notifs: [...s.notifs, n].slice(-MAX_NOTIFS) };
  }
  return { ...s, chat: [...s.chat, { id: `m${idMsg}`, de, texto, hora: minutosAHHMM(s.minuto), ms: s.msReal, leido: de === "yo", ...extra, conv }] };
}

/** Correo listo para el buzón del jugador: {nombre} → su primer nombre; aviso legal según el dominio. */
function paraJugador(c, jugador) {
  const nombre = (jugador.nombre || jugador.nombreCompleto || "").trim().split(/\s+/)[0];
  const cuerpo = (c.cuerpo || []).map((b) => (b.texto ? { ...b, texto: b.texto.replace("{nombre}", nombre) } : b));
  return { adjuntos: [], enlaces: [], para: jugador.correo, ...c, cuerpo, avisoLegal: c.avisoLegal ?? c.de.correo.endsWith("@" + config.dominioInstitucional) };
}

function nuevaPestana(id, pagina = "buscador", extra = {}) {
  return { id, pagina, q: "", ...extra };
}

function estadoInicial({ jugador, modo }) {
  return {
    jugador,
    modo,
    minuto: MIN_INICIO,
    msReal: 0,
    corriendo: false,
    finalizado: false,
    disparados: {},
    activo: null, // { id, desde, resueltoEn }
    esperaHasta: RL.esperaInicialMs / ACELERAR,
    adelanto: null, // { desde, hasta, t0 }
    ultimoMsgMs: -Infinity, // para espaciar los mensajes del chat
    ultimoEventoMs: -Infinity, // para no disparar dos eventos en el mismo instante
    ultimaActividadMs: -Infinity, // último clic o tecla del jugador (guion 13.2)
    criticos: {},
    correos: relleno.map((c) => paraJugador(c, jugador)),
    chat: [],
    chatRespuestas: {},
    bloqueados: {}, // conversaciones reportadas o bloqueadas
    toasts: [],
    notifs: [], // centro de notificaciones
    emergenteE17: false, // la pestaña de la "actualización" falsa espera a que se use el navegador
    red: true,
    apps: { activa: null, abiertas: [] },
    nav: { pestanas: [nuevaPestana(1)], activa: 1, sig: 2, extension: false },
    visitados: {}, // distracciones ya contadas
    archivos: { pdf: false },
    descarga: null, // { clave, archivo, origen } mientras la protección del equipo está abierta
    casos: [],
    modal: null, // "5B" | "e7"
    e7: null, // { version, inicio, etiqueta, resultado }
    efectos: { locked: false, camara: false },
    programados: [],
    pendientes: Object.fromEntries(pendientesGuion.map((p) => [p.id, false])), // false | "hecho" | "tarde"
    registro: R.crearRegistro(),
  };
}

// ───────────── Registro y efectos de las acciones ─────────────

const hora = (s) => minutosAHHMM(s.minuto);

function registrar(s, clave, accion, detalle) {
  const evento = clave === "3A" || clave === "3B" ? "E3" : clave === "14A" || clave === "14B" ? "E14" : clave;
  const registro = R.registrarAccion(s.registro, { clave, evento, accion, detalle, ms: s.msReal, horaJuego: hora(s) });
  return revisar({ ...s, registro });
}

function apertura(s, clave) {
  return revisar({ ...s, registro: R.registrarApertura(s.registro, clave, s.msReal) });
}

function llegada(s, clave) {
  return { ...s, registro: R.registrarLlegada(s.registro, clave, s.msReal) };
}

function marcarResuelto(s, espera = RL.esperaTrasResolverMs) {
  return { ...s, activo: { ...s.activo, resueltoEn: s.msReal }, esperaHasta: s.msReal + espera / ACELERAR };
}

/** ¿El jugador ya vio el evento activo (abrió su correo o leyó su mensaje)? Con eso el día sigue (guion 11.1). */
function eventoVisto(s, id) {
  // Un mensaje del chat con respuestas cuenta como visto cuando ya se respondió (guion 13.2).
  return s.correos.some((c) => c.evento === id && c.leido) || s.chat.some((m) => m.evento === id && m.leido && (!m.opciones || s.chatRespuestas[m.id]));
}

/** ¿Hay una pregunta del chat esperando respuesta (reciente, sin vencer y sin otra más nueva de la misma persona)? */
function chatPorResponder(s) {
  return s.chat.some(
    (m, i) =>
      m.opciones &&
      !s.chatRespuestas[m.id] &&
      !s.bloqueados[m.conv] &&
      !(m.expira && s.msReal > m.expira) &&
      s.msReal - (m.ms ?? 0) < RL.chatPorResponderMs / ACELERAR &&
      (m.evento || !s.chat.some((x, j) => j > i && x.conv === m.conv && x.de === m.de && x.opciones))
  );
}

/** Guion 13.2: el jugador está en algo (hizo clic o escribió hace poco, o tiene una pregunta por responder). */
function ocupado(s) {
  return s.msReal - s.ultimaActividadMs < RL.actividadMs / ACELERAR || chatPorResponder(s);
}

/** Evento activo atendido: con una acción, el día sigue enseguida; si solo lo leyó, le da unos segundos más. */
function revisarActivo(s) {
  if (!s.activo || s.activo.resueltoEn != null) return s;
  if (eventoResuelto(s.activo.id, s.registro)) return marcarResuelto(s);
  if (eventoVisto(s, s.activo.id)) return marcarResuelto(s, RL.esperaTrasLeerMs);
  return s;
}

/** Tras cada acción: pendientes cumplidos (a tiempo o tarde) y evento activo resuelto. */
function revisar(s) {
  const estado = pendientesEstado(s.registro);
  for (const [id, e] of Object.entries(estado)) {
    if (e && !s.pendientes[id]) {
      s = { ...s, pendientes: { ...s.pendientes, [id]: e } };
      const p = pendientesGuion.find((x) => x.id === id);
      // Guion 12.1: completar un pendiente no genera aviso (se ve en la lista); llegar tarde sí.
      if (e === "tarde") s = conToast(s, TT.pendienteTarde(p.texto), { tipo: "alerta", origen: "pendientes" });
    }
  }
  return revisarActivo(s);
}

function programar(s, enMs, tarea) {
  return { ...s, programados: [...s.programados, { en: s.msReal + enMs, ...tarea }] };
}

// ───────────── Eventos ─────────────

function cumpleCondicion(s, condicion) {
  if (condicion === "informePendiente") return !s.pendientes.informe;
  if (condicion === "informeEnviado") return !!s.pendientes.informe;
  return true;
}

function mensajeGuion(s, m) {
  // Guion 18.4: el grupo del área está silenciado (sin aviso ni sonido) salvo los mensajes que son parte de un evento.
  const silencio = m.conv === "grupo" && !m.evento;
  return conChat(s, m.de, m.texto, { guion: m.id, conv: m.conv, opciones: m.opciones, enlace: m.enlace, evento: m.evento, ...(silencio ? { silencio: true } : { sonido: "chat" }) });
}

function disparar(s, ev) {
  s = { ...s, disparados: { ...s.disparados, [ev.id]: true }, activo: { id: ev.id, desde: s.msReal, resueltoEn: null }, ultimoEventoMs: s.msReal };
  const correos = ev.correo ? [ev.correo] : ev.correos || [];
  if (correos.length) {
    const nuevos = correos.map((c) => ({ ...paraJugador(c, s.jugador), evento: ev.id, clave: c.parte || ev.id, fecha: isoHoy(ev.hora), leido: false }));
    s = { ...s, correos: [...nuevos, ...s.correos] };
    for (const c of nuevos) s = llegada(s, c.clave);
    if (ev.notificacion) s = conToast(s, ev.notificacion, { app: "correo", carpeta: "spam", sonido: "correo" });
    else for (const c of nuevos) s = conToast(s, c.asunto, { app: "correo", titulo: c.de.nombre, sonido: "correo" });
  }
  // Mensajes de chat atados al evento.
  for (const m of chatGuion.filter((x) => x.evento === ev.id)) {
    if (m.condicion && !cumpleCondicion(s, m.condicion)) continue;
    s = llegada(s, ev.id);
    s = mensajeGuion({ ...s, disparados: { ...s.disparados, [m.id]: true } }, m);
  }
  // Pendientes que aparecen con este evento (guion 9.5).
  // Guion 18.4: un pendiente nuevo no genera notificación; el botón de pendientes lo marca como nuevo.
  for (const p of pendientesGuion.filter((x) => x.aparece === ev.id)) {
    s = { ...s, pendientesNuevos: (s.pendientesNuevos || 0) + 1 };
  }
  if (ev.id === "E5" && s.pendientes.informe) s = marcarResuelto(s);
  if (ev.id === "E7") s = iniciarE7(s);
  if (ev.id === "E17") {
    // Guion 16.2: a las 12:40 el navegador se abre solo con la pestaña de la "actualización".
    s = abrirApp({ ...s, emergenteE17: true }, "navegador");
  }
  return revisar(s);
}

function iniciarE7(s) {
  const ev = evaluarJornada(s.registro);
  const version = etiquetas(ev).length ? "A" : "B";
  s = llegada(s, "E7");
  s = { ...s, registro: R.registrarAccion(s.registro, { clave: "E7", evento: "E7", accion: `inicio_${version}`, ms: s.msReal, horaJuego: hora(s) }) };
  if (version === "B") {
    const m = e7Datos.B.mensaje;
    s = conChat(s, m.de, m.texto, {
      guion: "c-julian-7b",
      opciones: mezclar(e7Datos.B.opciones).map((o) => ({ ...o, accion: { clave: "E7", accion: `respuesta_${o.id}` } })),
      sonido: "chat",
      abrirChat: true,
    });
    return { ...s, e7: { version, inicio: s.msReal } };
  }
  const tag = etiquetaMasGrave(ev);
  s = { ...s, e7: { version, inicio: s.msReal, etiqueta: tag }, modal: "e7" };
  // Julián también escribe mientras atiendes el incidente (guion 9.6).
  const J = config.e7.julianA;
  s = programar(s, (J.aLosSeg * 1000) / ACELERAR, {
    tipo: "chat",
    de: e7Datos.A.mensaje.de,
    texto: e7Datos.A.mensaje.texto,
    guion: "c-julian-7a",
    llegada: "E7J",
    duracionMs: J.duracionSeg * 1000,
    opciones: e7Datos.A.opciones.map((o) => ({ ...o, accion: { clave: "E7J", accion: `respuesta_${o.id}` } })),
  });
  // Consecuencias visibles según la etiqueta más grave (guion E7).
  if (tag === "MALWARE") s = { ...s, efectos: { ...s.efectos, locked: true } };
  if (tag === "CREDENCIALES" || tag === "CREDENCIALES_BANCO") {
    const falsos = Array.from({ length: 6 }, (_, i) => ({
      id: `falso-${i}`,
      carpeta: "enviados",
      leido: true,
      fecha: isoHoy(minutosAHHMM(s.minuto - i)),
      de: { nombre: s.jugador.nombreCompleto, correo: s.jugador.correo },
      para: ["Todos mis contactos"],
      asunto: "Factura pendiente de pago — urgente",
      cuerpo: [{ tipo: "p", texto: "Buen día, adjunto la factura pendiente. Por favor realice el pago hoy mismo en el enlace." }],
      adjuntos: [],
      enlaces: [],
    }));
    s = { ...s, correos: [...falsos, ...s.correos] };
  }
  if (tag === "FRAUDE") {
    s = conChat(s, "desconocido", "Hola de nuevo 😊 ¿Me ayudas con 2 tarjetas más? Es urgente 🙏", { sonido: "chat" });
  }
  if (tag === "PERMISOS") {
    s = { ...s, efectos: { ...s.efectos, camara: true } };
    for (const t of ["🔔 ¡Ganaste un premio! Haz clic aquí", "🔔 Tu equipo está en riesgo", "🔔 Oferta exclusiva solo hoy"]) s = conToast(s, t, { tipo: "alerta" });
  }
  return s;
}

function finalizarE7(s, accion, detalle) {
  if (!s.e7 || s.e7.resultado) return s;
  s = registrar(s, "E7", accion, detalle);
  return programar({ ...s, e7: { ...s.e7, resultado: accion, fin: s.msReal } }, 3800, { tipo: "cerrarE7" });
}

// ───────────── Navegador ─────────────

function pestanaActiva(s) {
  return s.nav.pestanas.find((p) => p.id === s.nav.activa);
}

// Conversación de cada número desconocido → evento que puntúa.
const CLAVE_DESCONOCIDO = { desconocido: "E12", soporte: "E16" };

/** E17 (guion 15.2): la "actualización" falsa se abre sola en una pestaña nueva la próxima vez que se usa el navegador. */
function abrirEmergente(s) {
  if (!s.emergenteE17) return s;
  const n = s.nav;
  s = { ...s, emergenteE17: false, nav: { ...n, pestanas: [...n.pestanas, nuevaPestana(n.sig, "actualizar")], activa: n.sig, sig: n.sig + 1 } };
  return apertura(s, "E17");
}

/** Al salir de una página (cerrar pestaña o navegar a otra). */
function alSalir(s, tab) {
  if (!tab) return s;
  const def = navDatos.paginas[tab.pagina];
  if ((tab.pagina === "login-falso" || tab.pagina === "login-buzon") && !tab.enviado) {
    s = registrar(s, def.clave, `${def.prefijo}cerrar_sin_escribir`, tab.escribio ? { escribioSinEnviar: true } : undefined);
  }
  if (tab.pagina === "beneficios-falso" && !tab.enviado) s = registrar(s, "E4", "cerrar");
  if (tab.pagina === "certificado" && !tab.continuo) s = registrar(s, "E6", "volver");
  if (tab.pagina === "actualizar" && !tab.descargo) s = registrar(s, "E17", "cerrar");
  return s;
}

/** Distracción: −1 productividad y el reloj salta (guion 9.4). Solo la primera visita a cada sitio. */
function distraccion(s, sitio) {
  if (s.visitados[sitio] || !s.corriendo || s.e7) return s;
  s = { ...s, visitados: { ...s.visitados, [sitio]: true } };
  s = registrar(s, "EX", `distraccion_${sitio}`);
  const salto = RL.saltoDistraccionMin;
  s = { ...s, minuto: Math.min(MIN_FIN - 0.5, s.minuto + salto), adelanto: null };
  return conToast(s, navDatos.distraccion(salto), { tipo: "alerta" });
}

/** Al mostrar una página. */
function alEntrar(s, pagina) {
  const def = navDatos.paginas[pagina];
  if (def?.distraccion) s = distraccion(s, def.distraccion);
  if (pagina === "video" && s.disparados.E9 && !R.accionesDe(s.registro, "E9").some((a) => a.accion === "abrir_video")) {
    s = apertura(s, "E9");
    s = registrar(s, "E9", "abrir_video");
  }
  if (pagina === "beneficios-falso") {
    s = apertura(s, "E4");
    s = registrar(s, "E4", "abrir_falsa");
  }
  if (pagina === "programa" || pagina === "extension") s = apertura(s, "E5");
  if (pagina === "formatos-anuncio") s = apertura(s, "E13");
  if (pagina === "soporte-remoto" && s.disparados.E16) s = registrar(apertura(s, "E16"), "E16", "abrir_enlace");
  return s;
}

function abrirApp(s, id) {
  const abiertas = s.apps.abiertas.includes(id) ? s.apps.abiertas : [...s.apps.abiertas, id];
  s = { ...s, apps: { activa: id, abiertas } };
  return id === "navegador" ? abrirEmergente(s) : s;
}

function abrirPagina(s, pagina, { nueva = true, q = "", seccion } = {}) {
  if (nueva) {
    const n = s.nav;
    s = { ...s, nav: { ...n, pestanas: [...n.pestanas, nuevaPestana(n.sig, pagina, { q, seccion })], activa: n.sig, sig: n.sig + 1 } };
  } else {
    s = alSalir(s, pestanaActiva(s));
    const n = s.nav;
    s = { ...s, nav: { ...n, pestanas: n.pestanas.map((p) => (p.id === n.activa ? nuevaPestana(p.id, pagina, { q, seccion }) : p)) } };
  }
  s = abrirApp(s, "navegador");
  return alEntrar(s, pagina);
}

// ───────────── Reloj ─────────────

function siguienteMinuto(s) {
  const ev = EVENTOS.find((e) => !s.disparados[e.id]);
  return ev ? ev.minuto : MIN_FIN;
}

function empezarAdelanto(s) {
  const hasta = siguienteMinuto(s);
  if (hasta <= s.minuto) return s;
  return { ...s, adelanto: { desde: s.minuto, hasta, t0: s.msReal } };
}

function hayCongelamiento(s) {
  return !!s.modal || Object.values(s.criticos).some(Boolean);
}

function tick(s, delta) {
  if (s.finalizado || !s.corriendo) return s;
  s = { ...s, msReal: s.msReal + delta };

  // Tareas programadas (respuestas por correo o chat, cierre de E7…).
  if (s.programados.length && s.programados.some((t) => t.en <= s.msReal)) {
    const listos = s.programados.filter((t) => t.en <= s.msReal);
    s = { ...s, programados: s.programados.filter((t) => t.en > s.msReal) };
    for (const t of listos) s = ejecutarProgramado(s, t);
  }

  // E7: límite de 30 s reales.
  if (s.e7 && !s.e7.resultado && s.msReal - s.e7.inicio >= e7Datos.duracionSeg * 1000) {
    if (s.e7.version === "A") s = finalizarE7(s, "nada");
    else s = registrar({ ...s, e7: { ...s.e7, resultado: "sin_respuesta" } }, "E7", "respuesta_sin_respuesta");
  }

  // Ventanas críticas y modales congelan el reloj del juego (no el tiempo real).
  if (hayCongelamiento(s)) return s;

  if (s.adelanto) {
    const p = Math.min(1, (s.msReal - s.adelanto.t0) / RL.msAdelanto);
    const minuto = s.adelanto.desde + (s.adelanto.hasta - s.adelanto.desde) * p;
    s = { ...s, minuto: Math.max(s.minuto, minuto), adelanto: p >= 1 ? null : s.adelanto };
  } else if ((s.activo && s.activo.resueltoEn == null) || s.msReal < s.esperaHasta || ocupado(s)) {
    // Guion 14.1: el reloj nunca se queda quieto. Corre a ritmo normal mientras hay algo nuevo, mientras el jugador
    // termina lo que hace o tiene una pregunta por responder; solo se adelanta rápido cuando no hay nada en curso.
    const ritmo = s.minuto < MIN_SUAVE ? RL.msPorMinutoInicio : RL.msPorMinuto;
    s = { ...s, minuto: Math.min(MIN_FIN, s.minuto + (delta * ACELERAR) / ritmo) };
    if (s.activo && s.activo.resueltoEn == null && !ocupado(s) && s.msReal - s.activo.desde > RL.esperaMaxEventoMs / ACELERAR) {
      // Nadie lo atendió y el jugador no está en nada: sigue en el buzón o en el chat, y el día puede adelantarse.
      s = { ...s, activo: { ...s.activo, resueltoEn: s.msReal, ignorado: true }, esperaHasta: s.msReal };
    }
  } else {
    s = empezarAdelanto(s);
  }

  // Disparar eventos (de a uno, con unos segundos entre ellos) y mensajes del chat (espaciados) según la hora.
  const ev = EVENTOS.find((e) => !s.disparados[e.id] && e.minuto <= s.minuto + 1e-9);
  if (ev && s.msReal - s.ultimoEventoMs >= RL.separacionEventosMs / ACELERAR) s = disparar({ ...s, minuto: Math.max(s.minuto, ev.minuto), adelanto: null }, ev);
  for (const m of chatGuion) {
    if (m.evento || s.disparados[m.id] || horaAMinutos(m.hora) > s.minuto) continue;
    if (m.condicion && !cumpleCondicion(s, m.condicion)) {
      s = { ...s, disparados: { ...s.disparados, [m.id]: true } };
      continue;
    }
    if (s.msReal - s.ultimoMsgMs < RL.separacionMensajesMs / ACELERAR) break;
    s = mensajeGuion({ ...s, disparados: { ...s.disparados, [m.id]: true } }, m);
  }

  if (s.minuto >= MIN_FIN) s = conToast({ ...s, minuto: MIN_FIN, finalizado: true }, TT.finJornada);
  return s;
}

function ejecutarProgramado(s, t) {
  if (t.tipo === "correo") {
    s = { ...s, correos: [{ ...paraJugador(t.correo, s.jugador), fecha: isoHoy(hora(s)), leido: false }, ...s.correos] };
    return conToast(s, t.correo.asunto, { app: "correo", titulo: t.correo.de.nombre, sonido: "correo" });
  }
  if (t.tipo === "chat") {
    if (s.bloqueados[t.conv || t.de]) return s;
    if (t.llegada) s = llegada(s, t.llegada);
    return conChat(s, t.de, t.texto, {
      sonido: "chat",
      conv: t.conv,
      guion: t.guion,
      opciones: t.opciones,
      ...(t.duracionMs ? { expira: s.msReal + t.duracionMs } : {}),
    });
  }
  if (t.tipo === "toast") return conToast(s, t.texto, t.extra);
  if (t.tipo === "cerrarE7") return revisar({ ...s, modal: s.modal === "e7" ? null : s.modal });
  return s;
}

/** Respuesta de Mesa de Ayuda por correo. */
function respuestaMesa(s, id, numero) {
  const r = mesaAyuda.respuestas[id] || mesaAyuda.respuestas.otro;
  return programar(s, 8000 / ACELERAR, {
    tipo: "correo",
    correo: { id: `mesa-${numero}`, carpeta: "entrada", de: { nombre: "Mesa de Ayuda", correo: config.canales.mesaAyuda }, asunto: r.asunto(numero), cuerpo: r.cuerpo },
  });
}

// ───────────── Reductor ─────────────

function reducer(s, a) {
  switch (a.type) {
    case "tick":
      return tick(s, a.delta);
    case "empezar":
      return { ...s, corriendo: true };
    case "seguir": {
      if (s.adelanto || hayCongelamiento(s) || s.finalizado || s.e7) return s;
      if (s.activo && s.activo.resueltoEn == null) s = { ...s, activo: { ...s.activo, resueltoEn: s.msReal, ignorado: true } };
      return empezarAdelanto({ ...s, esperaHasta: s.msReal });
    }
    case "actividad":
      // Si el día estaba adelantándose y el jugador se pone a hacer algo, el adelanto se detiene donde va.
      return { ...s, ultimaActividadMs: s.msReal, adelanto: null };
    case "critico":
      return s.criticos[a.id] === a.on ? s : { ...s, criticos: { ...s.criticos, [a.id]: a.on } };

    // Ventanas
    case "abrirApp":
      return abrirApp(s, a.id);
    case "lanzar":
      return s.apps.activa === a.id ? { ...s, apps: { ...s.apps, activa: null } } : abrirApp(s, a.id);
    case "minimizar":
      return { ...s, apps: { ...s.apps, activa: null } };
    case "cerrarApp": {
      if (a.id === "navegador") {
        for (const p of s.nav.pestanas) s = alSalir(s, p);
        const sig = s.nav.sig;
        s = { ...s, nav: { ...s.nav, pestanas: [nuevaPestana(sig)], activa: sig, sig: sig + 1 } };
      }
      return { ...s, apps: { activa: null, abiertas: s.apps.abiertas.filter((x) => x !== a.id) } };
    }

    // Correo
    case "abrirCorreo": {
      const c = s.correos.find((x) => x.id === a.id);
      s = { ...s, correos: s.correos.map((x) => (x.id === a.id ? { ...x, leido: true } : x)) };
      return revisarActivo(c?.clave ? apertura(s, c.clave) : s);
    }
    case "mover":
      return { ...s, correos: s.correos.map((c) => (c.id === a.id ? { ...c, carpeta: a.carpeta } : c)) };
    case "eliminarAdjunto":
      return { ...s, correos: s.correos.map((c) => (c.id === a.id ? { ...c, adjuntos: c.adjuntos.filter((x) => x.id !== a.adjunto) } : c)) };
    case "agregarCorreo":
      return { ...s, correos: [{ adjuntos: [], enlaces: [], ...a.correo, fecha: isoHoy(hora(s)) }, ...s.correos] };
    case "reaccion": {
      const r = reacciones[a.id];
      return programar(s, 2500, { tipo: "chat", de: r.de, texto: r.texto });
    }

    // Registro
    case "inspeccion":
      if (!a.clave) return s;
      return { ...s, registro: R.registrarInspeccion(s.registro, a.clave, a.tipo, s.msReal) };
    case "accion":
      if (!a.clave) return s;
      return registrar(s, a.clave, a.accion, a.detalle);

    // Chat
    case "responderChat": {
      const m = s.chat.find((x) => x.id === a.id);
      if (!m || s.chatRespuestas[a.id] || s.bloqueados[m.conv]) return s;
      if (m.expira && s.msReal > m.expira) return s;
      if (m.guion === "c-julian-7b" && s.e7?.resultado) return s;
      const o = m.opciones.find((x) => x.id === a.opcion);
      s = { ...s, chatRespuestas: { ...s.chatRespuestas, [a.id]: o.id } };
      s = conChat(s, "yo", o.texto, { conv: m.conv });
      if (o.accion) {
        if (o.accion.clave === "E7") s = { ...s, e7: { ...s.e7, resultado: o.id } };
        s = registrar(s, o.accion.clave, o.accion.accion);
      }
      if (o.respuesta) s = programar(s, 1400, { tipo: "chat", de: m.de, conv: m.conv, texto: o.respuesta });
      if (o.luego) s = programar(s, 2600, { tipo: "chat", de: m.de, conv: m.conv, texto: o.luego.texto, opciones: o.luego.opciones, guion: `${m.guion}-luego` });
      return s;
    }
    case "iniciarChat": {
      const sg = sugerencias.find((x) => x.id === a.id);
      if (!sg) return s;
      s = conChat(s, "yo", sg.texto, { conv: sg.conv });
      if (sg.accion) s = registrar(s, sg.accion.clave, sg.accion.accion);
      if (sg.respuesta) s = programar(s, 1800, { tipo: "chat", de: sg.conv, texto: sg.respuesta });
      return s;
    }
    case "contacto": {
      // Número desconocido (E12 "Andrea", E16 "soporte"): 🚩 Reportar a Seguridad o Bloquear.
      if (s.bloqueados[a.conv]) return s;
      s = { ...s, bloqueados: { ...s.bloqueados, [a.conv]: a.accion } };
      s = registrar(s, CLAVE_DESCONOCIDO[a.conv] || "E12", a.accion);
      return conToast(s, a.accion === "reportar" ? textos.escritorio.chat.reportado : textos.escritorio.chat.bloqueado, { tipo: "ok", estado: true });
    }
    case "leerChat":
      return s.chat.some((m) => !m.leido && m.conv === a.conv) ? revisarActivo({ ...s, chat: s.chat.map((m) => (m.conv === a.conv ? { ...m, leido: true } : m)) }) : s;

    // Navegador
    case "abrirPagina":
      return abrirPagina(s, a.pagina, { nueva: a.nueva !== false, q: a.q, seccion: a.seccion });
    case "navCambiar":
      return { ...s, nav: { ...s.nav, activa: a.id } };
    case "navNueva": {
      const n = s.nav;
      return { ...s, nav: { ...n, pestanas: [...n.pestanas, nuevaPestana(n.sig)], activa: n.sig, sig: n.sig + 1 } };
    }
    case "navCerrar": {
      const tab = s.nav.pestanas.find((p) => p.id === a.id);
      s = alSalir(s, tab);
      let pestanas = s.nav.pestanas.filter((p) => p.id !== a.id);
      let { sig } = s.nav;
      if (!pestanas.length) {
        pestanas = [nuevaPestana(sig)];
        sig += 1;
      }
      const activa = s.nav.activa === a.id ? pestanas[pestanas.length - 1].id : s.nav.activa;
      return { ...s, nav: { ...s.nav, pestanas, activa, sig } };
    }
    case "navMarcar":
      return { ...s, nav: { ...s.nav, pestanas: s.nav.pestanas.map((p) => (p.id === a.id ? { ...p, ...a.datos } : p)) } };

    // Descargas peligrosas → Protección del equipo (E5, E9, E13, EX).
    case "descargar":
      if (s.modal) return s;
      return { ...registrar(s, a.clave, a.accion || "descargar"), descarga: { clave: a.clave, archivo: a.archivo, origen: a.origen }, modal: "5B" };
    case "proteccion": {
      // "Más información" no cierra; las demás opciones deciden.
      const d = s.descarga;
      if (!d) return s;
      s = registrar(s, d.clave, a.accion);
      if (a.accion === "mas_info") return s;
      s = { ...s, modal: null, descarga: null };
      if (a.accion === "cuarentena") return conToast(s, proteccion.enCuarentena, { tipo: "ok" });
      s = conToast(s, proteccion.instalando(d.archivo));
      return programar(s, 2600, { tipo: "toast", texto: proteccion.errorInstalar });
    }
    case "extension":
      s = registrar(s, "E5", a.acepta ? "instalar_extension" : "cancelar_extension");
      return a.acepta ? conToast({ ...s, nav: { ...s.nav, extension: true } }, navDatos.paginas.extension.instalada) : s;

    // Documentos
    case "guardarPdf":
      s = registrar({ ...s, archivos: { ...s.archivos, pdf: true } }, "E5", "guardar_pdf");
      return conToast(s, a.texto, { tipo: "ok", estado: true });

    // Mesa de Ayuda (guion 9.4): categoría + asunto.
    case "crearCaso": {
      const numero = mesaAyuda.numero + s.casos.length;
      s = { ...s, casos: [...s.casos, { numero, texto: a.texto, estado: mesaAyuda.abierto }] };
      if (a.categoria === "seguridad" && s.e7 && s.e7.version === "A" && !s.e7.resultado) return finalizarE7(s, "mesa_ayuda");
      if (a.asunto === "pdf" && s.disparados.E5 && !eventoResuelto("E5", s.registro)) {
        s = registrar(s, "E5", "mesa_ayuda");
        return respuestaMesa(s, "pdf", numero);
      }
      if (a.asunto === "impresora") {
        s = registrar(s, "E11", "caso_impresora");
        return respuestaMesa(s, "impresora", numero);
      }
      if (a.asunto === "sospechoso") {
        // Un caso de "mensaje sospechoso" reporta los números desconocidos que ya escribieron.
        for (const [conv, clave] of Object.entries(CLAVE_DESCONOCIDO)) {
          if (s.disparados[clave] && !s.bloqueados[conv]) s = registrar({ ...s, bloqueados: { ...s.bloqueados, [conv]: "reportar" } }, clave, "reportar");
        }
        return respuestaMesa(s, "sospechoso", numero);
      }
      return respuestaMesa(s, a.asunto === "pdf" ? "pdf" : "otro", numero);
    }

    // E7
    case "e7Accion":
      return finalizarE7(s, a.accion, a.canal ? { canal: a.canal } : undefined);
    case "red": {
      const red = !s.red;
      if (!red && s.e7 && s.e7.version === "A" && !s.e7.resultado) s = registrar(s, "E7", "desconectar");
      return { ...s, red };
    }

    case "toast":
      return conToast(s, a.texto, a.extra);
    case "quitarToast":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "verPendientes":
      return s.pendientesNuevos ? { ...s, pendientesNuevos: 0 } : s;
    case "leerNotifs":
      return s.notifs.some((n) => !n.leida) ? { ...s, notifs: s.notifs.map((n) => ({ ...n, leida: true })) } : s;
    case "borrarNotifs":
      return { ...s, notifs: a.id ? s.notifs.filter((n) => n.id !== a.id) : [] };
    default:
      return s;
  }
}

// Dónde se trabaja: ventanas, chat, pendientes, centro de notificaciones, alertas y, en el celular, la app y las hojas.
const ZONAS_DE_TRABAJO = ".ventana, .chat, .pendientes__panel, .centro, .proteccion, .e7, .telefono__app, .hoja";

export function JuegoProvider({ jugador, modo, onFin, children }) {
  const [state, dispatch] = useReducer(reducer, { jugador, modo }, estadoInicial);
  useReloj(dispatch, state.finalizado);
  // Al terminar, pasa a la revelación con el estado más reciente. Solo depende de "finalizado":
  // si dependiera de todo el estado, cerrar un aviso cancelaba el paso y el juego se quedaba en la 1:00 p.m.
  const ultimo = useRef(state);
  ultimo.current = state;
  const alFin = useRef(onFin);
  alFin.current = onFin;
  useEffect(() => {
    if (!state.finalizado) return undefined;
    const t = setTimeout(() => alFin.current?.(ultimo.current), 1800);
    return () => clearTimeout(t);
  }, [state.finalizado]);

  // Guion 13.2: clics, teclas y rueda del jugador (como máximo uno cada 0,5 s) para no adelantar el día mientras trabaja.
  // Solo cuenta lo que pasa dentro de algo abierto: un clic de ansiedad en el escritorio o la barra no frena el día.
  useEffect(() => {
    let ultimo = 0;
    const marcar = (e) => {
      const el = e.type === "keydown" ? document.activeElement : e.target;
      if (!el?.closest?.(ZONAS_DE_TRABAJO)) return;
      const t = performance.now();
      if (t - ultimo < 500) return;
      ultimo = t;
      dispatch({ type: "actividad" });
    };
    const eventosUsuario = ["pointerdown", "keydown", "wheel"];
    eventosUsuario.forEach((e) => window.addEventListener(e, marcar, { passive: true, capture: true }));
    return () => eventosUsuario.forEach((e) => window.removeEventListener(e, marcar, { capture: true }));
  }, []);

  const valor = useMemo(() => ({ state, dispatch }), [state]);
  return <JuegoCtx.Provider value={valor}>{children}</JuegoCtx.Provider>;
}

/** Avanza el tiempo real; en pausa si la pestaña está oculta. */
function useReloj(dispatch, finalizado) {
  const ultimo = useRef(null);
  useEffect(() => {
    if (finalizado) return undefined;
    ultimo.current = performance.now();
    const id = setInterval(() => {
      const ahora = performance.now();
      const delta = ahora - ultimo.current;
      ultimo.current = ahora;
      if (RL.pausarSiPestanaOculta && document.hidden) return;
      dispatch({ type: "tick", delta: Math.min(delta, 1000) });
    }, 150);
    return () => clearInterval(id);
  }, [dispatch, finalizado]);
}

/** Ánimo de Andrea (marcador de productividad): 0 contenta, 1 impaciente, 2 estresada. */
export function animoDe(state) {
  if (state.pendientes.informe) return 0;
  if (state.minuto >= horaAMinutos("11:30")) return 2;
  if (state.minuto >= horaAMinutos("09:40")) return 1;
  return 0;
}

/** true mientras se puede usar ⏩ Seguir con mi día. */
export function puedeSeguir(state) {
  return state.corriendo && !state.adelanto && !hayCongelamiento(state) && !state.finalizado && !state.e7;
}

/** Pendientes visibles: los del inicio y los que ya aparecieron (guion 9.5). */
export function pendientesVisibles(state) {
  return pendientesGuion.filter((p) => !p.aparece || state.disparados[p.aparece]);
}

/** Sugerencias de mensaje disponibles en una conversación (guion 9.3). */
export function sugerenciasDe(state, conv) {
  return sugerencias.filter(
    (sg) =>
      sg.conv === conv &&
      state.disparados[sg.cuando.evento] &&
      !state.registro.acciones.some((x) => x.clave === sg.accion.clave && x.accion === sg.cuando.sin)
  );
}
