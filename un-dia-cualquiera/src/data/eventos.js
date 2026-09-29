/**
 * Eventos de la jornada (E1–E7), pendientes, chat y textos del rebobinado.
 * Fuente: docs/02_GUION.md v4.0. Si este archivo y el guion discrepan, gana el guion.
 *
 * Convenciones:
 *  - hora: hora del reloj del juego ("HH:MM", 24 h).
 *  - cuerpo de correo: lista de bloques. **así** = negrita.
 *      { tipo: "p", texto } · { tipo: "boton", enlace, texto } · { tipo: "firma", lineas: [] }
 *  - enlaces: { id, texto, url }. La url es solo texto: el juego nunca navega a ella.
 *  - Las reglas de puntaje viven en src/engine/puntaje.js; aquí están los valores de referencia
 *    y todos los textos.
 *  - ✎ = texto redactado para el juego (no estaba en el guion v3.1); revisar con Cristian.
 */
import { config } from "./config.js";

const { andrea, julian } = config.personas;
const seg = config.canales.seguridad;
const wa = config.canales.whatsapp;

// Frases textuales del documento base "Errores humanos en la red".
export const frases = {
  correo: "Que un correo llegue a tu bandeja no significa que sea seguro.",
  consignaCorreo: "Remitente → Mensaje → Enlace/Adjunto → Acción solicitada.",
  navegacion: "No confíes en una página únicamente por su apariencia.",
  descargas: "Prioriza siempre fuentes oficiales o institucionalmente autorizadas.",
  alertas: "“Cerrar y continuar” no siempre es la respuesta. Lee → Verifica → Decide.",
  reaccion: "Un error reportado a tiempo puede evitar un incidente mayor.",
  noOcultes: "No ocultes el error ni esperes a ver qué ocurre.",
  dondeEntras: "¿Realmente sabes dónde estás entrando?",
  inesperado: "Revisa cualquier mensaje inesperado antes de interactuar con él.",
};

// Etiquetas 🏷 de error, de la más grave a la menos grave (E7A, guion 9.6).
export const etiquetasPorGravedad = ["MALWARE", "CREDENCIALES_BANCO", "CREDENCIALES", "FRAUDE", "EXTENSION", "PERMISOS"];

/**
 * Pendientes del día (guion 9.5). +1 cada uno si se completa de forma segura y a tiempo.
 * aparece: evento que lo agrega a la lista (si no, está desde el inicio). limite: "HH:MM".
 */
export const pendientes = [
  // donde: pista de en qué programa se hace (guion 10.2). No dice cuál es el camino seguro.
  { id: "informe", texto: "Enviar el informe mensual en PDF a Andrea", donde: "El informe está en Documentos · se envía por Correo", evento: "E5", limite: "12:00" },
  { id: "beneficios", texto: "Actualizar tus datos en el portal de beneficios", donde: "Se hace en el Navegador", evento: "E4" },
  // Guion 20.1: vuelve; se cumple al revisar los dos correos que llegan a Spam (lo que hagas con ellos se puntúa en E3).
  { id: "spam", texto: "Revisar la carpeta Spam", donde: "En el Correo, carpeta Spam", evento: "E3", aparece: "E3" },
  { id: "capacitacion", texto: "Inscribirte en la capacitación obligatoria", donde: "Te llegó por Correo", evento: "E8", aparece: "E8", limite: "10:00" },
  { id: "impresora", texto: "Reportar la impresora dañada", donde: "Se hace en Mesa de Ayuda", evento: "E11", aparece: "E11" },
  { id: "vacaciones", texto: "Enviar la solicitud de vacaciones a Andrea", donde: "Busca el formato en el Navegador", evento: "E13", aparece: "E13" },
  // v5.6 (guion 15.2): tarea de trabajador.
  { id: "reservar", texto: "Reservar la sala para la reunión de área del jueves", donde: "Se hace en la Intranet", evento: "E15", aparece: "E15" },
];

/**
 * Conversaciones del chat (guion 9.3). Cada una es una clave de config.personas o "grupo".
 */
export const conversaciones = {
  andrea: { nombre: andrea.nombre, subtitulo: andrea.cargo },
  julian: { nombre: julian.nombre, subtitulo: "Compañero de área" },
  grupo: { nombre: "Área administrativa", subtitulo: "Andrea, Camila, Julián y tú", grupo: true },
  desconocido: { nombre: "+57 318 555 0142", subtitulo: "No está en tus contactos", desconocido: true },
  soporte: { nombre: "+57 320 555 0187", subtitulo: "No está en tus contactos", desconocido: true },
};

/**
 * Chat interno. "de" es una clave de config.personas; conv es la conversación (por defecto, "de").
 * opciones: respuestas de un toque. accion: lo que se registra ({ clave, accion }).
 * respuesta: lo que contesta el otro. luego: mensaje siguiente del otro, con sus propias opciones.
 * condicion: "informePendiente" | "informeEnviado" → solo aparece si se cumple.
 * ✎ Las opciones de Julián y del número desconocido son difíciles a propósito (guion 9.2).
 */
export const chat = [
  {
    id: "c-andrea-1",
    hora: "07:05",
    de: "andrea",
    texto: "Buenos días. Hoy necesito el informe mensual en PDF antes del mediodía, porfa 🙏",
    opciones: [
      { id: "si", texto: "¡Claro! Te lo mando apenas pueda 👍", respuesta: "Gracias 🙏" },
      { id: "ok", texto: "Ok" },
    ],
  },
  {
    id: "c-andrea-sala",
    hora: "08:00",
    de: "andrea",
    evento: "E15",
    // ✎ Guion 15.2 — tarea sin trampa.
    texto: "¿Me haces un favor? Resérvame la sala de juntas para la reunión de área del jueves a las 9:00. Se hace en la intranet 🙏",
    opciones: [{ id: "ok", texto: "Dale, ya la reservo 👍" }],
  },
  { id: "c-grupo-1", hora: "07:30", de: "camila", conv: "grupo", texto: "Buenos días equipo ☀️ ¿Alguien sabe si hoy hay reunión de área?" },
  { id: "c-grupo-2", hora: "07:32", de: "julian", conv: "grupo", texto: "Creo que es el jueves 🤔" },
  {
    id: "c-grupo-video",
    hora: "08:10",
    de: "camila",
    conv: "grupo",
    evento: "E9",
    texto: "JAJAJAJA miren este perrito haciendo fila en el banco 😂😂 clipsvirales-hoy.net/perrito-banco",
    enlace: { texto: "clipsvirales-hoy.net/perrito-banco", pagina: "video" },
  },
  { id: "c-grupo-3", hora: "08:11", de: "julian", conv: "grupo", texto: "🤣🤣🤣 no puede ser" },
  {
    id: "c-julian-clave",
    hora: "09:00",
    de: "julian",
    evento: "E10",
    texto: "Oye, se me bloqueó la clave del correo y Andrea me pidió el reporte de asistencia para ya 😩 ¿Me prestas la tuya 5 minutos? Te juro que no miro nada más",
    opciones: [
      { id: "prestar_sesion", texto: "Ven y úsala en mi equipo, yo te dejo la sesión abierta", accion: { clave: "E10", accion: "prestar_sesion" }, respuesta: "¡Eres un sol! Ya voy 🏃‍♂️" },
      { id: "mesa", texto: "No te puedo prestar mi clave 😅 Llama a Mesa de Ayuda, ellos te la desbloquean rápido", accion: { clave: "E10", accion: "mesa" }, respuesta: "Uff, tienes razón. Ya los llamo 👍" },
      { id: "dar_clave", texto: "Dale, te la paso por aquí, pero bórrala después 🙈", accion: { clave: "E10", accion: "dar_clave" }, respuesta: "¡Gracias! Ya la anoté 🙌" },
      { id: "negar", texto: "Uy, no, sorry", accion: { clave: "E10", accion: "negar" }, respuesta: "Bueno… 😕" },
    ],
  },
  {
    id: "c-julian-e4",
    hora: "10:05",
    de: "julian",
    evento: "E4",
    texto: "¡Ya salió el portal de bonos de Bienestar! 🎉 Lo mandaron por el grupo de WhatsApp de la sede: fcv-beneficios-colaboradores.com. Yo ya reclamé el mío 😄",
    enlace: { texto: "fcv-beneficios-colaboradores.com", pagina: "beneficios-falso" },
    opciones: [
      {
        id: "candado",
        texto: "Tiene candado 🔒, entonces es confiable, ¿cierto?",
        respuesta: "Obvio, tiene candado y todo 😎",
      },
      {
        id: "advertir",
        texto: "¿Seguro que es de la FCV? La dirección no termina en fcv.org 🤔",
        accion: { clave: "E4", accion: "advertir_julian" },
        respuesta: "Mmm… ahora que lo dices 😬 Me lo pasaron por un grupo. Ya no lo comparto más.",
      },
      { id: "gracias", texto: "¡Uy, gracias! Ya entro 😄", respuesta: "¡Apúrate que se acaban! 🏃‍♂️" },
    ],
  },
  {
    id: "c-andrea-2",
    hora: "09:40",
    de: "andrea",
    condicion: "informePendiente",
    texto: "¿Cómo vas con el informe?",
    opciones: [
      { id: "casi", texto: "Ya casi 💪", respuesta: "Dale, que lo necesito ya." },
      { id: "eso", texto: "Estoy en eso" },
    ],
  },
  {
    id: "c-soporte",
    hora: "09:35",
    de: "soporte",
    evento: "E16",
    // ✎ Guion 15.2 — "soporte técnico" falso (diapositiva 4: instalar programas sin autorización).
    texto: "Buenos días 👨‍💻 Le escribe Soporte Técnico de la FCV. Estamos actualizando los equipos del área administrativa y necesito revisar el suyo en remoto. Instale esta herramienta: soporte-remoto-fcv.com/descarga y me avisa. Es rapidito.",
    enlace: { texto: "soporte-remoto-fcv.com/descarga", pagina: "soporte-remoto" },
    opciones: [
      {
        id: "aceptar",
        texto: "Listo, ya la instalo",
        accion: { clave: "E16", accion: "aceptar" },
        respuesta: "Perfecto 👍 Si le sale un aviso de seguridad, dele “Permitir”, es normal.",
      },
      {
        id: "verificar",
        texto: "¿Me lo confirma por Mesa de Ayuda? Primero abro un caso",
        accion: { clave: "E16", accion: "verificar" },
        respuesta: "No hace falta caso, es urgente 😅 Solo instálela.",
      },
      { id: "negar", texto: "No instalo nada por aquí, gracias", accion: { clave: "E16", accion: "negar" }, respuesta: "Como quiera. Después no diga que no le avisamos." },
    ],
  },
  {
    id: "c-andrea-impresora",
    hora: "09:50",
    de: "andrea",
    evento: "E11",
    texto: "La impresora del área dejó de imprimir 🙄 ¿Me haces el favor de reportarla en Mesa de Ayuda?",
    opciones: [
      { id: "ya", texto: "Ya mismo 👍" },
      { id: "listo", texto: "Listo" },
    ],
  },
  { id: "c-grupo-4", hora: "10:12", de: "camila", conv: "grupo", texto: "Hay torta en la cafetería por el cumpleaños de don Álvaro 🎂" },
  {
    id: "c-andrea-e5",
    hora: "10:20",
    de: "andrea",
    evento: "E5",
    condicion: "informePendiente",
    texto: "Necesito ese informe en PDF YA. Si no sabes cómo pasarlo a PDF, búscate un conversor en internet, eso es rapidito 🙏",
    opciones: [{ id: "voy", texto: "Voy 🏃" }],
  },
  {
    id: "c-falsa-andrea",
    hora: "10:50",
    de: "desconocido",
    evento: "E12",
    texto: "Hola, soy Andrea 👋 Este es mi número nuevo, guárdalo. Estoy en reunión con dirección y no puedo hablar. Necesito que me ayudes con algo urgente: comprar 3 tarjetas de regalo de $100.000 para los cumpleaños del área. Te las devuelvo hoy mismo 🙏",
    opciones: [
      {
        id: "comprar",
        texto: "Claro, ¿dónde las compro?",
        accion: { clave: "E12", accion: "comprar" },
        luego: {
          texto: "En cualquier tienda en línea. Cuando las tengas, me mandas fotos de los códigos por aquí. ¡Mil gracias! 🙏",
          opciones: [
            { id: "enviar", texto: "Listo, ahí van los códigos 📸", accion: { clave: "E12", accion: "enviar_codigos" }, respuesta: "Perfecto ❤️ ¿Podrías comprar 2 más? Es que se me olvidaron unos." },
            { id: "dudar", texto: "Mmm, mejor te lo confirmo cuando salgas de la reunión", accion: { clave: "E12", accion: "posponer" }, respuesta: "Es que es para YA 😡" },
          ],
        },
      },
      {
        id: "preguntar",
        texto: "¿Andrea? ¿Por qué cambiaste de número?",
        accion: { clave: "E12", accion: "preguntar" },
        luego: {
          texto: "Se me dañó el celular 😩 Porfa, es urgente, en serio no puedo hablar ahora.",
          opciones: [
            { id: "comprar2", texto: "Bueno, dale, ¿de cuánto?", accion: { clave: "E12", accion: "comprar" }, respuesta: "De $100.000 cada una. Me mandas los códigos por aquí 🙏" },
            { id: "confirmo", texto: "Te confirmo por el chat de siempre 👍", accion: { clave: "E12", accion: "posponer" }, respuesta: "No, no, por allá no puedo 😬" },
          ],
        },
      },
      { id: "luego", texto: "Ahora no puedo, estoy con el informe", accion: { clave: "E12", accion: "posponer" }, respuesta: "Porfa, es rapidito 🙏 me urge" },
    ],
  },
  { id: "c-andrea-3", hora: "11:30", de: "andrea", condicion: "informePendiente", texto: "¿¿Ya??", opciones: [{ id: "ya", texto: "¡Ya casi!" }] },
  {
    id: "c-andrea-vacaciones",
    hora: "11:40",
    de: "andrea",
    evento: "E13",
    texto: "Otra cosa: mándame hoy tu solicitud de vacaciones de diciembre, porfa. Hay un formato nuevo, búscalo 🙏",
    opciones: [{ id: "ok", texto: "Listo, ya la busco" }],
  },
  { id: "c-grupo-5", hora: "11:50", de: "camila", conv: "grupo", texto: "¿Almorzamos a las 12:30? 🍲" },
];

