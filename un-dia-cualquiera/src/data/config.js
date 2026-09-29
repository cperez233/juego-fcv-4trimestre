/**
 * Configuración del juego. Todo lo ajustable sin tocar lógica.
 * Fuente: docs/02_GUION.md (secciones 0, 3, 4 y 6).
 */
export const config = {
  juego: "un-dia-cualquiera",
  version: "5.11",

  // Fecha simulada de la jornada. "Lunes" (P2) y "programación del próximo mes: octubre" (E2).
  fechaJuego: "2026-09-28",

  // Ritmo por eventos (guion 8.2): el reloj se calma cuando llega algo y se adelanta cuando se resuelve.
  reloj: {
    inicio: "07:00",
    fin: "13:00",
    // Guion 14.1 y 15.1: el reloj nunca se detiene. Ritmo normal: 1 min de juego cada 1,1 s reales (la mañana
    // completa sin adelantos serían ~6,5 min). Solo se adelanta rápido (⏩) cuando no hay nada en curso.
    msPorMinuto: 1100,
    // Guion 18.2: arranque más suave para quien juega por primera vez.
    msPorMinutoInicio: 1600,
    suaveHasta: "09:00",
    msAdelanto: 2200, // duración de la animación ⏩ hasta el siguiente evento
    esperaTrasResolverMs: 2000, // tras atender algo, unos segundos a ritmo normal antes de adelantar
    esperaInicialMs: 5000, // al empezar, tiempo para mirar el escritorio antes del primer evento
    esperaTrasLeerMs: 5000, // si solo lo leyó (sin reportar, eliminar…), unos segundos más antes de adelantar
    esperaMaxEventoMs: 10000, // si nadie abre lo nuevo en 15 s y no está en nada, el día puede adelantarse
    // Guion 13.2: no adelantar mientras el jugador está en algo.
    actividadMs: 5000, // un clic, tecla o rueda dentro de algo abierto en los últimos 5 s = está trabajando
    chatPorResponderMs: 15000, // una pregunta del chat sin responder frena el adelanto hasta 15 s
    separacionEventosMs: 4000, // dos eventos no llegan en el mismo instante
    separacionMensajesMs: 4000, // los mensajes del chat llegan espaciados
    pausarSiPestanaOculta: true,
    saltoDistraccionMin: 15, // cada distracción (videos, noticias, tienda) se come 15 min del día (guion 9.4)
  },

  e7: {
    // "E7 dura máx. 30 s reales; si no hay acción, se aplica 'No hacer nada'."
    duracionMaxSeg: 30,
    // 7A: Julián escribe a los 10 s del incidente y hay 20 s para responderle (guion 9.6).
    julianA: { aLosSeg: 10, duracionSeg: 20 },
  },

  // Bandera PRISA: error en E1 o E5 con tiempo de decisión menor a este valor.
  prisaUmbralMs: 10000,

  // Puntaje máximo (guion 10.1): 37 por eventos + 7 pendientes.
  puntajeMaximo: 49,
  umbralPasivo: 0.5, // perfil "El que dejó pasar el día" si no cayó y sacó menos de la mitad (guion 18.3)
  // Distracciones: −1 productividad por sitio, máximo −3 (guion 9.4).
  distraccionesMax: 3,

  dominioInstitucional: "fcv.org",
  webmail: "webmail.fcv.org",

  // Jugador por defecto (modo práctica). En la partida oficial se arma con el ingreso (guion 8.1).
  usuario: {
    nombre: "Tu usuario",
    correo: "tu.usuario@fcv.org",
  },

  // Documento: solo dígitos, entre estos largos.
  documento: { min: 5, max: 12 },

  // Canales institucionales (docs/01_CONTEXTO.md).
  canales: {
    seguridad: "seguridadinformatica@fcv.org",
    whatsapp: "300 779 3096",
    mesaAyuda: "helpdesk@fcv.org",
  },

  // Personajes ficticios (guion, sección 0). No usar nombres reales.
  personas: {
    andrea: { nombre: "Andrea Rincón", cargo: "Coordinación de área", correo: "andrea.rincon@fcv.org" },
    julian: { nombre: "Julián Ortiz", correo: "julian.ortiz@fcv.org" },
    camila: { nombre: "Camila Rojas", correo: "camila.rojas@fcv.org" },
    // E12: número que se hace pasar por Andrea (ficticio).
    desconocido: { nombre: "+57 318 555 0142", desconocido: true },
    // E16: "soporte técnico" falso (ficticio).
    soporte: { nombre: "+57 320 555 0187", desconocido: true },
  },

  // Únicos contactos que ofrece el autocompletar al reenviar o redactar.
  contactos: [
    { nombre: "Seguridad Informática", correo: "seguridadinformatica@fcv.org" },
    { nombre: "Mesa de Ayuda", correo: "helpdesk@fcv.org" },
    { nombre: "Andrea Rincón", correo: "andrea.rincon@fcv.org" },
    { nombre: "Julián Ortiz", correo: "julian.ortiz@fcv.org" },
    { nombre: "Camila Rojas", correo: "camila.rojas@fcv.org" },
  ],
};
