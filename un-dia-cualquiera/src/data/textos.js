/**
 * Textos de pantallas (docs/02_GUION.md, sección 3) y de la interfaz del escritorio y del correo.
 * Los componentes solo renderizan lo que hay aquí.
 */
import { config } from "./config.js";

const { seguridad, whatsapp, mesaAyuda } = config.canales;

export const textos = {
  // Título (guion 8.1). El modo práctica NO se ofrece aquí.
  titulo: {
    nombre: "Un día cualquiera",
    lema: "Pequeñas acciones, grandes riesgos.",
    bajada: "Una mañana de trabajo como cualquier otra. Un solo intento.",
    jugar: "Jugar",
    comoSeJuega: "Cómo se juega",
    firma: "Dirección de Ciberseguridad · FCV",
  },

  comoSeJuega: {
    titulo: "Cómo se juega",
    puntos: [
      ["💻", "Vas a vivir una mañana de trabajo frente a tu computador: correo, chat, navegador, documentos y Mesa de Ayuda."],
      ["✅", "Tienes pendientes, algunos con hora límite, y te van a llegar más. Andrea, tu jefa, te va a presionar."],
      ["⏱", "El tiempo del día es limitado: lo que te distraiga te lo quita."],
      ["⭐", "Tu puntaje suma lo que resuelves bien (tu trabajo y lo que te llega) y resta lo que sale mal."],
      ["🖱", "No hay preguntas. Trabaja como lo haces siempre: el juego se fija en lo que haces."],
      ["🚩", "Si algo te parece sospechoso, repórtalo: en el correo, Reenviar a Seguridad Informática."],
      ["⏪", "A la 1:00 p.m. verás qué pasó después de cada clic."],
      ["🏆", "Tienes un solo intento con tu cédula. Gana el mejor puntaje; si hay empate, quien termine más rápido."],
    ],
    duracion: "Dura unos 8 minutos. Se disfruta más en computador.",
    volver: "Volver",
    jugar: "Jugar",
  },

  // P1 — Ingreso (texto de privacidad pendiente de validación por jurídica; enlace a la política pendiente)
  ingreso: {
    titulo: "Antes de empezar",
    instruccion: "Escribe tus datos para iniciar tu jornada.",
    nombre: "Nombre",
    apellido: "Apellido",
    documento: "Número de documento",
    ayudaDocumento: "Solo números, sin puntos.",
    tuCorreo: (c) => `Tu correo en el juego será ${c}`,
    privacidad: "Este juego **no es una evaluación de desempeño**. Los resultados se analizan **de forma agregada** para mejorar las capacitaciones de Ciberseguridad y **no tienen carácter sancionatorio**. Juega como trabajas normalmente.",
    ley: "Tus datos se tratan conforme a la Ley 1581 de 2012 y a la política de tratamiento de datos de la FCV.",
    verPolitica: "Ver política",
    urlPolitica: null, // pendiente
    unIntento: "Tienes un solo intento. Cuando empieces, no se puede repetir.",
    boton: "Iniciar jornada",
    volver: "Volver",
    errores: {
      nombre: "Escribe tu nombre.",
      apellido: "Escribe tu apellido.",
      documento: "Escribe tu número de documento (entre 5 y 12 dígitos).",
      noAutorizado: `Tu documento no está habilitado para esta capacitación. Escribe a ${seguridad}.`,
      yaParticipo: "Ya completaste tu jornada. ¡Gracias! Puedes jugar en modo práctica.",
      botonPractica: "Jugar en modo práctica",
    },
  },

  // P2 — Intro (≈15 s, se puede saltar)
  intro: {
    lineas: ["Lunes. 6:58 a.m.", "Llegas a tu puesto. Café en mano.", "Una lista de pendientes. Una jefa con prisa. Una bandeja llena.", "Un día cualquiera."],
    saltar: "Saltar",
    continuar: "Empezar",
  },

  // P3 — Tutorial (4 globos). Sin pistas sobre revisar remitentes ni enlaces.
  tutorial: {
    pasos: [
      { ancla: "pendientes", titulo: "Tus pendientes", texto: "Están en la barra de tareas. Cada uno que completes a tiempo suma a tu puntaje; algunos tienen hora límite y durante el día te llegarán más. Cada uno te dice en qué programa se hace." },
      { ancla: "barra", titulo: "Tus herramientas", texto: "Correo, Navegador, Documentos y Mesa de Ayuda. Ábrelas cuando las necesites." },
      // Guion 13.1: cómo se reporta, igual que en el correo real de la FCV (no hay botón "Reportar").
      { ancla: "barra", titulo: "¿Algo te parece sospechoso?", texto: "Repórtalo a Seguridad Informática como en tu correo de la FCV: Reenviar → escribe “Seguridad Informática” → Enviar." },
      { ancla: "chat", titulo: "El chat", texto: "Aquí te escriben Andrea, tu jefa; Julián, tu compañero, y el grupo del área. Cada conversación va aparte y respondes con un toque." },
      { ancla: "reloj", titulo: "El reloj", texto: "El día avanza solo hasta la 1:00 p.m. Al final verás tu puntaje: suma lo que resuelves bien, tanto tu trabajo como lo que te llega por correo y chat. Si se te pasa un aviso, toca la hora." },
    ],
    siguiente: "Siguiente",
    empezar: "¡A trabajar!",
    paso: (i, n) => `${i} de ${n}`,
  },

  // P5 — Revelación de los dos marcadores (guion 8.3)
  revelacion: {
    fin: "1:00 p.m. Fin de la jornada.",
    decisiones: "Una mañana como cualquier otra… o eso parecía.",
    productividad: "Productividad",
    giro: "Hoy te medimos dos cosas. Solo te mostramos una.",
    riesgo: "Riesgo",
    niveles: { bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico" },
    remate: "Esto es lo que pasó después del clic.",
    ver: "Ver lo que pasó",
  },

  // P6 — Rebobinado
  rebobinado: {
    titulo: "Después del clic",
    tuPantalla: "Tu pantalla",
    otroLado: "Al otro lado",
    hiciste: "Lo que hiciste",
    senal: "Lo que había que ver",
    paso: "Lo que pasó después",
    siguiente: "Siguiente",
    anterior: "Anterior",
    saltar: "Saltar al resumen",
    verResumen: "Ver mi resultado",
    tarjeta: (i, n) => `${i} / ${n}`,
    domino: "La cadena",
    cortada: (s) => `Reportaste en ${s} s ✂ Incidente contenido`,
    sinCortar: "Nadie la cortó a tiempo.",
    sinTarjetas: "Hoy no hubo nada que rebobinar. Así se ve un día bien trabajado.",
    acierto: "Acierto",
    error: "Error",
    // Pendientes (guion 10.3)
    tardeHiciste: (t, h) => `Completaste “${t}” después de las ${h}.`,
    tardePaso: "Llegó tarde: ese pendiente no sumó a tu productividad.",
    tardeLimite: (h) => `Era para antes de las ${h}`,
    tardeLinea: "Pendiente fuera de tiempo: +0",
    tuDia: "Tu día",
    sinHacerSenal: (n) => (n === 1 ? "1 pendiente quedó sin hacer" : `${n} pendientes quedaron sin hacer`),
    sinHacerLinea: (n) => `Productividad −${n}`,
    sinHacerTitulo: "Pendientes que no alcanzaste",
    sinHacerTexto: "Cada pendiente sin hacer es un punto menos de productividad.",
    frasePendientes: "Pequeñas acciones, grandes riesgos.",
  },

  // P7 — Resultado
  resultado: {
    puntaje: "Puntaje",
    de: (m) => `de ${m}`,
    perfil: "Tu perfil",
    puntoDebil: "Tu punto débil",
    sinPuntoDebil: "Sin punto débil hoy",
    riesgo: "Riesgo",
    productividad: "Productividad",
    pendientes: (h, t) => `${h} de ${t} pendientes a tiempo`,
    distracciones: (n) => (n ? ` · ${n} ${n === 1 ? "distracción" : "distracciones"}` : ""),
    tiempo: "Tiempo de juego",
    registrado: "Tu participación quedó registrada. El ganador se anuncia al cierre de la campaña.",
    practica: "Partida de práctica: no se registra.",
    continuar: "Continuar",
  },

  // P8 — Cierre
  cierre: {
    preguntas: "¿Hiciste clic? ¿Descargaste algo? ¿Ingresaste información? ¿Ignoraste una alerta?",
    llamado: "No ocultes el error ni esperes a ver qué ocurre.",
    canales: [
      { icono: "📧", texto: `${seguridad}`, nota: "o reenvía ahí el correo sospechoso" },
      { icono: "💬", texto: `WhatsApp ${whatsapp}` },
      { icono: "🛠", texto: `Mesa de Ayuda: ${mesaAyuda}` },
    ],
    lema: "Pequeñas acciones, grandes riesgos.",
    firma: "Dirección de Ciberseguridad FCV",
    botonPractica: "Jugar en modo práctica",
    inicio: "Volver al inicio",
  },

  // P9 — Modo práctica
  practica: {
    marcaAgua: "Modo práctica — no se registra",
  },

  // ── Escritorio ──
  escritorio: {
    apps: {
      correo: "Correo",
      navegador: "Navegador",
      documentos: "Documentos",
      mesa: "Mesa de Ayuda",
    },
    tituloVentana: {
      correo: "Correo FCV",
      navegador: "Navegador",
      documentos: "Documentos",
      mesa: "Mesa de Ayuda",
      chat: "Chat",
    },
    enConstruccion: "Esta aplicación se habilita en la siguiente fase.",
    minimizar: "Minimizar",
    cerrar: "Cerrar",
    reloj: "Hora",
    pendientes: { titulo: "Pendientes de hoy", plegar: "Plegar pendientes", desplegar: "Ver pendientes", hecho: "Hecho", porHacer: "Por hacer", tarde: "Tarde", vencido: "Vencido", antesDe: (h) => `antes de las ${h}`, nuevos: (n) => (n === 1 ? "1 nuevo" : `${n} nuevos`) },
    chat: {
      titulo: "Chat",
      abrir: "Abrir chat",
      cerrar: "Cerrar chat",
      volver: "Conversaciones",
      sinMensajes: "Sin mensajes por ahora.",
      nuevo: "Mensaje nuevo",
      escribir: "Elige una respuesta rápida",
      sugerido: "Escribirle:",
      noContacto: "Este número no está en tus contactos.",
      reportar: "🚩 Reportar a Seguridad",
      bloquear: "Bloquear",
      reportado: "Número reportado a Seguridad Informática. Gracias por avisar.",
      bloqueado: "Número bloqueado.",
      estadoReportado: "Reportaste este número a Seguridad Informática.",
      estadoBloqueado: "Bloqueaste este número.",
      expiro: "Ya no alcanzaste a responder.",
      tu: "Tú",
    },
    seguir: "Seguir con mi día",
    seguirAyuda: "Adelanta el reloj hasta lo siguiente",
    adelantando: "Adelantando…",
    sonido: { activar: "Activar sonido", silenciar: "Silenciar" },
    productividad: "Productividad",
    animoJefa: (e) => `Andrea: ${e}`,
    archivosEscritorio: ["Informe_mensual.docx", "Presupuesto_2026.xlsx", "Fotos_bienestar.jpg"],
    red: { conectado: "Conectado", desconectado: "Sin red", desconectar: "Desconectar la red", reconectar: "Conectar la red" },
    clima: { temp: "24 °C", texto: "Parcialmente nublado" },
    menuInicio: { titulo: "Inicio", apps: "Aplicaciones", apagar: "Apagar (no disponible en la simulación)", buscar: "Escribe aquí para buscar" },
    movilAviso: "Se disfruta más en computador, pero puedes jugar aquí.",
    toasts: {
      correoNuevo: (de) => `Correo nuevo de ${de}`,
      finJornada: "1:00 p.m. Fin de la jornada.",
      pendienteHecho: (t) => `Pendiente completado: ${t}`,
      pendienteTarde: (t) => `Completado, pero tarde: ${t}`,
      nuevoPendiente: (t) => `Nuevo pendiente: ${t}`,
    },
    notificaciones: "Notificaciones",
    inicio: "Inicio",
    volverInicio: "Ir al inicio",
    // Centro de notificaciones (guion 12.1)
    centro: {
      titulo: "Notificaciones",
      abrir: (n) => (n ? `Notificaciones (${n} sin ver)` : "Notificaciones"),
      borrarTodo: "Borrar todo",
      quitar: "Quitar notificación",
      vacio: "No hay notificaciones nuevas",
      calendario: { mes: "septiembre de 2026", semana: ["L", "M", "M", "J", "V", "S", "D"], primerDia: 1, dias: 30, hoy: 28 },
    },
    iconosOcultos: "Mostrar íconos ocultos",
    bateria: "Batería: 86 %",
  },

  // ── Correo FCV (réplica de la disposición de Zimbra) ──
  correo: {
    marca: "Correo FCV",
    buscar: "Buscar",
    pestanas: ["Correo", "Contactos", "Agenda", "Tareas", "Maletín"],
    vacioPestana: (p) => `No hay elementos en ${p}.`,
    refrescar: "Refrescar",
    nuevoMensaje: "Nuevo mensaje",
    botones: {
      responder: "Responder",
      responderTodos: "Responder a todos",
      reenviar: "Reenviar",
      archivo: "Archivo",
      eliminar: "Eliminar",
      spam: "Spam",
      noSpam: "No es spam",
      imprimir: "Imprimir",
      etiqueta: "Etiquetar",
      acciones: "Acciones",
      seguirLeyendo: "Seguir leyendo",
      ver: "Ver",
      mas: "Más",
    },
    carpetasTitulo: "Carpetas de correo",
    carpetas: {
      entrada: "Bandeja de entrada",
      enviados: "Enviados",
      borradores: "Borradores",
      spam: "Spam",
      papelera: "Papelera",
    },
    secciones: ["Búsquedas", "Etiquetas", "Zimlets"],
    ordenado: "Ordenado por Fecha",
    conversaciones: (n) => `${n} ${n === 1 ? "conversación" : "conversaciones"}`,
    mensajes: (n) => `${n} ${n === 1 ? "mensaje" : "mensajes"}`,
    carpetaVacia: "No hay resultados.",
    lecturaVacia: "Para ver una conversación, haz clic en ella.",
    de: "De:",
    para: "Para:",
    asunto: "Asunto:",
    adjunto: { descargar: "Descargar", maletin: "Maletín", eliminar: "Eliminar" },
    pie: ["Mostrar texto entre comillas", "Responder", "Responder a todos", "Reenviar", "Más acciones"],
    volver: "Volver",
    tarjeta: {
      titulo: "Detalles del remitente",
      nombre: "Nombre",
      correo: "Correo",
      dominio: "Dominio",
      cerrar: "Cerrar",
    },
    enlace: {
      titulo: "Este enlace lleva a:",
      abrir: "Abrir enlace",
      cancelar: "Cancelar",
    },
    redactar: {
      enviar: "Enviar",
      cancelar: "Cancelar",
      guardarBorrador: "Guardar borrador",
      para: "Para:",
      asunto: "Asunto:",
      prefijoReenvio: "RV: ",
      prefijoRespuesta: "RE: ",
      nuevo: "Mensaje nuevo",
      originalSeparador: "----- Mensaje original -----",
      sugerencias: "Contactos",
      errorSinDestinatario: "Agrega al menos un destinatario.",
      errorDireccion: (d) => `"${d}" no es una dirección de correo válida.`,
      quitar: (d) => `Quitar ${d}`,
      adjuntos: "Adjuntos:",
      adjuntar: "Adjuntar",
      elegirArchivo: "Adjuntar un archivo de Documentos",
      sinArchivos: "No hay archivos en Documentos.",
      quitarAdjunto: (n) => `Quitar ${n}`,
    },
    toasts: {
      enviado: "Mensaje enviado.",
      movidoSpam: "1 mensaje marcado como spam.",
      movidoEntrada: "1 mensaje movido a la Bandeja de entrada.",
      eliminado: "1 mensaje movido a la Papelera.",
      archivado: "1 mensaje archivado.",
      borrador: "Borrador guardado.",
      maletin: (n) => `${n} guardado en el Maletín.`,
      adjuntoEliminado: (n) => `Adjunto ${n} eliminado.`,
      impresora: "Enviado a la impresora.",
      descargando: (n) => `Descargando ${n}…`,
    },
    usuarioMenu: "Menú de usuario",
    cuota: "Cuota de buzón",
  },

  // Aviso legal institucional al pie de los correos de @fcv.org (texto genérico redactado para el juego).
  avisoLegal:
    "AVISO LEGAL: Este mensaje y sus anexos son confidenciales y están dirigidos exclusivamente a su destinatario. Pueden contener datos personales protegidos por la Ley 1581 de 2012 y demás normas sobre protección de datos personales. Si usted no es el destinatario, le informamos que está prohibida su retención, divulgación o utilización con cualquier propósito. Si lo recibió por error, por favor elimínelo y avise al remitente. Fundación Cardiovascular de Colombia.",

  visor: {
    cerrar: "Cerrar",
    soloLectura: "Vista previa · solo lectura",
  },

  fecha: {
    dias: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    diasCortos: ["D", "L", "M", "M", "J", "V", "S"],
    meses: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    am: "a.m.",
    pm: "p.m.",
  },
};