/**
 * Mensajes que el jugador puede iniciar (respuestas rápidas en una conversación).
 * cuando: { evento, sin } → aparece si el evento ya llegó y todavía no se registró la acción "sin".
 */
export const sugerencias = [
  {
    id: "s-andrea-numero",
    conv: "andrea",
    cuando: { evento: "E12", sin: "verificar_andrea" },
    texto: "Andrea, ¿me acabas de escribir desde otro número?",
    accion: { clave: "E12", accion: "verificar_andrea" },
    respuesta: "¿Qué? No, yo no he cambiado de número 😳 No le respondas y repórtalo a Seguridad Informática, porfa.",
  },
];

// Respuestas automáticas por lo que envía el jugador (✎).
export const reacciones = {
  informePdf: { de: "andrea", texto: "¡Recibido, mil gracias! 🙌" },
  informeDocx: { de: "andrea", texto: "Me llegó en Word 😅 Lo necesito en PDF, porfa." },
  programacion: { de: "andrea", texto: "Perfecto, gracias por revisarla 👌" },
  vacaciones: { de: "andrea", texto: "¡Recibí tu solicitud de vacaciones! Ya la apruebo ✅" },
};

// Ánimo de Andrea (marcador de productividad, guion 8.3).
export const animoAndrea = [
  { id: "feliz", emoji: "😊", texto: "Contenta" },
  { id: "neutral", emoji: "😐", texto: "Impaciente" },
  { id: "molesta", emoji: "😤", texto: "Estresada" },
];

// ───────────────────────────── Eventos ─────────────────────────────
// Orden por hora (guion 9.1). categoria decide el punto débil.
export const eventos = [
  {
    id: "E1",
    hora: "07:10",
    titulo: "\"Gestión Humana\"",
    naturaleza: "trampa",
    categoria: "correo",
    maximo: 3,
    correo: {
      id: "m-e1",
      carpeta: "entrada",
      de: { nombre: "Gestión Humana FCV", correo: "nomina@fcv-nomina.co" },
      asunto: "Actualización de datos para el pago de nómina — octubre",
      // Guion 9.2: el pie de aviso legal está copiado del real.
      avisoLegal: true,
      cuerpo: [
        { tipo: "p", texto: "Estimado(a) colaborador(a):" },
        { tipo: "p", texto: "Con motivo de la migración de la plataforma de pagos, le solicitamos validar sus datos de acceso para que el pago de nómina de octubre se realice sin inconvenientes." },
        { tipo: "p", texto: "Si la validación no se realiza antes del **30 de septiembre**, el pago podría presentar retrasos." },
        { tipo: "boton", enlace: "confirmar-datos", texto: "Validar mis datos" },
        { tipo: "firma", lineas: ["Cordialmente,", "Gestión Humana — Nómina", "Fundación Cardiovascular de Colombia"] },
      ],
      enlaces: [{ id: "confirmar-datos", texto: "Validar mis datos", url: "https://portal.fcv-nomina.co/acceso", pagina: "login-falso" }],
    },
  },
  {
    id: "E2",
    hora: "07:25",
    titulo: "Correo real de la jefa",
    naturaleza: "legitimo",
    categoria: "correo",
    maximo: 2,
    correo: {
      id: "m-e2",
      carpeta: "entrada",
      de: { nombre: andrea.nombre, correo: andrea.correo },
      asunto: "Programación de actividades — octubre",
      avisoLegal: true,
      cuerpo: [
        { tipo: "p", texto: "Hola, te comparto la programación del próximo mes. Revísala y me confirmas si hay algún cambio." },
        { tipo: "firma", lineas: [andrea.nombre, andrea.cargo] },
      ],
      adjuntos: [{ id: "programacion-octubre", nombre: "Programacion_octubre.xlsx", tamano: "18 KB", visor: "programacion" }],
    },
  },
  {
    // ✎ Guion 9.4: correo legítimo con enlace. Contraste con E1: @fcv.org, te saluda por tu nombre, no pide clave.
    id: "E8",
    hora: "07:45",
    titulo: "Capacitación obligatoria",
    naturaleza: "legitimo",
    categoria: "correo",
    maximo: 2,
    correo: {
      id: "m-e8",
      carpeta: "entrada",
      de: { nombre: "Talento Humano FCV", correo: "talentohumano@fcv.org" },
      asunto: "Capacitación obligatoria: Humanización en la atención — inscríbete antes de las 10:00 a.m.",
      avisoLegal: true,
      cuerpo: [
        { tipo: "p", texto: "Hola, {nombre}:" },
        { tipo: "p", texto: "Ya están abiertas las inscripciones a la capacitación obligatoria **Humanización en la atención**. Elige la sesión que mejor se acomode a tu horario en la intranet. Las inscripciones cierran hoy a las **10:00 a.m.**" },
        { tipo: "boton", enlace: "inscripcion", texto: "Inscribirme" },
        { tipo: "p", texto: "No necesitas escribir tu contraseña: entras con tu sesión de la intranet." },
        { tipo: "firma", lineas: ["Talento Humano", "Fundación Cardiovascular de Colombia"] },
      ],
      enlaces: [{ id: "inscripcion", texto: "Inscribirme", url: "https://intranet.fcv.org/capacitaciones/humanizacion", pagina: "intranet", seccion: "capacitaciones" }],
    },
  },
  {
    id: "E9",
    hora: "08:10",
    titulo: "El video del grupo",
    naturaleza: "trampa",
    categoria: "descargas",
    maximo: 1,
  },
  {
    id: "E3",
    hora: "08:30",
    titulo: "Carpeta Spam",
    naturaleza: "mixto",
    categoria: "correo",
    maximo: 3,
    notificacion: "Tienes 2 mensajes nuevos en Spam.",
    correos: [
      {
        id: "m-e3a",
        parte: "3A",
        carpeta: "spam",
        de: { nombre: "Documentos Compartidos", correo: "notificaciones@docs-compartidos.net" },
        asunto: "Tienes un documento pendiente de firma",
        avisoLegal: false,
        cuerpo: [{ tipo: "p", texto: "Se ha compartido contigo un documento. Descárgalo para revisarlo y firmarlo hoy." }],
        adjuntos: [{ id: "acta-firma", nombre: "Acta_pendiente_firma.pdf.zip", tamano: "412 KB", peligroso: true }],
      },
      {
        id: "m-e3b",
        parte: "3B",
        carpeta: "spam",
        de: { nombre: "Bienestar Institucional", correo: "bienestar@fcv.org" },
        asunto: "Confirmación de inscripción — Jornada de bienestar",
        avisoLegal: true,
        cuerpo: [
          { tipo: "p", texto: "Tu inscripción quedó confirmada para el jueves a las 2:00 p.m. No debes descargar ni diligenciar nada." },
          { tipo: "firma", lineas: ["Bienestar Institucional"] },
        ],
      },
    ],
    // ✎ Qué pasa al abrir el .zip: nada visible (el daño se ve en E7).
    errorZip: "No se puede abrir el archivo: está dañado o en un formato no compatible.",
  },
  {
    // Guion 10.1 (documento base, diapositiva 6: "revisar cualquier mensaje inesperado").
    // 14A: la encuesta real de un caso que sí abriste. 14B: un aviso inesperado que pide tu clave.
    id: "E14",
    hora: "08:50",
    titulo: "Dos correos de \"Mesa de Ayuda\"",
    naturaleza: "mixto",
    categoria: "correo",
    maximo: 3,
    correos: [
      {
        id: "m-e14a",
        parte: "14A",
        carpeta: "entrada",
        de: { nombre: "Mesa de Ayuda", correo: "helpdesk@fcv.org" },
        asunto: "¿Cómo te atendimos? Encuesta del caso #47102",
        avisoLegal: true,
        cuerpo: [
          { tipo: "p", texto: "Hola, {nombre}:" },
          { tipo: "p", texto: "Tu caso **#47102 (cambio de tóner de la impresora)** quedó cerrado. Cuéntanos cómo te atendimos; toma menos de un minuto." },
          { tipo: "boton", enlace: "encuesta", texto: "Responder la encuesta" },
          { tipo: "firma", lineas: ["Mesa de Ayuda"] },
        ],
        enlaces: [{ id: "encuesta", texto: "Responder la encuesta", url: "https://intranet.fcv.org/encuestas/47102", pagina: "intranet", seccion: "encuesta" }],
      },
    ],
  },
  {
    // Guion 21: el correo falso de "Mesa de Ayuda" llega aparte, 25 minutos después de la encuesta real.
    id: "E14B",
    hora: "09:15",
    titulo: "\"Tu buzón está al 98 %\"",
    naturaleza: "trampa",
    categoria: "correo",
    maximo: 0, // se puntúa dentro de E14 (parte 14B)
    correos: [
      {
        id: "m-e14b",
        parte: "14B",
        carpeta: "entrada",
        de: { nombre: "Mesa de Ayuda FCV", correo: "soporte@mesadeayuda-fcv.com" },
        asunto: "Tu buzón está al 98 % — valida tu cuenta para seguir recibiendo correos",
        avisoLegal: false,
        cuerpo: [
          { tipo: "p", texto: "Estimado usuario:" },
          { tipo: "p", texto: "Su buzón de correo alcanzó el **98 %** de su capacidad. Para evitar la suspensión de su cuenta y la pérdida de mensajes, valide su acceso en las próximas 24 horas." },
          { tipo: "boton", enlace: "validar", texto: "Validar mi cuenta" },
          { tipo: "firma", lineas: ["Soporte técnico", "Mesa de Ayuda"] },
        ],
        enlaces: [{ id: "validar", texto: "Validar mi cuenta", url: "https://mesadeayuda-fcv.com/webmail/validar", pagina: "login-buzon" }],
      },
    ],
  },
  {
    id: "E10",
    hora: "09:00",
    titulo: "Julián pide tu clave",
    naturaleza: "trampa",
    categoria: "personas",
    maximo: 3,
  },
  {
    id: "E4",
    hora: "10:05",
    titulo: "Portal de beneficios",
    naturaleza: "trampa",
    categoria: "navegacion",
    maximo: 4,
  },
  {
    id: "E11",
    hora: "09:50",
    titulo: "La impresora",
    naturaleza: "tarea",
    categoria: "tarea",
    maximo: 0,
  },
  {
    id: "E5",
    hora: "10:20",
    titulo: "Informe en PDF",
    naturaleza: "trampa",
    categoria: "descargas",
    maximo: 3,
  },
  {
    id: "E15",
    hora: "08:00",
    titulo: "Reservar la sala",
    naturaleza: "tarea",
    categoria: "tarea",
    maximo: 0,
  },
  {
    id: "E16",
    hora: "09:35",
    titulo: "\"Soporte técnico\" por chat",
    naturaleza: "trampa",
    categoria: "descargas",
    maximo: 3,
  },
  {
    id: "E17",
    hora: "12:40",
    titulo: "\"Tu navegador está desactualizado\"",
    naturaleza: "trampa",
    categoria: "alertas",
    maximo: 2,
  },
  {
    id: "E12",
    hora: "10:50",
    titulo: "\"Andrea\" desde otro número",
    naturaleza: "trampa",
    categoria: "personas",
    maximo: 3,
  },
  {
    id: "E6",
    hora: "11:15",
    titulo: "\"Tu conexión no es privada\"",
    naturaleza: "trampa",
    categoria: "navegacion",
    maximo: 3,
    correo: {
      id: "m-e6",
      carpeta: "entrada",
      de: { nombre: "Suministros Andinos S.A.S.", correo: "ventas@suministrosandinos.com.co" },
      // ✎
      asunto: "Catálogo actualizado — pedido de octubre",
      avisoLegal: false,
      cuerpo: [
        { tipo: "p", texto: "Buenos días." },
        { tipo: "p", texto: "Como cada mes, les compartimos el catálogo actualizado de insumos de oficina para que puedan hacer el pedido de octubre antes del viernes." },
        { tipo: "boton", enlace: "catalogo", texto: "Ver catálogo" },
        { tipo: "firma", lineas: ["Cordialmente,", "Marcela Duarte", "Asesora comercial · Suministros Andinos S.A.S."] },
      ],
      enlaces: [{ id: "catalogo", texto: "Ver catálogo", url: "https://catalogo.suministrosandinos.com.co/octubre", pagina: "certificado" }],
    },
  },
  {
    id: "E13",
    hora: "11:40",
    titulo: "Solicitud de vacaciones",
    naturaleza: "trampa",
    categoria: "navegacion",
    maximo: 2,
  },
  {
    id: "E7",
    hora: "12:15",
    titulo: "El momento de la verdad",
    categoria: "reaccion",
    maximo: 5,
  },
];

// Pseudo-evento: distracciones y trampas de la navegación libre (sin hora ni máximo).
export const extras = { id: "EX", titulo: "Navegación libre", categoria: "descargas", maximo: 0 };

export const eventoPorId = Object.fromEntries([...eventos, extras].map((e) => [e.id, e]));

