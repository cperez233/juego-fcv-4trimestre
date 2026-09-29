/**
 * Correos inocuos de relleno para que el buzón se vea real (docs/03_UI_ESCRITORIO.md, sección 2).
 * Todos de @fcv.org, con nombres ficticios. No cuentan para el puntaje.
 * Mismo formato de cuerpo que los correos de eventos.js.
 */
import { config } from "./config.js";

const { andrea, julian } = config.personas;
const yo = config.usuario.correo;

export const relleno = [
  {
    id: "r-donacion",
    carpeta: "entrada",
    fecha: "2026-09-28T06:40",
    leido: false,
    de: { nombre: "Comunicaciones Internas", correo: "comunicaciones@fcv.org" },
    para: yo,
    asunto: "Hoy: jornada de donación de sangre en el auditorio",
    cuerpo: [
      { tipo: "p", texto: "Te invitamos a la jornada de donación de sangre que se realizará hoy de 8:00 a.m. a 3:00 p.m. en el auditorio principal." },
      { tipo: "p", texto: "Recuerda desayunar antes de donar y traer tu documento de identidad." },
      { tipo: "firma", lineas: ["Comunicaciones Internas"] },
    ],
  },
  {
    id: "r-boletin",
    carpeta: "entrada",
    fecha: "2026-09-26T16:05",
    leido: true,
    de: { nombre: "Comunicaciones Internas", correo: "comunicaciones@fcv.org" },
    para: yo,
    asunto: "Boletín FCV al día — semana 39",
    cuerpo: [
      { tipo: "p", texto: "En esta edición: nuevos horarios de la cafetería, resultados de la encuesta de clima laboral y los cumpleaños del mes." },
      { tipo: "p", texto: "Gracias a todos los equipos que participaron en la semana de la seguridad del paciente." },
      { tipo: "firma", lineas: ["Comunicaciones Internas"] },
    ],
  },
  {
    id: "r-toner",
    carpeta: "entrada",
    fecha: "2026-09-25T15:30",
    leido: true,
    de: { nombre: "Mesa de Ayuda", correo: config.canales.mesaAyuda },
    para: yo,
    asunto: "Caso #47102 cerrado: cambio de tóner de la impresora",
    cuerpo: [
      { tipo: "p", texto: "Tu caso #47102 fue atendido y cerrado. Se realizó el cambio de tóner de la impresora del área." },
      { tipo: "p", texto: "Si el inconveniente continúa, puedes reabrir el caso desde la Mesa de Ayuda." },
      { tipo: "firma", lineas: ["Mesa de Ayuda"] },
    ],
  },
  // Guion 12.3: circular real del área (ya leída). Enseña el canal de reporte sin decirlo en la jornada. ✎
  {
    id: "r-seguridad",
    carpeta: "entrada",
    fecha: "2026-09-23T14:00",
    leido: true,
    de: { nombre: "Seguridad Informática", correo: config.canales.seguridad },
    para: yo,
    asunto: "¿Recibiste un correo sospechoso? Así nos avisas",
    cuerpo: [
      { tipo: "p", texto: "Que un correo llegue a tu bandeja no significa que sea seguro." },
      { tipo: "p", texto: "Si un mensaje te parece sospechoso, no hagas clic ni abras adjuntos: usa Reenviar y envíalo a seguridadinformatica@fcv.org. Así lo bloqueamos para todos." },
      { tipo: "p", texto: `También puedes escribirnos por WhatsApp al ${config.canales.whatsapp}.` },
      { tipo: "firma", lineas: ["Dirección de Ciberseguridad", "Seguridad Informática"] },
    ],
  },
  {
    id: "r-acta",
    carpeta: "entrada",
    fecha: "2026-09-25T10:12",
    leido: true,
    de: { nombre: "Paula Gómez", correo: "paula.gomez@fcv.org" },
    para: yo,
    asunto: "Acta reunión de área — 22 de septiembre",
    cuerpo: [
      { tipo: "p", texto: "Buenos días, comparto el acta de la reunión del lunes. Si ven algo por corregir, me avisan antes del miércoles." },
      { tipo: "firma", lineas: ["Paula Gómez"] },
    ],
    adjuntos: [{ id: "acta-22sep", nombre: "Acta_reunion_22sep.pdf", tamano: "236 KB", visor: "acta" }],
  },
  {
    id: "r-pausas",
    carpeta: "entrada",
    fecha: "2026-09-24T08:00",
    leido: true,
    de: { nombre: "Seguridad y Salud en el Trabajo", correo: "sst@fcv.org" },
    para: yo,
    asunto: "Recordatorio: pausas activas a las 10:00 a.m.",
    cuerpo: [
      { tipo: "p", texto: "Te recordamos que todos los días a las 10:00 a.m. tenemos cinco minutos de pausas activas. Tu cuerpo te lo agradecerá." },
      { tipo: "firma", lineas: ["Seguridad y Salud en el Trabajo"] },
    ],
  },
  {
    id: "r-circular",
    carpeta: "entrada",
    fecha: "2026-09-23T11:47",
    leido: true,
    de: { nombre: "Gestión de Calidad", correo: "calidad@fcv.org" },
    para: yo,
    asunto: "Circular 018: actualización de formatos del sistema de gestión documental",
    cuerpo: [
      { tipo: "p", texto: "A partir del 1 de octubre entran en vigencia las nuevas versiones de los formatos institucionales. Las versiones anteriores dejarán de recibirse." },
      { tipo: "p", texto: "Los formatos actualizados están disponibles en la intranet, sección Calidad." },
      { tipo: "firma", lineas: ["Gestión de Calidad"] },
    ],
  },
  {
    id: "r-energia",
    carpeta: "entrada",
    fecha: "2026-09-22T14:20",
    leido: true,
    de: { nombre: "Infraestructura", correo: "infraestructura@fcv.org" },
    para: yo,
    asunto: "Corte programado de energía — sábado 3 de octubre",
    cuerpo: [
      { tipo: "p", texto: "Informamos que el sábado 3 de octubre, entre las 6:00 a.m. y las 10:00 a.m., habrá un corte programado de energía en el bloque administrativo por mantenimiento." },
      { tipo: "p", texto: "Por favor apaga tu equipo al terminar la jornada del viernes." },
      { tipo: "firma", lineas: ["Infraestructura"] },
    ],
  },
  {
    id: "r-reunion",
    carpeta: "entrada",
    fecha: "2026-09-22T07:55",
    leido: true,
    de: { nombre: andrea.nombre, correo: andrea.correo },
    para: yo,
    asunto: "Reunión de seguimiento — viernes 9:00 a.m.",
    cuerpo: [
      { tipo: "p", texto: "Hola a todos, el viernes a las 9:00 a.m. hacemos la reunión de seguimiento del área en la sala 2. Traigan sus pendientes de la semana." },
      { tipo: "firma", lineas: [andrea.nombre, andrea.cargo] },
    ],
  },
  {
    id: "r-bienestar",
    carpeta: "entrada",
    fecha: "2026-09-21T09:30",
    leido: true,
    de: { nombre: "Bienestar Institucional", correo: "bienestar@fcv.org" },
    para: yo,
    asunto: "Inscripciones abiertas: jornada de bienestar",
    cuerpo: [
      { tipo: "p", texto: "Ya están abiertas las inscripciones para la jornada de bienestar de este mes. Consulta con tu jefe inmediato el horario que le corresponde a tu área." },
      { tipo: "firma", lineas: ["Bienestar Institucional"] },
    ],
  },

  // Enviados
  {
    id: "r-env-reunion",
    carpeta: "enviados",
    fecha: "2026-09-22T08:10",
    leido: true,
    de: { nombre: config.usuario.nombre, correo: yo },
    para: andrea.correo,
    asunto: "RE: Reunión de seguimiento — viernes 9:00 a.m.",
    cuerpo: [{ tipo: "p", texto: "Recibido, Andrea. Allá estaré." }],
  },
  {
    id: "r-env-turno",
    carpeta: "enviados",
    fecha: "2026-09-19T12:02",
    leido: true,
    de: { nombre: config.usuario.nombre, correo: yo },
    para: julian.correo,
    asunto: "Turno de almuerzo",
    cuerpo: [{ tipo: "p", texto: "Julián, ¿me cambias el turno de almuerzo del jueves? Tengo cita médica a la 1:00 p.m." }],
  },

  // Borradores
  {
    id: "r-borrador-permiso",
    carpeta: "borradores",
    fecha: "2026-09-25T17:40",
    leido: true,
    de: { nombre: config.usuario.nombre, correo: yo },
    para: andrea.correo,
    asunto: "Solicitud de permiso — 9 de octubre",
    cuerpo: [{ tipo: "p", texto: "Hola Andrea, quería solicitarte permiso para el viernes 9 de octubre en la mañana por" }],
  },
];

// Contenido de los adjuntos que se pueden abrir (visor sencillo, solo lectura).
export const documentos = {
  programacion: {
    titulo: "Programacion_octubre.xlsx",
    tipo: "hoja",
    columnas: ["Semana", "Actividad", "Responsable", "Fecha límite"],
    filas: [
      ["1", "Cierre de indicadores de septiembre", "Todo el equipo", "2 de octubre"],
      ["1", "Reunión de seguimiento", "Andrea Rincón", "2 de octubre"],
      ["2", "Actualización de formatos de calidad", "Tú", "9 de octubre"],
      ["3", "Inventario de insumos de oficina", "Julián Ortiz", "16 de octubre"],
      ["4", "Informe mensual de gestión", "Tú", "30 de octubre"],
    ],
  },
  acta: {
    titulo: "Acta_reunion_22sep.pdf",
    tipo: "texto",
    parrafos: [
      "Acta de reunión de área · 22 de septiembre de 2026",
      "Asistentes: equipo del área. Temas: seguimiento de pendientes, programación de octubre y jornada de bienestar.",
      "Compromisos: enviar el informe mensual en PDF a la coordinación y revisar la programación de octubre cuando se comparta.",
    ],
  },
};