// ───────────────────────────── Navegador ─────────────────────────────
// Páginas simuladas. Ningún dominio es un enlace real. ✎ Contenido de las páginas nuevas (guion 9.4).
export const navegador = {
  inicio: "Nueva pestaña",
  buscador: {
    titulo: "Buscar en la web",
    placeholder: "Busca o escribe una dirección",
    sugerencias: ["convertir a PDF", "formato solicitud de vacaciones", "clima Floridablanca"],
    sinResultados: (q) => `No encontramos resultados para “${q}”. Prueba con otras palabras.`,
    resultadosDe: (n) => `Cerca de ${n} resultados`,
    patrocinado: "Patrocinado",
    // Consultas: la primera cuyo patrón coincida decide los resultados.
    consultas: [
      {
        id: "pdf",
        patron: "pdf|convert|word|docx|informe",
        total: "1.240.000",
        resultados: [
          {
            id: "programa",
            titulo: "PDF Converter PRO 2026 — Versión completa GRATIS",
            url: "descargas-full-pro.net › pdf-converter-pro",
            descripcion: "Convierte Word, Excel e imágenes a PDF en segundos. ¡Versión PRO completa sin licencia! Descarga directa, rápida y 100 % gratis.",
            pagina: "programa",
          },
          {
            id: "extension",
            titulo: "Extensión Conversor Rápido — Convierte a PDF desde tu navegador",
            url: "Tienda de extensiones › conversor-rapido",
            descripcion: "Convierte cualquier documento o página a PDF con un clic. Más de 1 millón de usuarios.",
            pagina: "extension",
          },
        ],
      },
      {
        id: "vacaciones",
        patron: "vacacion|formato|solicitud|permiso",
        total: "86.300",
        resultados: [
          {
            id: "anuncio",
            patrocinado: true,
            titulo: "Formato Solicitud de Vacaciones 2026 (Word y PDF) — Descarga GRATIS",
            url: "formatos-gratis-online.com › vacaciones-2026",
            descripcion: "Descarga el formato oficial actualizado. Listo para imprimir. ¡Más de 500.000 descargas!",
            pagina: "formatos-anuncio",
          },
          {
            id: "intranet-formatos",
            titulo: "Formatos de Talento Humano — Intranet FCV",
            url: "intranet.fcv.org › formatos",
            descripcion: "Solicitud de vacaciones, permisos y certificados laborales. Diligéncialos en línea con tu sesión de la intranet.",
            pagina: "intranet",
            seccion: "formatos",
          },
        ],
      },
      {
        id: "impresora",
        patron: "impresora|imprim|driver|tóner|toner",
        total: "2.310.000",
        resultados: [
          {
            id: "driver",
            titulo: "Driver universal para impresoras — Descarga gratis 2026",
            url: "descargas-full-pro.net › driver-universal",
            descripcion: "Soluciona cualquier error de impresión en 1 minuto. Compatible con todas las marcas.",
            pagina: "programa",
          },
          {
            id: "mesa",
            titulo: "¿Tu impresora no imprime? Abre un caso en Mesa de Ayuda",
            url: "intranet.fcv.org › soporte",
            descripcion: "Para daños de equipos e impresoras de la FCV, reporta el caso en Mesa de Ayuda. No instales controladores por tu cuenta.",
            pagina: "intranet",
            seccion: "inicio",
          },
        ],
      },
      {
        id: "general",
        patron: "clima|noticia|video|tienda|oferta|futbol|fútbol",
        total: "12.500.000",
        resultados: [
          { id: "noticias", titulo: "Noticias al día — Lo último de Colombia y el mundo", url: "noticiasaldia-co.net", descripcion: "Actualidad, deportes, entretenimiento y el clima en tu ciudad.", pagina: "noticias" },
          { id: "videos", titulo: "Clips virales de hoy — Los videos más vistos", url: "clipsvirales-hoy.net", descripcion: "Los videos más graciosos de la semana. ¡No vas a parar de reír!", pagina: "video" },
          { id: "tienda", titulo: "SuperOfertas Flash — Hasta 80 % de descuento solo hoy", url: "superofertas-flash.shop", descripcion: "Tecnología, hogar y moda con envío gratis.", pagina: "tienda" },
        ],
      },
    ],
  },
  favoritos: [
    { id: "intranet", texto: "Intranet FCV", pagina: "intranet", seccion: "inicio", icono: "🏥" },
    { id: "videos", texto: "Videos", pagina: "video", icono: "▶" },
    { id: "noticias", texto: "Noticias", pagina: "noticias", icono: "📰" },
    { id: "tienda", texto: "Tienda", pagina: "tienda", icono: "🛍" },
  ],
  // Cada distracción se come tiempo del día (guion 9.4).
  distraccion: (min) => `Se te fueron ${min} minutos sin darte cuenta…`,
  paginas: {
    "login-falso": {
      evento: "E1",
      clave: "E1",
      prefijo: "",
      dominio: "portal.fcv-nomina.co",
      ruta: "/acceso",
      // Guion 9.2: la página falsa tiene candado.
      seguro: true,
      titulo: "Correo FCV — Iniciar sesión",
      marca: "Correo FCV",
      encabezado: "Iniciar sesión",
      usuario: "Usuario",
      contrasena: "Contraseña",
      boton: "Iniciar sesión",
      error: "Error, intente más tarde",
    },
    "login-buzon": {
      evento: "E14",
      clave: "14B",
      prefijo: "14B_",
      dominio: "mesadeayuda-fcv.com",
      ruta: "/webmail/validar",
      seguro: true,
      titulo: "Correo FCV — Validar cuenta",
      marca: "Correo FCV",
      encabezado: "Validar cuenta",
      usuario: "Usuario",
      contrasena: "Contraseña",
      boton: "Validar",
      error: "Error, intente más tarde",
    },
    "beneficios-falso": {
      evento: "E4",
      dominio: "fcv-beneficios-colaboradores.com",
      ruta: "/",
      seguro: true,
      titulo: "Portal de Beneficios — Colaboradores FCV",
      marca: "Beneficios Colaboradores FCV",
      // ✎
      encabezado: "Actualiza tus datos y reclama tu bono de mercado",
      subtitulo: "Bono de $200.000 para colaboradores. Solo por hoy.",
      contadorInicial: 12,
      contador: (n) => `¡Quedan ${n} bonos!`,
      campos: ["Cédula", "Correo institucional", "Contraseña del correo", "Número de cuenta bancaria"],
      boton: "Reclamar mi bono",
      exito: "¡Listo! Tu bono será consignado en las próximas 48 horas.",
      pie: "© 2026 Beneficios Colaboradores",
    },
    intranet: {
      dominio: "intranet.fcv.org",
      seguro: true,
      titulo: "Intranet FCV",
      marca: "Intranet FCV",
      hola: (n) => `Hola, ${n}`,
      menu: [
        { id: "inicio", texto: "Inicio", ruta: "/" },
        { id: "beneficios", texto: "Beneficios", ruta: "/beneficios" },
        { id: "capacitaciones", texto: "Capacitaciones", ruta: "/capacitaciones" },
        { id: "formatos", texto: "Formatos", ruta: "/formatos" },
        { id: "reservas", texto: "Reservas", ruta: "/reservas" },
      ],
      // Guion 15.2 — E15.
      reservas: {
        encabezado: "Reserva de salas",
        sala: "Sala",
        salas: ["Sala de juntas — piso 2", "Sala de capacitación — piso 1", "Auditorio principal"],
        dia: "Día",
        dias: ["Jueves 1 de octubre", "Viernes 2 de octubre"],
        hora: "Hora",
        horas: ["8:00 a.m.", "9:00 a.m.", "10:00 a.m."],
        boton: "Reservar",
        exito: (sala, dia, hora) => `✓ Reservaste ${sala} para el ${dia.toLowerCase()} a las ${hora}. Le llegó la confirmación a Andrea.`,
      },
      inicio: {
        encabezado: "Bienvenido a la intranet",
        noticias: [
          ["Jornada de donación de sangre", "Hoy de 8:00 a.m. a 3:00 p.m. en el auditorio principal."],
          ["Semana de la seguridad del paciente", "Gracias a todos los equipos que participaron."],
          ["¿Algo no funciona?", "Daños de equipos, impresoras o programas: abre un caso en Mesa de Ayuda."],
        ],
      },
      beneficios: {
        encabezado: "Beneficios para colaboradores",
        texto: "Mantén tus datos de contacto al día para recibir la información de Bienestar.",
        datos: [
          ["Celular", "300 *** **47"],
          ["Dirección", "Cra. ** # **-** · Floridablanca"],
        ],
        boton: "Confirmar mis datos",
        exito: "✓ Tus datos quedaron actualizados.",
        nota: "Los bonos y beneficios se entregan por Bienestar Institucional. La FCV nunca te pedirá tu contraseña ni tu cuenta bancaria en un formulario web.",
      },
      capacitaciones: {
        encabezado: "Humanización en la atención",
        texto: "Capacitación obligatoria para todos los colaboradores. Elige una sesión (inscripciones hasta las 10:00 a.m.).",
        sesiones: ["Martes 30 de septiembre · 2:00 p.m.", "Jueves 2 de octubre · 7:00 a.m.", "Viernes 3 de octubre · 10:00 a.m."],
        boton: "Inscribirme",
        exito: (s) => `✓ Quedaste inscrito: ${s}.`,
        cerrada: "Las inscripciones de hoy ya cerraron. Igual quedas en lista para la próxima sesión.",
      },
      encuesta: {
        ruta: "/encuestas/47102",
        encabezado: "Encuesta de satisfacción · caso #47102",
        pregunta: "¿Cómo calificas la atención de tu caso?",
        opciones: ["😞 Mala", "😐 Regular", "🙂 Buena", "😀 Excelente"],
        boton: "Enviar respuesta",
        exito: "✓ ¡Gracias! Tu respuesta nos ayuda a mejorar.",
      },
      formatos: {
        encabezado: "Formatos de Talento Humano",
        lista: ["Solicitud de vacaciones", "Solicitud de permiso", "Certificado laboral"],
        diligenciar: "Diligenciar en línea",
        vacaciones: {
          titulo: "Solicitud de vacaciones",
          desde: "Desde",
          hasta: "Hasta",
          opcionesDesde: ["15 de diciembre", "22 de diciembre"],
          opcionesHasta: ["2 de enero", "9 de enero"],
          boton: "Enviar a mi jefe inmediato",
          exito: "✓ Solicitud enviada a Andrea Rincón.",
        },
        otro: "Este formato no está disponible en la simulación.",
      },
    },
    // Guion 15.2 — E16: página de la herramienta del "soporte técnico" falso.
    "soporte-remoto": {
      evento: "E16",
      dominio: "soporte-remoto-fcv.com",
      ruta: "/descarga",
      seguro: true,
      titulo: "Soporte Remoto — Descarga",
      marca: "Soporte Remoto",
      encabezado: "Herramienta de soporte remoto",
      texto: "Descargue e instale la herramienta para que el técnico pueda conectarse a su equipo.",
      pasos: ["1. Descargue el instalador", "2. Ábralo y dele “Permitir”", "3. Envíe al técnico el código que aparece"],
      boton: "Descargar herramienta",
      archivo: "SoporteRemoto_Setup.exe",
      pie: "© 2026 Soporte Remoto. Todos los derechos reservados.",
    },
    // Guion 15.2 — E17: pestaña que se abre sola con una "actualización" falsa del navegador.
    actualizar: {
      evento: "E17",
      dominio: "actualiza-tu-navegador.net",
      ruta: "/urgente",
      seguro: false,
      titulo: "Actualización crítica",
      encabezado: "Tu navegador está desactualizado",
      texto: "Tu versión tiene fallas de seguridad graves. Tus contraseñas y datos bancarios están en riesgo. Actualiza ahora para seguir navegando.",
      version: "Versión instalada: 98.0 · Versión segura: 126.0",
      boton: "Actualizar ahora",
      archivo: "Actualizacion_Navegador_126.exe",
      contador: "Tu navegador se bloqueará en 5 minutos si no actualizas.",
    },
    programa: {
      evento: "E5",
      dominio: "descargas-full-pro.net",
      ruta: "/pdf-converter-pro",
      seguro: false,
      titulo: "PDF Converter PRO 2026 — Descarga gratis",
      marca: "DescargasFullPRO",
      encabezado: "PDF Converter PRO 2026",
      subtitulo: "Versión completa · Sin licencia · Activado",
      sellos: ["✓ Libre de virus", "✓ 100 % gratis", "✓ Descarga directa"],
      boton: "DESCARGAR AHORA",
      archivo: "PDFConverterPRO_setup.exe",
      tamano: "38,2 MB",
    },
    extension: {
      evento: "E5",
      dominio: "navegador://extensiones",
      ruta: "/conversor-rapido",
      seguro: true,
      interna: true,
      titulo: "Tienda de extensiones — Conversor Rápido",
      marca: "Tienda de extensiones",
      nombre: "Conversor Rápido",
      autor: "ofrecido por fast-tools-dev",
      usuarios: "1.000.000+ usuarios",
      estrellas: 4,
      descripcion: "Convierte documentos y páginas a PDF con un clic.",
      boton: "Agregar al navegador",
      dialogo: {
        titulo: "¿Agregar “Conversor Rápido”?",
        puede: "Puede:",
        permiso: "Leer y cambiar todos tus datos en todos los sitios web",
        agregar: "Agregar extensión",
        cancelar: "Cancelar",
      },
      instalada: "Se agregó Conversor Rápido al navegador.",
    },
    certificado: {
      evento: "E6",
      dominio: "catalogo.suministrosandinos.com.co",
      ruta: "/octubre",
      seguro: false,
      titulo: "Error de privacidad",
      alerta: {
        titulo: "Tu conexión no es privada",
        texto: "Es posible que atacantes estén intentando robar tu información de este sitio (por ejemplo, contraseñas, mensajes o tarjetas de crédito).",
        codigo: "NET::ERR_CERT_DATE_INVALID",
        volver: "Volver a un sitio seguro",
        avanzado: "Avanzado",
        ocultar: "Ocultar opciones avanzadas",
        detalle: "El certificado de seguridad de este servidor no es válido. Esto puede deberse a un error de configuración o a que un atacante esté interceptando tu conexión.",
        continuar: "Continuar a catalogo.suministrosandinos.com.co (no seguro)",
      },
    },
    catalogo: {
      evento: "E6",
      dominio: "catalogo.suministrosandinos.com.co",
      ruta: "/octubre",
      seguro: false,
      titulo: "Catálogo — Suministros Andinos",
      marca: "Suministros Andinos",
      encabezado: "Catálogo de octubre",
      productos: ["Resma de papel carta", "Tóner negro", "Carpetas de archivo", "Esferos x 12", "Cosedora", "Post-it"],
      permisos: {
        titulo: "catalogo.suministrosandinos.com.co quiere:",
        items: ["🔔 Mostrar notificaciones", "📷 Usar tu cámara"],
        permitir: "Permitir",
        bloquear: "Bloquear",
      },
    },
    video: {
      evento: "E9",
      distraccion: "videos",
      dominio: "clipsvirales-hoy.net",
      ruta: "/perrito-banco",
      seguro: true,
      titulo: "Perrito haciendo fila en el banco 😂 — ClipsVirales",
      marca: "ClipsVirales",
      video: "Perrito haciendo fila en el banco 😂😂",
      vistas: "2,3 M de vistas · hace 2 días",
      relacionados: ["Gato que odia los lunes", "Top 10 caídas en bodas", "Bebé prueba limón por primera vez", "Loro que canta vallenato"],
      aviso: {
        titulo: "Tu reproductor está desactualizado",
        texto: "Para ver este video en HD instala la actualización del reproductor.",
        actualizar: "Actualizar ahora",
        cerrar: "Seguir en calidad normal",
        archivo: "ReproductorHD_update.exe",
      },
    },
    noticias: {
      distraccion: "noticias",
      dominio: "noticiasaldia-co.net",
      ruta: "/",
      seguro: true,
      titulo: "Noticias al día",
      marca: "Noticias al día",
      titulares: ["Así estará el clima esta semana en Santander", "Los precios del café suben por tercer mes", "El resumen de la fecha del fútbol colombiano", "Receta: arepas rellenas en 15 minutos"],
      alerta: {
        titulo: "⚠ ALERTA DE SEGURIDAD",
        texto: "Su equipo está infectado con (3) virus. Sus datos bancarios y fotos están en riesgo. NO APAGUE EL EQUIPO.",
        telefono: "Llame YA a Soporte Técnico: 01 8000 519 402",
        escanear: "Escanear ahora",
        llamar: "Llamar al soporte",
        archivo: "AntivirusScan_Pro.exe",
        llamada: "Un “técnico” te pidió instalar un programa para “entrar a tu equipo”. Colgaste… pero ya tienen tu nombre y tu número.",
      },
    },
    tienda: {
      distraccion: "tienda",
      dominio: "superofertas-flash.shop",
      ruta: "/",
      seguro: true,
      titulo: "SuperOfertas Flash",
      marca: "SuperOfertas Flash",
      productos: [["Audífonos inalámbricos", "$39.900"], ["Freidora de aire", "$129.900"], ["Reloj inteligente", "$59.900"], ["Maleta de cabina", "$89.900"]],
      premio: {
        titulo: "🎁 ¡Felicitaciones! Eres el visitante 1.000.000",
        texto: "Reclama tu bono de $500.000. Solo pagas $4.900 de envío.",
        campos: ["Nombre completo", "Celular", "Número de tarjeta", "Fecha de vencimiento y código"],
        boton: "Reclamar mi bono",
        exito: "¡Pago recibido! Tu bono llegará en 5 días hábiles.",
        cerrar: "No, gracias",
      },
    },
    "formatos-anuncio": {
      evento: "E13",
      dominio: "formatos-gratis-online.com",
      ruta: "/vacaciones-2026",
      seguro: true,
      titulo: "Formato Solicitud de Vacaciones 2026 — Descarga gratis",
      marca: "FormatosGratisOnline",
      encabezado: "Formato Solicitud de Vacaciones 2026",
      texto: "Formato actualizado para empresas y entidades de salud. Word y PDF.",
      boton: "DESCARGAR",
      enlaceChico: "descargar formato (.docx)",
      archivo: "Formato_Vacaciones_2026.exe",
      tamano: "4,8 MB",
      publicidad: "Publicidad",
    },
  },
  descarga: { completa: "Descarga completa", abrir: "Abrir" },
};

// Protección del equipo (genérica, sin marca). Aparece con cualquier descarga peligrosa.
export const proteccion = {
  titulo: "Protección del equipo",
  subtitulo: "Archivo potencialmente peligroso",
  texto: "Se bloqueó temporalmente un archivo descargado:",
  masInfoTexto: (origen) => `Origen: ${origen} · Editor: desconocido · Este archivo intenta modificar la configuración del sistema e instalar programas adicionales sin tu permiso.`,
  botones: { cuarentena: "Poner en cuarentena", masInfo: "Más información", permitir: "Permitir de todos modos", cerrar: "Cerrar" },
  enCuarentena: "Archivo en cuarentena. Tu equipo está protegido.",
  instalando: (a) => `Instalando ${a}…`,
  errorInstalar: "No se pudo completar la instalación (error 0x80070005).",
};

// ───────────────────────────── Documentos ─────────────────────────────
export const documentosApp = {
  archivo: "Informe_mensual.docx",
  menus: ["Archivo", "Editar", "Ver", "Insertar", "Formato"],
  menuArchivo: ["Nuevo", "Abrir", "Guardar", "Guardar como PDF", "Imprimir"],
  guardarPdf: {
    titulo: "Guardar como PDF",
    nombre: "Nombre del archivo",
    archivo: "Informe_mensual.pdf",
    ubicacion: "Guardar en: Documentos",
    guardar: "Guardar",
    cancelar: "Cancelar",
    listo: "Informe_mensual.pdf guardado en Documentos. Ya puedes adjuntarlo en un correo.",
  },
  otros: "Esta opción no está disponible en la simulación.",
  guardado: "Documento guardado.",
  impreso: "Enviado a la impresora.",
  // ✎ Contenido del informe.
  contenido: {
    titulo: "Informe mensual de gestión — septiembre 2026",
    area: "Área administrativa",
    secciones: [
      ["1. Resumen", "Durante septiembre se cumplió el 94 % de las actividades programadas. Se cerraron los indicadores del trimestre y se actualizaron los formatos del sistema de gestión documental."],
      ["2. Actividades destacadas", "Jornada de bienestar del área, inventario de insumos de oficina y apoyo a la semana de la seguridad del paciente."],
      ["3. Pendientes para octubre", "Actualización de formatos de calidad y entrega del informe de gestión del trimestre."],
    ],
  },
};

// Archivos que se pueden adjuntar en un correo.
export const archivosAdjuntables = {
  docx: { id: "informe-docx", nombre: "Informe_mensual.docx", tamano: "64 KB", tipo: "docx" },
  pdf: { id: "informe-pdf", nombre: "Informe_mensual.pdf", tamano: "212 KB", tipo: "pdf" },
};

// ───────────────────────────── Mesa de Ayuda ─────────────────────────────
// Guion 9.4: el caso se arma con categoría y asunto (lista). "uso" dice para qué sirve en la jornada.
export const mesaAyuda = {
  titulo: "Mesa de Ayuda",
  subtitulo: "Portal de casos",
  nuevo: "Nuevo caso",
  categoria: "Categoría",
  asunto: "Asunto",
  elegir: "Selecciona…",
  categorias: [
    {
      id: "equipo",
      texto: "Equipo o impresora",
      asuntos: [
        { id: "impresora", texto: "La impresora del área no imprime" },
        { id: "lento", texto: "Mi equipo está lento" },
      ],
    },
    {
      id: "software",
      texto: "Software y programas",
      asuntos: [
        { id: "pdf", texto: "Necesito convertir un documento a PDF" },
        { id: "instalar", texto: "Solicitar la instalación de un programa" },
      ],
    },
    {
      id: "correo",
      texto: "Correo y contraseñas",
      asuntos: [
        { id: "clave", texto: "Se me bloqueó la contraseña" },
        { id: "buzon", texto: "Mi buzón está lleno" },
      ],
    },
    {
      id: "seguridad",
      texto: "Seguridad de la información",
      asuntos: [
        { id: "incidente", texto: "Creo que mi equipo o mi cuenta están comprometidos" },
        { id: "sospechoso", texto: "Recibí un mensaje sospechoso" },
      ],
    },
  ],
  descripcion: "Describe tu solicitud (opcional)",
  ayuda: "Lo que escribas aquí no se guarda ni se envía: es una simulación.",
  enviar: "Enviar caso",
  faltaCategoria: "Elige una categoría y un asunto.",
  numero: 48213,
  creado: (n) => `Caso #${n} creado. Te contactaremos pronto.`,
  misCasos: "Mis casos",
  abierto: "Abierto",
  casoCerrado: { numero: 47102, texto: "Cambio de tóner de la impresora", estado: "Cerrado" },
  // ✎ Respuestas por correo según el asunto.
  respuestas: {
    pdf: {
      asunto: (n) => `RE: Caso #${n} — Convertir documento a PDF`,
      cuerpo: [
        { tipo: "p", texto: "Hola. Para convertir un documento a PDF no necesitas instalar nada: abre el documento en **Documentos → Archivo → Guardar como PDF** y luego adjúntalo en tu correo." },
        { tipo: "p", texto: "Recuerda no descargar programas de páginas no oficiales." },
        { tipo: "firma", lineas: ["Mesa de Ayuda"] },
      ],
    },
    impresora: {
      asunto: (n) => `RE: Caso #${n} — Impresora del área`,
      cuerpo: [
        { tipo: "p", texto: "Hola. Un técnico va en camino a revisar la impresora del área. No es necesario que instales controladores ni programas." },
        { tipo: "firma", lineas: ["Mesa de Ayuda"] },
      ],
    },
    sospechoso: {
      asunto: (n) => `RE: Caso #${n} — Mensaje sospechoso`,
      cuerpo: [
        { tipo: "p", texto: "Gracias por avisar. Escalamos tu caso a Seguridad Informática. La próxima vez también puedes reenviar el mensaje directamente a " + seg + " o escribir al WhatsApp " + wa + "." },
        { tipo: "firma", lineas: ["Mesa de Ayuda"] },
      ],
    },
    otro: {
      asunto: (n) => `RE: Caso #${n}`,
      cuerpo: [
        { tipo: "p", texto: "Hola. Recibimos tu caso y lo atenderemos en orden de llegada." },
        { tipo: "firma", lineas: ["Mesa de Ayuda"] },
      ],
    },
  },
};

// ───────────────────────────── E7 ─────────────────────────────
export const e7 = {
  duracionSeg: config.e7.duracionMaxSeg,
  // 7A: consecuencia según la etiqueta más grave (guion E7).
  consecuencias: {
    MALWARE: { titulo: "Tus archivos han sido bloqueados", texto: "Los archivos de tu escritorio ya no abren. Todos terminan en .locked." },
    CREDENCIALES: { titulo: "Tu cuenta envió 47 correos", texto: "En Enviados hay mensajes que tú no escribiste, dirigidos a todos tus contactos." },
    CREDENCIALES_BANCO: { titulo: "Tu cuenta envió 47 correos", texto: "En Enviados hay mensajes que tú no escribiste.", extra: "Solicitud de cambio de cuenta de nómina recibida" },
    EXTENSION: { titulo: "Nuevo inicio de sesión en tu cuenta", texto: "Alguien entró a tu correo desde otro dispositivo (Windows · otra ciudad) hace 1 minuto." },
    PERMISOS: { titulo: "La cámara se encendió sola", texto: "Y no paran de llegar notificaciones que tú no pediste." },
    FRAUDE: { titulo: "Te llegó un cobro que no reconoces", texto: "“Andrea” volvió a escribir pidiendo más tarjetas… y la verdadera Andrea no sabe de qué le hablas.", extra: "Cargo de $300.000 en tu tarjeta" },
  },
  contador: "Tiempo sin reportar",
  areas: ["Administración", "Facturación", "Atención al usuario", "Archivo"],
  afectada: "Afectada",
  mapaTitulo: "Sede · estado de la red",
  // ✎ Acciones a la vista (orden aleatorio). Desconectar la red está en la barra de tareas.
  pregunta: "¿Qué haces?",
  acciones: [
    { id: "reportar", canal: "correo", texto: `Escribir a ${seg}` },
    { id: "reportar", canal: "whatsapp", texto: `WhatsApp a Seguridad Informática (${wa})` },
    { id: "mesa_ayuda", texto: "Abrir un caso en Mesa de Ayuda" },
    { id: "contar_companero", texto: "Contarle a Julián" },
    { id: "reiniciar", texto: "Reiniciar el equipo y seguir trabajando" },
  ],
  desconectada: "Red desconectada. El equipo quedó aislado.",
  resultado: {
    reportar: "✓ Seguridad Informática recibió tu reporte. Ya están conteniendo el incidente.",
    mesa_ayuda: "✓ Caso creado. Mesa de Ayuda lo escaló a Seguridad Informática.",
    contar_companero: "Julián: “Uy… ni idea. ¿Y si mejor avisas a Seguridad?” El tiempo sigue corriendo.",
    reiniciar: "El equipo se reinició… y el problema sigue ahí. Mientras tanto, se extendió.",
    nada: "Se acabó el tiempo. Nadie se enteró a tiempo.",
    desconectar: "Desconectaste la red, pero nadie sabe lo que pasó.",
  },
  // 7B: sin etiquetas. Julián confiesa (guion 9.6: opciones más difíciles, en orden aleatorio).
  B: {
    mensaje: { de: "julian", texto: "Oye… creo que metí mi clave en un link raro de nómina 😬. Me da pena decir algo, ¿lo dejo así?" },
    opciones: [
      { id: "reportar", texto: `Repórtalo ya a ${seg} o al WhatsApp ${wa}. Equivocarse no es el problema; callarlo sí.`, respuesta: "Tienes razón. Ya les escribo 🙏" },
      { id: "cambiar_clave", texto: "Cambia tu clave ya y revisa que no hayan enviado nada desde tu correo", respuesta: "Listo, la cambio… ojalá no hayan alcanzado a entrar 😅" },
      { id: "andrea", texto: "Mejor díselo primero a Andrea", respuesta: "Uff, me da más pena con ella… lo pienso 😬" },
      { id: "tranquilo", texto: "Tranquilo, a mí también me pasó una vez y no pasó nada", respuesta: "Bueno, uff, qué alivio 😌" },
    ],
  },
  // 7A: Julián también escribe mientras atiendes tu incidente (guion 9.6). No suma; solo puede restar.
  A: {
    mensaje: { de: "julian", texto: "Oye… creo que metí mi clave en un link raro de nómina 😬 ¿Qué hago? ¿Lo dejo así?" },
    opciones: [
      { id: "reportar", texto: "Yo también tuve un problema hoy. Repórtalo ya, yo estoy haciendo lo mismo", respuesta: "Ok, ya les escribo 🙏" },
      { id: "ahora_no", texto: "Ahora no puedo, tengo un problema con mi equipo 😩", respuesta: "Uy, ok… 😬" },
      { id: "tranquilo", texto: "Tranquilo, no creo que pase nada", respuesta: "Bueno, uff 😌" },
    ],
  },
};

// ───────────────────────────── Rebobinado ─────────────────────────────
/**
 * Tarjetas de "Después del clic" por evento y acción decisiva.
 *  hiciste: ⏪ lo que hiciste · senal: 🔍 lo que no viste (o lo que sí viste) · paso: lo que pasó después
 *  otroLado: panel derecho. tipo "estafador" (error) | "seguridad" (acierto) | "neutral".
 *  pantalla: miniatura de tu pantalla con la señal marcada.
 * ✎ Redactado a partir de los ejemplos del guion (P6); revisar con Cristian.
 */
const pE1 = { app: "correo", de: "nomina@fcv-nomina.co", asunto: "Actualización de datos para el pago de nómina…", senal: "fcv-nomina.co no es @fcv.org" };
const pE2 = { app: "correo", de: "andrea.rincon@fcv.org", asunto: "Programación de actividades — octubre", senal: "@fcv.org y aviso legal: era legítimo", legitimo: true };
const pE3A = { app: "correo", de: "notificaciones@docs-compartidos.net", asunto: "Tienes un documento pendiente de firma", senal: ".pdf.zip: no es un PDF" };
const pE3B = { app: "correo", de: "bienestar@fcv.org", asunto: "Confirmación de inscripción — Jornada de bienestar", senal: "@fcv.org y no pedía nada", legitimo: true };
const pE4 = { app: "navegador", url: "fcv-beneficios-colaboradores.com", noSeguro: false, titulo: "Portal de Beneficios", senal: "Tenía candado, pero la dirección no es fcv.org" };
const pE5a = { app: "navegador", url: "descargas-full-pro.net", noSeguro: true, titulo: "PDF Converter PRO 2026 — GRATIS", senal: "Programa “PRO gratis” de una página no oficial" };
const pE5b = { app: "extension", titulo: "Conversor Rápido", senal: "Pedía leer y cambiar todos tus datos en todos los sitios" };
const pE5c = { app: "alerta", titulo: "Protección del equipo", texto: "Archivo potencialmente peligroso", senal: "La alerta te lo advirtió" };
const pE6 = { app: "alerta", titulo: "Tu conexión no es privada", texto: "catalogo.suministrosandinos.com.co", senal: "El navegador no pudo verificar el sitio" };

const pVideo = { app: "navegador", url: "clipsvirales-hoy.net", noSeguro: false, titulo: "Tu reproductor está desactualizado", senal: "Un video no necesita que instales nada" };
const pDescarga = { app: "alerta", titulo: "Protección del equipo", texto: "Archivo potencialmente peligroso", senal: "La alerta te lo advirtió" };
const pE8 = { app: "correo", de: "talentohumano@fcv.org", asunto: "Capacitación obligatoria: Humanización en la atención", senal: "@fcv.org, te saludaba por tu nombre y llevaba a intranet.fcv.org", legitimo: true };
const pE10 = { app: "chat", de: "Julián Ortiz", texto: "¿Me prestas tu clave 5 minutos?", senal: "Tu clave es solo tuya, aunque te la pida un compañero" };
const pE12 = { app: "chat", de: "+57 318 555 0142", texto: "Hola, soy Andrea 👋 Este es mi número nuevo…", senal: "Número nuevo + urgencia + tarjetas de regalo" };
const pE13 = { app: "navegador", url: "formatos-gratis-online.com", noSeguro: false, titulo: "Patrocinado · DESCARGAR", senal: "El primer resultado era un anuncio; el formato real estaba en la intranet" };
const pE14a = { app: "correo", de: "helpdesk@fcv.org", asunto: "¿Cómo te atendimos? Encuesta del caso #47102", senal: "@fcv.org, esperado (tu caso sí existía) y llevaba a intranet.fcv.org", legitimo: true };
const pE14b = { app: "correo", de: "soporte@mesadeayuda-fcv.com", asunto: "Tu buzón está al 98 % — valida tu cuenta…", senal: "mesadeayuda-fcv.com no es @fcv.org" };

export const rebobinado = {
  E1: {
    frase: frases.correo,
    tarjetas: {
      escribir_credenciales: {
        hiciste: "Escribiste tu contraseña en “Validar mis datos”.",
        senal: "El remitente era fcv-nomina.co, no @fcv.org; te saludaba como “colaborador(a)” y no por tu nombre. La página tenía candado, pero no era el webmail de la FCV.",
        paso: "Con tu clave, alguien envió 47 correos desde tu cuenta.",
        frase: frases.consignaCorreo,
        pantalla: pE1,
        otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["🎣 Nueva contraseña recibida", "Usuario: {correo}", "Enviando 47 correos desde la cuenta…"] },
      },
      cerrar_sin_escribir: {
        hiciste: "Hiciste clic en “Validar mis datos”, pero cerraste la página sin escribir.",
        senal: "El remitente era fcv-nomina.co y la página no era el webmail de la FCV.",
        paso: "Te salvaste por poco: el estafador supo que tu correo está activo y que abres sus enlaces.",
        frase: frases.consignaCorreo,
        pantalla: pE1,
        otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["👀 {correo} abrió el enlace", "No escribió la contraseña", "Marcar para el próximo intento"] },
      },
      clic_enlace: {
        hiciste: "Hiciste clic en “Validar mis datos” y dejaste la página abierta.",
        senal: "El remitente era fcv-nomina.co, no @fcv.org.",
        paso: "El estafador supo que tu correo está activo y que abres sus enlaces.",
        frase: frases.consignaCorreo,
        pantalla: pE1,
        otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["👀 {correo} abrió el enlace", "Esperando contraseña…"] },
      },
      responder: {
        hiciste: "Le respondiste al remitente para preguntar si era real.",
        senal: "Le escribiste al mismo estafador: fcv-nomina.co no es @fcv.org.",
        paso: "Tu respuesta le confirmó que tu correo existe y que lees sus mensajes.",
        frase: frases.consignaCorreo,
        pantalla: pE1,
        otroLado: { tipo: "estafador", titulo: "Bandeja del estafador", lineas: ["📩 Respuesta de {correo}", "“¿Esto es real?”", "Contestar: “Sí, es urgente”"] },
      },
      reportar: {
        hiciste: "Reenviaste el correo a Seguridad Informática.",
        senal: "Viste que fcv-nomina.co no es @fcv.org.",
        paso: "Con tu reporte bloquearon ese remitente para todos.",
        frase: frases.correo,
        pantalla: pE1,
        otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["📥 Reporte recibido", "Remitente fcv-nomina.co bloqueado", "Protegidos: todos los buzones de la FCV"] },
      },
      spam: {
        hiciste: "Mandaste el correo a Spam.",
        senal: "Notaste que algo no cuadraba: fcv-nomina.co no es @fcv.org.",
        paso: "Te protegiste tú, pero nadie más se enteró. Reenviarlo a Seguridad Informática protege a todos.",
        frase: frases.correo,
        pantalla: pE1,
        otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["{correo}: sin respuesta", "Otros 300 buzones: el correo sigue llegando"] },
      },
      eliminar: {
        hiciste: "Eliminaste el correo.",
        senal: "Notaste que algo no cuadraba: fcv-nomina.co no es @fcv.org.",
        paso: "Te protegiste tú, pero nadie más se enteró. Reenviarlo a Seguridad Informática protege a todos.",
        frase: frases.correo,
        pantalla: pE1,
        otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["{correo}: sin respuesta", "Otros 300 buzones: el correo sigue llegando"] },
      },
    },
  },
  E2: {
    frase: frases.correo,
    tarjetas: {
      abrir_adjunto_y_responder: {
        hiciste: "Abriste la programación de Andrea y le respondiste.",
        senal: "Era de @fcv.org, esperado y con el aviso legal institucional.",
        paso: "Hiciste tu trabajo sin miedo: verificar no es desconfiar de todo.",
        frase: "Verificar no es rechazar todo.",
        pantalla: pE2,
        otroLado: { tipo: "neutral", titulo: "Andrea", lineas: ["“Perfecto, gracias por revisarla 👌”"] },
      },
      reportar: {
        hiciste: "Reportaste como sospechoso el correo real de Andrea.",
        senal: "Era de @fcv.org, esperado y con el aviso legal institucional.",
        paso: "Andrea se quedó esperando tu confirmación y Seguridad perdió tiempo revisando un correo legítimo.",
        frase: "Verificar no es rechazar todo. Aprende a distinguir.",
        pantalla: pE2,
        otroLado: { tipo: "neutral", titulo: "Andrea", lineas: ["“¿Revisaste la programación?”", "Sin respuesta"] },
      },
      spam: {
        hiciste: "Mandaste a Spam el correo real de Andrea.",
        senal: "Era de @fcv.org, esperado y con el aviso legal institucional.",
        paso: "Andrea se quedó esperando tu confirmación.",
        frase: "Verificar no es rechazar todo. Aprende a distinguir.",
        pantalla: pE2,
        otroLado: { tipo: "neutral", titulo: "Andrea", lineas: ["“¿Revisaste la programación?”", "Sin respuesta"] },
      },
    },
  },
  E3: {
    frase: frases.correo,
    tarjetas: {
      "3A_abrir_adjunto": {
        hiciste: "Descargaste y abriste “Acta_pendiente_firma.pdf.zip”.",
        senal: "Venía de docs-compartidos.net y el archivo terminaba en .zip, no en .pdf.",
        paso: "No se abrió ningún documento… pero algo sí se instaló en tu equipo.",
        frase: frases.correo,
        pantalla: pE3A,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo conectado", "Esperando la orden de cifrar archivos…"] },
      },
      "3A_reportar": {
        hiciste: "Reenviaste a Seguridad Informática el “documento pendiente de firma”.",
        senal: "Viste que venía de docs-compartidos.net con un .pdf.zip.",
        paso: "Seguridad bloqueó el archivo para todos los buzones.",
        frase: frases.correo,
        pantalla: pE3A,
        otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["📥 Reporte recibido", "Adjunto .pdf.zip bloqueado", "Protegidos: todos los buzones"] },
      },
      "3A_eliminar": {
        hiciste: "Eliminaste el “documento pendiente de firma”.",
        senal: "Viste que venía de docs-compartidos.net con un .pdf.zip.",
        paso: "Te protegiste tú. Si lo reenvías a Seguridad Informática, protegen a todos.",
        frase: frases.correo,
        pantalla: pE3A,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["{correo}: no abrió", "Otros buzones: el correo sigue llegando"] },
      },
      "3B_reportar": {
        hiciste: "Reportaste como peligroso el correo de Bienestar.",
        senal: "Era de @fcv.org y no pedía descargar ni diligenciar nada. Solo estaba mal clasificado en Spam.",
        paso: "Casi pierdes tu cupo en la jornada de bienestar.",
        frase: "Verificar no es rechazar todo. Aprende a distinguir.",
        pantalla: pE3B,
        otroLado: { tipo: "neutral", titulo: "Bienestar Institucional", lineas: ["Inscripción: sin confirmar"] },
      },
      "3B_no_es_spam": {
        hiciste: "Rescataste de Spam el correo de Bienestar.",
        senal: "Viste que era de @fcv.org y no pedía nada.",
        paso: "Spam también se equivoca: revisarlo con calma sirve.",
        frase: frases.correo,
        pantalla: pE3B,
        otroLado: { tipo: "neutral", titulo: "Bienestar Institucional", lineas: ["Inscripción confirmada ✓", "Jueves 2:00 p.m."] },
      },
      "3B_leer": {
        hiciste: "Leíste con calma el correo de Bienestar que cayó en Spam.",
        senal: "Era de @fcv.org y no pedía nada.",
        paso: "Spam también se equivoca: revisarlo con calma sirve.",
        frase: frases.correo,
        pantalla: pE3B,
        otroLado: { tipo: "neutral", titulo: "Bienestar Institucional", lineas: ["Inscripción confirmada ✓"] },
      },
    },
  },
  E4: {
    frase: frases.navegacion,
    tarjetas: {
      llenar_formulario: {
        hiciste: "Llenaste el “Portal de beneficios” con tu cédula, contraseña y cuenta bancaria.",
        senal: "La página tenía candado, pero la dirección no era fcv.org. Pedía tu contraseña y tu cuenta bancaria, y el contador de bonos era para apurarte.",
        paso: "Llegó una solicitud de cambio de tu cuenta de nómina que tú no hiciste.",
        frase: frases.navegacion,
        pantalla: pE4,
        otroLado: { tipo: "estafador", titulo: "Panel “Bonos FCV”", lineas: ["💳 Nuevos datos bancarios recibidos", "Contraseña del correo: recibida", "Solicitar cambio de cuenta de nómina…"] },
      },
      cerrar_y_intranet: {
        hiciste: "Actualizaste tus datos entrando por el favorito Intranet FCV.",
        senal: "El link de Julián no era fcv.org; la intranet sí.",
        paso: "Cumpliste tu pendiente sin darle nada a nadie.",
        frase: frases.descargas,
        pantalla: { app: "navegador", url: "intranet.fcv.org", noSeguro: false, titulo: "Intranet FCV — Beneficios", senal: "🔒 intranet.fcv.org: la vía oficial", legitimo: true },
        otroLado: { tipo: "estafador", titulo: "Panel “Bonos FCV”", lineas: ["{correo}: no llegó", "0 datos recibidos de ti"] },
      },
      cerrar: {
        hiciste: "Cerraste el “Portal de beneficios” sin escribir nada.",
        senal: "Viste que la dirección no era fcv.org, aunque tuviera candado.",
        paso: "No caíste. La próxima vez, entra por la intranet para cumplir el pendiente.",
        frase: frases.navegacion,
        pantalla: pE4,
        otroLado: { tipo: "estafador", titulo: "Panel “Bonos FCV”", lineas: ["Visita de {correo}", "Formulario: vacío"] },
      },
    },
  },
  E5: {
    frase: frases.descargas,
    tarjetas: {
      permitir: {
        hiciste: "Descargaste “PDF Converter PRO” y lo permitiste de todos modos.",
        senal: "Venía de descargas-full-pro.net y la protección del equipo te avisó que era peligroso.",
        paso: "El “conversor” cifró los archivos de tu escritorio y de la carpeta compartida.",
        frase: frases.alertas,
        pantalla: pE5c,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos… 100 %", "Mensaje de rescate enviado"] },
      },
      cerrar_x: {
        hiciste: "Descargaste “PDF Converter PRO” y cerraste la alerta con la ✕.",
        senal: "La alerta decía “Archivo potencialmente peligroso”. Cerrarla no es decidir.",
        paso: "Cerrar la alerta dejó el archivo en tu equipo, y se ejecutó.",
        frase: frases.alertas,
        pantalla: pE5c,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos…"] },
      },
      descargar_programa: {
        hiciste: "Descargaste “PDF Converter PRO 2026” de una página no oficial.",
        senal: "“Versión PRO completa gratis” de descargas-full-pro.net.",
        paso: "La protección del equipo lo detuvo, pero el programa quedó en tu equipo.",
        frase: frases.descargas,
        pantalla: pE5a,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga iniciada por {correo}", "Esperando ejecución…"] },
      },
      instalar_extension: {
        hiciste: "Agregaste la extensión “Conversor Rápido”.",
        senal: "Pedía “leer y cambiar todos tus datos en todos los sitios web”. Para convertir un PDF no hace falta.",
        paso: "La extensión copió tu sesión del correo: alguien entró a tu cuenta desde otro dispositivo.",
        frase: frases.descargas,
        pantalla: pE5b,
        otroLado: { tipo: "estafador", titulo: "Panel “Conversor Rápido”", lineas: ["🧩 Nueva instalación", "Sesión de correo copiada: {correo}", "Iniciando sesión desde otro equipo…"] },
      },
      mas_info_cuarentena: {
        hiciste: "Ante la alerta, leíste “Más información” y pusiste el archivo en cuarentena.",
        senal: "Leíste la alerta antes de decidir.",
        paso: "El archivo nunca se ejecutó.",
        frase: frases.alertas,
        pantalla: pE5c,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada", "0 equipos nuevos"] },
      },
      cuarentena: {
        hiciste: "Descargaste un programa no oficial, pero lo pusiste en cuarentena.",
        senal: "Venía de descargas-full-pro.net.",
        paso: "La alerta te salvó. La vía segura era Documentos → Archivo → Guardar como PDF.",
        frase: frases.descargas,
        pantalla: pE5c,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      guardar_pdf_y_enviar: {
        hiciste: "Guardaste el informe como PDF desde Documentos y se lo enviaste a Andrea.",
        senal: "No necesitabas instalar nada: la herramienta ya estaba en tu equipo.",
        paso: "Andrea recibió su informe y tu equipo siguió limpio.",
        frase: frases.descargas,
        pantalla: { app: "documentos", titulo: "Archivo → Guardar como PDF", senal: "La vía oficial" },
        otroLado: { tipo: "neutral", titulo: "Andrea", lineas: ["“¡Recibido, mil gracias! 🙌”"] },
      },
      mesa_ayuda: {
        hiciste: "Abriste un caso en Mesa de Ayuda en vez de descargar un conversor.",
        senal: "Preguntaste por la vía oficial.",
        paso: "Mesa de Ayuda te indicó cómo hacerlo sin instalar nada.",
        frase: frases.descargas,
        pantalla: { app: "mesa", titulo: "Caso #48213", senal: "La vía oficial" },
        otroLado: { tipo: "seguridad", titulo: "Mesa de Ayuda", lineas: ["Caso #48213 recibido", "Respuesta: Documentos → Guardar como PDF"] },
      },
    },
  },
  E6: {
    frase: frases.alertas,
    tarjetas: {
      continuar_permitir: {
        hiciste: "Continuaste pese a “Tu conexión no es privada” y le diste permiso de cámara y notificaciones.",
        senal: "El navegador te avisó que no podía verificar el sitio. Un catálogo no necesita tu cámara.",
        paso: "La cámara se encendió sola y empezaron a llegar notificaciones falsas.",
        frase: frases.alertas,
        pantalla: pE6,
        otroLado: { tipo: "estafador", titulo: "Panel de permisos", lineas: ["📷 Cámara de {correo}: activa", "🔔 Enviando notificaciones falsas…"] },
      },
      volver_y_responder: {
        hiciste: "Volviste a un sitio seguro y le escribiste al proveedor para confirmar.",
        senal: "Leíste la alerta, verificaste por otra vía y decidiste.",
        paso: "El proveedor corrigió su página: tenía el certificado vencido.",
        frase: frases.alertas,
        pantalla: pE6,
        otroLado: { tipo: "neutral", titulo: "Suministros Andinos", lineas: ["“¡Gracias por avisar! Ya lo corregimos.”"] },
      },
      volver: {
        hiciste: "Volviste a un sitio seguro.",
        senal: "Leíste la alerta en vez de cerrarla y continuar.",
        paso: "No te expusiste: el sitio del proveedor tenía el certificado vencido y la alerta era real.",
        frase: frases.alertas,
        pantalla: pE6,
        otroLado: { tipo: "neutral", titulo: "Suministros Andinos", lineas: ["Certificado vencido (sin reportar)"] },
      },
      responder_sin_abrir: {
        hiciste: "Le escribiste al proveedor antes de abrir el enlace.",
        senal: "Verificaste por otra vía.",
        paso: "Buen reflejo: preguntaste antes de hacer clic.",
        frase: frases.alertas,
        pantalla: { app: "correo", de: "ventas@suministrosandinos.com.co", asunto: "Catálogo actualizado — pedido de octubre", senal: "Verificaste antes de abrir" },
        otroLado: { tipo: "neutral", titulo: "Suministros Andinos", lineas: ["“Gracias, revisamos el enlace.”"] },
      },
    },
  },
  E8: {
    frase: frases.correo,
    tarjetas: {
      inscribirse: {
        hiciste: "Te inscribiste en la capacitación desde el correo de Talento Humano.",
        senal: "Era de @fcv.org, te saludaba por tu nombre, llevaba a intranet.fcv.org y no pedía contraseña.",
        paso: "Cumpliste a tiempo. Verificar no es desconfiar de todo.",
        frase: "Verificar no es rechazar todo.",
        pantalla: pE8,
        otroLado: { tipo: "neutral", titulo: "Talento Humano", lineas: ["Inscripción confirmada ✓"] },
      },
      reportar: {
        hiciste: "Reportaste como sospechoso el correo real de la capacitación.",
        senal: "Era de @fcv.org, te saludaba por tu nombre y llevaba a intranet.fcv.org.",
        paso: "Seguridad perdió tiempo revisando un correo legítimo y te quedaste sin cupo.",
        frase: "Verificar no es rechazar todo. Aprende a distinguir.",
        pantalla: pE8,
        otroLado: { tipo: "neutral", titulo: "Talento Humano", lineas: ["Inscripción: pendiente", "Cupos agotados"] },
      },
      spam: {
        hiciste: "Mandaste a Spam el correo real de la capacitación.",
        senal: "Era de @fcv.org, te saludaba por tu nombre y llevaba a intranet.fcv.org.",
        paso: "Te quedaste sin cupo en una capacitación obligatoria.",
        frase: "Verificar no es rechazar todo. Aprende a distinguir.",
        pantalla: pE8,
        otroLado: { tipo: "neutral", titulo: "Talento Humano", lineas: ["Inscripción: pendiente"] },
      },
    },
  },
  E9: {
    frase: frases.descargas,
    tarjetas: {
      permitir: {
        hiciste: "Descargaste “ReproductorHD_update.exe” y lo permitiste de todos modos.",
        senal: "Venía de clipsvirales-hoy.net y la protección del equipo te avisó que era peligroso.",
        paso: "El archivo cifró los archivos de tu escritorio y de la carpeta compartida.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos… 100 %"] },
      },
      cerrar_x: {
        hiciste: "Descargaste “ReproductorHD_update.exe” y cerraste la alerta con la ✕.",
        senal: "La alerta decía “Archivo potencialmente peligroso”. Cerrarla no es decidir.",
        paso: "Cerrar la alerta dejó el archivo en tu equipo, y se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos…"] },
      },
      cuarentena: {
        hiciste: "Descargaste “ReproductorHD_update.exe”, pero lo pusiste en cuarentena.",
        senal: "Venía de clipsvirales-hoy.net.",
        paso: "La alerta te salvó, pero no debiste descargarlo.",
        frase: frases.descargas,
        pantalla: pVideo,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      mas_info_cuarentena: {
        hiciste: "Descargaste la “actualización”, leíste la alerta y la pusiste en cuarentena.",
        senal: "Un video no necesita que instales nada.",
        paso: "El archivo nunca se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      no_abrir: {
        hiciste: "No abriste el video del grupo en horario de trabajo.",
        senal: "La página del video pedía “actualizar el reproductor”.",
        paso: "No perdiste tiempo ni te expusiste a la falsa actualización.",
        frase: frases.descargas,
        pantalla: pVideo,
        otroLado: { tipo: "estafador", titulo: "Panel “Clips virales”", lineas: ["{correo}: no entró"] },
      },
    },
  },
  E10: {
    frase: "Tu contraseña es personal e intransferible.",
    tarjetas: {
      dar_clave: {
        hiciste: "Le pasaste tu clave a Julián por el chat.",
        senal: "Una clave no se presta, ni siquiera a un compañero de confianza.",
        paso: "El equipo de Julián estaba comprometido: con tu clave también entraron a tu cuenta.",
        frase: "Tu contraseña es personal e intransferible.",
        pantalla: pE10,
        otroLado: { tipo: "estafador", titulo: "Equipo de Julián (comprometido)", lineas: ["📋 Clave copiada del chat", "Entrando a la cuenta de {correo}…"] },
      },
      prestar_sesion: {
        hiciste: "Le dejaste a Julián tu sesión abierta en tu equipo.",
        senal: "Lo que Julián haga en tu sesión queda a tu nombre.",
        paso: "Julián envió el reporte desde tu cuenta… y de paso abrió un enlace raro.",
        frase: "Tu contraseña es personal e intransferible.",
        pantalla: pE10,
        otroLado: { tipo: "neutral", titulo: "Registro de tu cuenta", lineas: ["Sesión usada por otra persona", "Todo queda a tu nombre"] },
      },
      mesa: {
        hiciste: "No le prestaste tu clave a Julián y lo mandaste a Mesa de Ayuda.",
        senal: "Tu clave es solo tuya; Mesa de Ayuda desbloquea la de él.",
        paso: "Julián recuperó su acceso en 10 minutos y tu cuenta siguió siendo solo tuya.",
        frase: "Tu contraseña es personal e intransferible.",
        pantalla: pE10,
        otroLado: { tipo: "seguridad", titulo: "Mesa de Ayuda", lineas: ["Caso de Julián: clave desbloqueada ✓"] },
      },
    },
  },
  E12: {
    frase: frases.correo,
    tarjetas: {
      enviar_codigos: {
        hiciste: "Compraste las tarjetas de regalo y le mandaste los códigos a “Andrea”.",
        senal: "Número nuevo, “estoy en reunión”, urgencia y tarjetas de regalo: no era Andrea.",
        paso: "Los $300.000 se perdieron y “Andrea” pidió más.",
        frase: "Verifica por otro canal antes de actuar.",
        pantalla: pE12,
        otroLado: { tipo: "estafador", titulo: "Chat del estafador", lineas: ["💳 3 códigos recibidos de {correo}", "“Pídele 2 más”"] },
      },
      comprar: {
        hiciste: "Le dijiste a “Andrea” que le comprabas las tarjetas.",
        senal: "Número nuevo, urgencia y tarjetas de regalo: no era Andrea.",
        paso: "No alcanzaste a mandar los códigos, pero el estafador supo que caes fácil.",
        frase: "Verifica por otro canal antes de actuar.",
        pantalla: pE12,
        otroLado: { tipo: "estafador", titulo: "Chat del estafador", lineas: ["{correo}: respondió", "Insistir más tarde"] },
      },
      reportar_y_verificar: {
        hiciste: "Le preguntaste a la Andrea real por su chat y reportaste el número.",
        senal: "Un número nuevo que pide dinero con prisa siempre se verifica por otro canal.",
        paso: "Seguridad avisó a toda el área antes de que alguien cayera.",
        frase: "Verifica por otro canal antes de actuar.",
        pantalla: pE12,
        otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["📥 Número reportado", "Alerta enviada al área ✓"] },
      },
      reportar: {
        hiciste: "Reportaste el número a Seguridad Informática.",
        senal: "Número nuevo, urgencia y tarjetas de regalo.",
        paso: "Seguridad avisó a toda el área antes de que alguien cayera.",
        frase: "Verifica por otro canal antes de actuar.",
        pantalla: pE12,
        otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["📥 Número reportado", "Alerta enviada al área ✓"] },
      },
      verificar_andrea: {
        hiciste: "Le preguntaste a la Andrea real por su chat de siempre.",
        senal: "Verificaste por otro canal.",
        paso: "No caíste. Reportar el número habría protegido al resto del área.",
        frase: "Verifica por otro canal antes de actuar.",
        pantalla: pE12,
        otroLado: { tipo: "estafador", titulo: "Chat del estafador", lineas: ["{correo}: no respondió", "Probando con el resto del área…"] },
      },
    },
  },
  E13: {
    frase: frases.descargas,
    tarjetas: {
      permitir: {
        hiciste: "Descargaste “Formato_Vacaciones_2026.exe” y lo permitiste de todos modos.",
        senal: "Venía de formatos-gratis-online.com y la protección del equipo te avisó que era peligroso.",
        paso: "El archivo cifró los archivos de tu escritorio y de la carpeta compartida.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos… 100 %"] },
      },
      cerrar_x: {
        hiciste: "Descargaste “Formato_Vacaciones_2026.exe” y cerraste la alerta con la ✕.",
        senal: "La alerta decía “Archivo potencialmente peligroso”. Cerrarla no es decidir.",
        paso: "Cerrar la alerta dejó el archivo en tu equipo, y se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos…"] },
      },
      cuarentena: {
        hiciste: "Descargaste “Formato_Vacaciones_2026.exe”, pero lo pusiste en cuarentena.",
        senal: "Venía de formatos-gratis-online.com.",
        paso: "La alerta te salvó, pero no debiste descargarlo.",
        frase: frases.descargas,
        pantalla: pE13,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      mas_info_cuarentena: {
        hiciste: "Descargaste el “formato”, leíste la alerta y lo pusiste en cuarentena.",
        senal: "Un formato de Word no termina en .exe.",
        paso: "El archivo nunca se ejecutó. El formato real estaba en la intranet.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      intranet: {
        hiciste: "Diligenciaste la solicitud de vacaciones en la intranet.",
        senal: "El primer resultado era un anuncio; la fuente oficial era intranet.fcv.org.",
        paso: "Andrea recibió tu solicitud y tu equipo siguió limpio.",
        frase: frases.descargas,
        pantalla: { app: "navegador", url: "intranet.fcv.org", noSeguro: false, titulo: "Intranet FCV — Formatos", senal: "La fuente oficial", legitimo: true },
        otroLado: { tipo: "neutral", titulo: "Andrea", lineas: ["“¡Recibí tu solicitud de vacaciones!”"] },
      },
    },
  },
  E16: {
    frase: frases.descargas,
    tarjetas: {
      permitir: {
        hiciste: "Instalaste la “herramienta de soporte” que te pidió un número desconocido y le diste “Permitir”.",
        senal: "Soporte de la FCV no te escribe desde un número que no está en tus contactos ni te pide instalar nada por chat.",
        paso: "Alguien tomó el control de tu equipo y copió tus archivos.",
        frase: frases.descargas,
        pantalla: { app: "chat", de: "+57 320 555 0187", texto: "Instale esta herramienta: soporte-remoto-fcv.com…", senal: "Número desconocido + instalar algo + prisa" },
        otroLado: { tipo: "estafador", titulo: "Panel de acceso remoto", lineas: ["🖥 Conectado a {correo}", "Copiando archivos…"] },
      },
      cerrar_x: {
        hiciste: "Descargaste la “herramienta de soporte” y cerraste la alerta con la ✕.",
        senal: "La alerta te lo advirtió. Cerrarla no es decidir.",
        paso: "El instalador quedó en tu equipo y se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de acceso remoto", lineas: ["🖥 Conectado a {correo}"] },
      },
      cuarentena: {
        hiciste: "Descargaste la “herramienta de soporte”, pero la pusiste en cuarentena.",
        senal: "Soporte de la FCV no pide instalar programas por chat.",
        paso: "La alerta te salvó, pero no debiste descargarla.",
        frase: frases.descargas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de acceso remoto", lineas: ["Conexión a {correo}: bloqueada"] },
      },
      mas_info_cuarentena: {
        hiciste: "Descargaste la herramienta, leíste la alerta y la pusiste en cuarentena.",
        senal: "Soporte de la FCV no pide instalar programas por chat.",
        paso: "El instalador nunca se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de acceso remoto", lineas: ["Conexión a {correo}: bloqueada"] },
      },
      reportar: {
        hiciste: "Reportaste el número del “soporte técnico” a Seguridad Informática.",
        senal: "Número desconocido que pide instalar un programa para “revisar tu equipo”.",
        paso: "Seguridad avisó al área antes de que alguien lo instalara.",
        frase: frases.descargas,
        pantalla: { app: "chat", de: "+57 320 555 0187", texto: "Instale esta herramienta…", senal: "Número desconocido + instalar algo", legitimo: true },
        otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["📥 Número reportado", "Alerta enviada al área ✓"] },
      },
      verificar: {
        hiciste: "Le pediste al “soporte” que lo confirmara por Mesa de Ayuda.",
        senal: "El soporte real atiende por Mesa de Ayuda, no por un número desconocido.",
        paso: "No instalaste nada. Reportar el número habría protegido al resto del área.",
        frase: frases.descargas,
        pantalla: { app: "chat", de: "+57 320 555 0187", texto: "Instale esta herramienta…", senal: "Pediste verificar", legitimo: true },
        otroLado: { tipo: "estafador", titulo: "Panel de acceso remoto", lineas: ["{correo}: no instaló", "Probando con el resto del área…"] },
      },
    },
  },
  E17: {
    frase: frases.alertas,
    tarjetas: {
      permitir: {
        hiciste: "Descargaste la “actualización del navegador” que se abrió sola y la permitiste.",
        senal: "Las actualizaciones reales no llegan en una pestaña que se abre sola desde actualiza-tu-navegador.net.",
        paso: "El programa empezó a mostrar publicidad y a leer lo que escribías.",
        frase: frases.alertas,
        pantalla: { app: "navegador", url: "actualiza-tu-navegador.net", noSeguro: true, titulo: "Tu navegador está desactualizado", senal: "Pestaña que se abrió sola + miedo + prisa" },
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Registrando teclas…"] },
      },
      cerrar_x: {
        hiciste: "Descargaste la “actualización del navegador” y cerraste la alerta con la ✕.",
        senal: "La alerta te lo advirtió. Cerrarla no es decidir.",
        paso: "El archivo quedó en tu equipo y se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}"] },
      },
      cuarentena: {
        hiciste: "Descargaste la “actualización del navegador”, pero la pusiste en cuarentena.",
        senal: "Las actualizaciones reales no llegan en una pestaña que se abre sola.",
        paso: "La alerta te salvó, pero no debiste descargarla.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      mas_info_cuarentena: {
        hiciste: "Descargaste la “actualización”, leíste la alerta y la pusiste en cuarentena.",
        senal: "Las actualizaciones reales no llegan en una pestaña que se abre sola.",
        paso: "El archivo nunca se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      cerrar: {
        hiciste: "Cerraste la pestaña de la “actualización urgente” sin descargar nada.",
        senal: "Se abrió sola, metía miedo y venía de actualiza-tu-navegador.net.",
        paso: "No pasó nada. Las actualizaciones reales las hace el área de TI.",
        frase: frases.alertas,
        pantalla: { app: "navegador", url: "actualiza-tu-navegador.net", noSeguro: true, titulo: "Tu navegador está desactualizado", senal: "Se abrió sola", legitimo: true },
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["{correo}: cerró la pestaña", "Sin descarga"] },
      },
    },
  },
  EX: {
    frase: frases.navegacion,
    tarjetas: {
      permitir: {
        hiciste: "Descargaste “AntivirusScan_Pro.exe” y lo permitiste de todos modos.",
        senal: "Venía de noticiasaldia-co.net y la protección del equipo te avisó que era peligroso.",
        paso: "El archivo cifró los archivos de tu escritorio y de la carpeta compartida.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos… 100 %"] },
      },
      cerrar_x: {
        hiciste: "Descargaste “AntivirusScan_Pro.exe” y cerraste la alerta con la ✕.",
        senal: "La alerta decía “Archivo potencialmente peligroso”. Cerrarla no es decidir.",
        paso: "Cerrar la alerta dejó el archivo en tu equipo, y se ejecutó.",
        frase: frases.alertas,
        pantalla: pDescarga,
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["🖥 Nuevo equipo: {correo}", "Cifrando archivos…"] },
      },
      cuarentena: {
        hiciste: "Descargaste “AntivirusScan_Pro.exe”, pero lo pusiste en cuarentena.",
        senal: "Venía de noticiasaldia-co.net.",
        paso: "La alerta te salvó, pero no debiste descargarlo.",
        frase: frases.descargas,
        pantalla: { app: "navegador", url: "noticiasaldia-co.net", noSeguro: false, titulo: "⚠ Su equipo está infectado", senal: "Una página de noticias no puede escanear tu equipo" },
        otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Descarga de {correo}: bloqueada"] },
      },
      llamar: {
        hiciste: "Llamaste al “soporte técnico” que apareció en una página de noticias.",
        senal: "Una página web no puede saber si tu equipo tiene virus. El soporte de la FCV es Mesa de Ayuda.",
        paso: "Te pidieron instalar un programa para “entrar a tu equipo”. Ya tienen tu nombre y tu número.",
        frase: frases.navegacion,
        pantalla: { app: "navegador", url: "noticiasaldia-co.net", noSeguro: false, titulo: "⚠ Llame YA a Soporte Técnico", senal: "Soporte falso" },
        otroLado: { tipo: "estafador", titulo: "Call center falso", lineas: ["📞 Llamada de {correo}", "Intentar acceso remoto…"] },
      },
      cupon_tarjeta: {
        hiciste: "Escribiste los datos de tu tarjeta para reclamar un “bono de $500.000”.",
        senal: "Nadie regala $500.000 por ser el visitante un millón.",
        paso: "Llegaron compras que tú no hiciste.",
        frase: frases.navegacion,
        pantalla: { app: "navegador", url: "superofertas-flash.shop", noSeguro: false, titulo: "🎁 ¡Eres el visitante 1.000.000!", senal: "Premio que pide tu tarjeta" },
        otroLado: { tipo: "estafador", titulo: "Panel “Premios”", lineas: ["💳 Tarjeta recibida", "Compras en curso…"] },
      },
    },
  },
  E14: {
    frase: frases.inesperado,
    tarjetas: {
      "14B_escribir_credenciales": {
        hiciste: "Escribiste tu contraseña para “validar” tu buzón.",
        senal: "El remitente era mesadeayuda-fcv.com, no @fcv.org; el aviso llegó sin que lo pidieras y te amenazaba con suspender tu cuenta.",
        paso: "Con tu clave, alguien entró a tu correo y empezó a escribirle a tus contactos.",
        frase: frases.consignaCorreo,
        pantalla: pE14b,
        otroLado: { tipo: "estafador", titulo: "Panel “Buzón lleno”", lineas: ["🎣 Contraseña recibida", "Usuario: {correo}", "Entrando al buzón…"] },
      },
      "14B_cerrar_sin_escribir": {
        hiciste: "Abriste “Validar mi cuenta”, pero cerraste la página sin escribir.",
        senal: "El remitente era mesadeayuda-fcv.com, no @fcv.org.",
        paso: "Te salvaste por poco: el estafador supo que abres sus enlaces.",
        frase: frases.consignaCorreo,
        pantalla: pE14b,
        otroLado: { tipo: "estafador", titulo: "Panel “Buzón lleno”", lineas: ["👀 {correo} abrió el enlace", "No escribió la contraseña"] },
      },
      "14B_clic_enlace": {
        hiciste: "Abriste “Validar mi cuenta” y dejaste la página abierta.",
        senal: "El remitente era mesadeayuda-fcv.com, no @fcv.org.",
        paso: "El estafador supo que tu correo está activo y que abres sus enlaces.",
        frase: frases.consignaCorreo,
        pantalla: pE14b,
        otroLado: { tipo: "estafador", titulo: "Panel “Buzón lleno”", lineas: ["👀 {correo} abrió el enlace", "Esperando contraseña…"] },
      },
      "14B_responder": {
        hiciste: "Le respondiste al falso soporte.",
        senal: "Le escribiste al mismo estafador: mesadeayuda-fcv.com no es @fcv.org.",
        paso: "Tu respuesta le confirmó que tu correo existe.",
        frase: frases.consignaCorreo,
        pantalla: pE14b,
        otroLado: { tipo: "estafador", titulo: "Bandeja del estafador", lineas: ["📩 Respuesta de {correo}"] },
      },
      "14B_reportar": {
        hiciste: "Reenviaste a Seguridad Informática el aviso de “buzón lleno”.",
        senal: "Viste que venía de mesadeayuda-fcv.com y que nadie te lo había anunciado.",
        paso: "Seguridad bloqueó ese remitente para todos.",
        frase: frases.inesperado,
        pantalla: pE14b,
        otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["📥 Reporte recibido", "mesadeayuda-fcv.com bloqueado"] },
      },
      "14A_encuesta": {
        hiciste: "Respondiste la encuesta real de Mesa de Ayuda.",
        senal: "Era de @fcv.org, sobre un caso que sí abriste, y llevaba a intranet.fcv.org.",
        paso: "Distinguiste el correo real del falso, aunque los dos decían “Mesa de Ayuda”.",
        frase: "Verificar no es rechazar todo.",
        pantalla: pE14a,
        otroLado: { tipo: "neutral", titulo: "Mesa de Ayuda", lineas: ["Encuesta recibida ✓"] },
      },
      "14A_reportar": {
        hiciste: "Reportaste como sospechosa la encuesta real de Mesa de Ayuda.",
        senal: "Era de @fcv.org y sobre un caso que sí abriste la semana pasada.",
        paso: "Seguridad revisó un correo legítimo mientras el falso seguía llegando.",
        frase: "Verificar no es rechazar todo. Aprende a distinguir.",
        pantalla: pE14a,
        otroLado: { tipo: "neutral", titulo: "Mesa de Ayuda", lineas: ["Encuesta: sin respuesta"] },
      },
      "14A_spam": {
        hiciste: "Mandaste a Spam la encuesta real de Mesa de Ayuda.",
        senal: "Era de @fcv.org y sobre un caso que sí abriste la semana pasada.",
        paso: "Ahora los correos reales de Mesa de Ayuda te llegarán a Spam.",
        frase: "Verificar no es rechazar todo. Aprende a distinguir.",
        pantalla: pE14a,
        otroLado: { tipo: "neutral", titulo: "Mesa de Ayuda", lineas: ["Encuesta: sin respuesta"] },
      },
    },
  },
  // Distracciones (guion 10.3): una tarjeta por sitio.
  distracciones: {
    frase: frases.dondeEntras,
    tarjetas: {
      videos: {
        hiciste: "Te pusiste a ver videos en horario de trabajo.",
        paso: "Se te fueron 15 minutos del día y tu productividad bajó 1 punto.",
        frase: frases.dondeEntras,
        pantalla: { app: "navegador", url: "clipsvirales-hoy.net", noSeguro: false, titulo: "Perrito haciendo fila en el banco 😂", senal: "15 minutos menos para tus pendientes" },
        otroLado: { tipo: "neutral", titulo: "Tu día", lineas: ["⏱ −15 minutos", "Productividad −1"] },
      },
      noticias: {
        hiciste: "Te pusiste a leer noticias en horario de trabajo.",
        paso: "Se te fueron 15 minutos del día y tu productividad bajó 1 punto.",
        frase: frases.dondeEntras,
        pantalla: { app: "navegador", url: "noticiasaldia-co.net", noSeguro: false, titulo: "Noticias al día", senal: "15 minutos menos para tus pendientes" },
        otroLado: { tipo: "neutral", titulo: "Tu día", lineas: ["⏱ −15 minutos", "Productividad −1"] },
      },
      tienda: {
        hiciste: "Te pusiste a mirar ofertas en una tienda en línea.",
        paso: "Se te fueron 15 minutos del día y tu productividad bajó 1 punto.",
        frase: frases.dondeEntras,
        pantalla: { app: "navegador", url: "superofertas-flash.shop", noSeguro: false, titulo: "SuperOfertas Flash", senal: "15 minutos menos para tus pendientes" },
        otroLado: { tipo: "neutral", titulo: "Tu día", lineas: ["⏱ −15 minutos", "Productividad −1"] },
      },
    },
  },
  E7: {
    frase: frases.reaccion,
    tarjetas: {
      desconectar_y_reportar: { hiciste: "Desconectaste la red y reportaste de inmediato.", paso: "Aislaste tu equipo y Seguridad contuvo el incidente a tiempo.", frase: frases.reaccion, otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["🚨 Reporte en {t}", "Equipo aislado", "Incidente contenido ✓"] } },
      reportar: { hiciste: "Reportaste de inmediato a Seguridad Informática.", paso: "Contuvieron el incidente antes de que llegara a otras áreas.", frase: frases.reaccion, otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["🚨 Reporte en {t}", "Incidente contenido ✓"] } },
      mesa_ayuda: { hiciste: "Abriste un caso en Mesa de Ayuda.", paso: "Lo escalaron a Seguridad Informática. Por WhatsApp o correo habría sido aún más rápido.", frase: frases.reaccion, otroLado: { tipo: "seguridad", titulo: "Mesa de Ayuda → Seguridad", lineas: ["Caso escalado", "Incidente contenido ✓"] } },
      contar_companero: { hiciste: "Solo le contaste a Julián.", paso: "Julián no podía hacer nada. Mientras tanto, el problema se extendió.", frase: frases.noOcultes, otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Nadie reportó", "Avanzando a otras áreas…"] } },
      desconectar: { hiciste: "Desconectaste la red, pero no avisaste a nadie.", paso: "Frenaste tu equipo, pero Seguridad no supo qué pasó ni pudo revisar los demás.", frase: frases.noOcultes, otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Equipo desconectado", "Nadie reportó: seguimos en los demás"] } },
      reiniciar: { hiciste: "Reiniciaste el equipo y seguiste trabajando.", paso: "El problema seguía ahí y llegó a Facturación, Atención al usuario y Archivo.", frase: frases.noOcultes, otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Reinicio detectado", "Seguimos: 4 áreas afectadas"] } },
      nada: { hiciste: "No hiciste nada mientras el reloj corría.", paso: "Nadie se enteró a tiempo: las 4 áreas quedaron afectadas.", frase: frases.noOcultes, otroLado: { tipo: "estafador", titulo: "Panel de control", lineas: ["Nadie reportó", "4 áreas afectadas"] } },
      // 7B
      B_reportar: { hiciste: "Le dijiste a Julián que reportara ya.", paso: "Julián reportó y Seguridad bloqueó su cuenta a tiempo.", frase: "Equivocarse no es el problema; callarlo sí.", otroLado: { tipo: "seguridad", titulo: "Seguridad Informática", lineas: ["Reporte de Julián recibido", "Contraseña restablecida ✓"] } },
      B_cambiar_clave: { hiciste: "Le dijiste a Julián que solo cambiara su clave.", paso: "Cambió la clave, pero nadie revisó lo que alcanzaron a hacer con su cuenta.", frase: frases.noOcultes, otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["Cuenta de Julián: 3 correos enviados antes del cambio"] } },
      B_andrea: { hiciste: "Le dijiste a Julián que primero le contara a Andrea.", paso: "Julián lo pensó demasiado. Mientras tanto, su cuenta siguió en otras manos.", frase: frases.noOcultes, otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["Cuenta de Julián: activa", "Nadie ha reportado"] } },
      B_tranquilo: { hiciste: "Le dijiste a Julián que no pasaba nada.", paso: "Julián no reportó. Desde su cuenta salieron correos falsos a toda el área.", frase: frases.noOcultes, otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["Cuenta de Julián: activa", "Enviando correos a su área…"] } },
    },
  },
  E7J: {
    frase: frases.noOcultes,
    tarjetas: {
      tranquilo: { hiciste: "Mientras atendías tu incidente, le dijiste a Julián que no pasaba nada.", paso: "Julián no reportó y desde su cuenta salieron correos falsos al área.", frase: frases.noOcultes, pantalla: { app: "chat", de: "Julián Ortiz", texto: "¿Lo dejo así?", senal: "Él también necesitaba reportar" }, otroLado: { tipo: "estafador", titulo: "Panel de la campaña “Nómina”", lineas: ["Cuenta de Julián: activa"] } },
    },
  },
};

// Cadena de dominó final según la etiqueta más grave (guion P6). ✎
export const cadenas = {
  MALWARE: ["Archivo descargado", "Se ejecutó en tu equipo", "Archivos cifrados", "Facturación y Archivo sin acceso"],
  CREDENCIALES_BANCO: ["Página falsa", "Datos bancarios entregados", "Acceso a tu cuenta", "Cambio de cuenta de nómina"],
  CREDENCIALES: ["Correo falso", "Contraseña entregada", "Acceso a tu cuenta", "47 correos en tu nombre"],
  EXTENSION: ["Extensión instalada", "Lee todo en tu navegador", "Copia tu sesión", "Inicio de sesión ajeno"],
  PERMISOS: ["Alerta ignorada", "Permisos concedidos", "Cámara en otras manos", "Notificaciones falsas"],
  FRAUDE: ["Mensaje de un “conocido”", "No verificaste", "Datos o dinero entregados", "Te piden más"],
};

/**
 * Repaso de la carta final (guion 11.3): dónde se fueron los puntos y qué era lo mejor.
 * Cada fila dice el error humano del documento base al que pertenece. ✎ Textos para revisar con Cristian.
 */
export const repaso = {
  titulo: "Dónde se fueron tus puntos",
  intro: "Cada cosa que te restó o que pudo sumarte más, y qué era lo mejor.",
  perfecto: "No se te escapó ningún punto. Así se trabaja seguro.",
  obtuviste: (p, m) => `sacaste ${p > 0 ? "+" : p < 0 ? "−" : ""}${Math.abs(p)} de ${m} posibles`,
  perdiste: (n) => `−${n}`,
  falto: (n) => `faltó ${n}`,
  faltoLargo: (n) => `Te faltó ${n} ${n === 1 ? "punto" : "puntos"}`,
  hicisteEtq: "Hiciste",
  visibles: 8, // guion 19: filas que se ven antes de "Ver todo"
  verTodo: (n) => `Ver ${n} más`,
  verMenos: "Ver menos",
  recupero: "Después lo reportaste a Seguridad: eso te devolvió 1 punto.",
  mejorEtq: "Lo mejor era",
  // Los cinco errores humanos del documento base (y dos grupos del juego).
  errores: {
    correo: "Confiar demasiado en el correo",
    navegacion: "Navegar sin verificar",
    descargas: "Descargar sin comprobar",
    alertas: "Ignorar las alertas",
    reaccion: "No reaccionar",
    personas: "Confiar sin verificar quién te escribe",
    legitimo: "Reconocer lo que sí es real",
    jornada: "Tu jornada",
  },
  filas: {
    E1: { titulo: "Correo de “Gestión Humana” sobre la nómina", error: "correo", mejor: "Revisar el remitente (fcv-nomina.co no es @fcv.org) y reportarlo: Reenviar → seguridadinformatica@fcv.org. Moverlo a Spam o eliminarlo solo te protege a ti; reenviarlo a Seguridad protege a todos." },
    E2: { titulo: "Correo de Andrea con la programación", error: "legitimo", mejor: "Era real: abrir el adjunto y responderle a Andrea. Reportar un correo legítimo le quita tiempo a Seguridad." },
    "3A": { titulo: "Correo con adjunto en la carpeta Spam", error: "correo", mejor: "Sin abrir el adjunto, reportarlo: Reenviar → seguridadinformatica@fcv.org." },
    "3B": { titulo: "Correo real que cayó en Spam", error: "legitimo", mejor: "Leerlo o marcarlo como “No es spam”: no todo lo que llega a Spam es malo." },
    E8: { titulo: "Capacitación obligatoria de Talento Humano", error: "legitimo", mejor: "Era real (viene de @fcv.org y te saluda por tu nombre): inscribirte desde el enlace a la intranet antes de las 10:00." },
    E9: { titulo: "El video que mandaron al grupo", error: "descargas", mejor: "No abrir enlaces de videos que llegan por chat, aunque los mande alguien del área. Y si una página te pide “actualizar el reproductor”, no descargar nada." },
    "14A": { titulo: "Encuesta de Mesa de Ayuda", error: "legitimo", mejor: "Era real (helpdesk@fcv.org, te hablaba de un caso tuyo): responder la encuesta en la intranet." },
    "14B": { titulo: "“Tu buzón está al 98 %”", error: "correo", mejor: "Reportarlo con Reenviar → seguridadinformatica@fcv.org: la prisa (“valida o se suspende”) es la señal, y mesadeayuda-fcv.com no es @fcv.org." },
    E10: { titulo: "Julián te pide tu clave", error: "personas", mejor: "No prestar la clave ni la sesión, y mandar a Julián a Mesa de Ayuda, que es quien desbloquea cuentas." },
    E4: { titulo: "Portal de bonos que compartió Julián", error: "navegacion", mejor: "No entrar a un portal que llegó por un grupo de WhatsApp: actualizar tus datos por el favorito Intranet FCV y avisarle a Julián que esa dirección no es de la FCV." },
    E5: { titulo: "Pasar el informe a PDF", error: "descargas", mejor: "Guardarlo como PDF desde Documentos, sin programas ni extensiones de internet, y enviarlo por correo. Si no sabes cómo, Mesa de Ayuda." },
    E12: { titulo: "“Andrea” desde otro número", error: "personas", mejor: "Un pedido urgente de dinero desde un número nuevo se verifica por el chat de siempre, y el número se reporta." },
    E6: { titulo: "“Tu conexión no es privada”", error: "alertas", mejor: "Leer la alerta y darle Volver (abrir el enlace no resta). “Continuar de todos modos” no siempre es la respuesta: Lee → Verifica → Decide." },
    E16: { titulo: "“Soporte técnico” por chat", error: "descargas", mejor: "No instalar nada que te pidan por chat. El soporte real atiende por Mesa de Ayuda: repórtale el número a Seguridad (🚩 en el chat o un caso en Mesa de Ayuda)." },
    E17: { titulo: "“Tu navegador está desactualizado”", error: "alertas", mejor: "Cerrar la pestaña sin descargar nada: las actualizaciones reales no llegan en una página que se abre sola. Las hace el área de TI." },
    E13: { titulo: "Formato de vacaciones", error: "descargas", mejor: "Descargar el formato desde Intranet → Formatos, no desde un anuncio del buscador." },
    E7: { titulo: "El incidente de las 12:15", error: "reaccion", mejor: "Reportar de inmediato a Seguridad Informática (y si tu equipo está comprometido, desconectar la red). Callar un error lo agranda." },
    E7J: { titulo: "Julián escribe durante el incidente", error: "reaccion", mejor: "Decirle que reporte ya; “tranquilo, no pasa nada” le da tiempo al atacante." },
    EX: { titulo: "Trampas mientras navegabas", error: "descargas", mejor: "No llamar a números de “soporte” de un aviso, no descargar “antivirus” de una página de noticias y no dar datos de tarjeta por un premio." },
    distraccion: { titulo: (sitio) => `Distracción: ${{ videos: "videos", noticias: "noticias", tienda: "tienda en línea" }[sitio] || sitio}`, error: "jornada", mejor: "Dejarlo para después del trabajo: cada visita te quitó 15 minutos del día." },
    pendiente: {
      titulo: (texto) => `Pendiente: ${texto}`,
      grupo: (n) => (n === 1 ? "1 pendiente sin hacer a tiempo" : `${n} pendientes sin hacer a tiempo`), error: "jornada", tarde: "Lo hiciste después de la hora límite.", sinHacer: "No alcanzaste a hacerlo.",
      mejor: {
        informe: "Guardarlo como PDF desde Documentos y enviárselo a Andrea por correo antes de las 12:00.",
        beneficios: "Entrar por el favorito Intranet FCV → Beneficios.",
        capacitacion: "Inscribirte desde el correo de Talento Humano antes de las 10:00.",
        impresora: "Crear el caso en Mesa de Ayuda.",
        vacaciones: "Diligenciar la solicitud desde Intranet FCV → Formatos.",
        reservar: "Reservar la sala desde Intranet FCV → Reservas.",
        spam: "Abrir la carpeta Spam y leer los dos correos que llegaron.",
      },
    },
  },
  // Lo que hiciste, cuando la tarjeta del rebobinado no lo dice.
  hiciste: {
    ignorar: "No hiciste nada con él.",
    "3A_ignorar": "No hiciste nada con él.",
    "3B_ignorar": "No lo abriste.",
    "14A_ignorar": "No respondiste la encuesta.",
    "14B_ignorar": "No hiciste nada con él.",
    no_abrir: "No lo abriste.",
    sin_respuesta: "No respondiste.",
    no_llego: "No llegaste a esta parte.",
    spam: "Lo moviste a Spam.",
    "14B_spam": "Lo moviste a Spam.",
    eliminar: "Lo eliminaste.",
    "3A_eliminar": "Lo eliminaste.",
    "3B_eliminar": "Lo eliminaste sin leerlo.",
    "14B_eliminar": "Lo eliminaste.",
    "14A_spam": "Moviste la encuesta real a Spam.",
    negar: "Le dijiste que no, pero no le dijiste a dónde acudir.",
    bloquear: "Bloqueaste el número sin reportarlo.",
    abrir_video: "Abriste el video.",
    cerrar: "Cerraste el portal falso, pero no actualizaste tus datos en la intranet.",
    descargar: "Descargaste un archivo de una página dudosa.",
    E2_no_abrir: "No abriste la programación ni le respondiste a Andrea.",
    E8_ignorar: "No te inscribiste.",
    E5_ignorar: "No enviaste el informe.",
    E13_ignorar: "No enviaste la solicitud.",
    E6_ignorar: "No revisaste el catálogo ni le escribiste al proveedor.",
    E16_aceptar: "Le dijiste al “soporte” que sí la instalabas.",
    E16_negar: "Le dijiste que no, pero no reportaste el número.",
    E17_ignorar: "Dejaste abierta la pestaña de la “actualización”.",
  },
};
