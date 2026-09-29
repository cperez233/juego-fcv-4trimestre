/**
 * Íconos SVG propios (sin librerías ni logos de marcas). Trazo con currentColor.
 * Uso: <Icono nombre="correo" /> — decorativo por defecto (aria-hidden).
 */
const P = {
  correo: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3.5 6 8.5 7 8.5-7" /></>,
  navegador: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3C9.4 5.6 8.2 8.6 8.2 12s1.2 6.4 3.8 9" /></>,
  documentos: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2" /></>,
  mesa: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13" width="4" height="6" rx="1" /><rect x="17" y="13" width="4" height="6" rx="1" /><path d="M19 19c0 1.5-1.5 2-3 2h-3" /></>,
  red: <><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0" /><circle cx="12" cy="19" r="1" fill="currentColor" /></>,
  redOff: <><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0" opacity=".35" /><path d="m4 4 16 16" /></>,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  casilla: <rect x="4" y="4" width="16" height="16" rx="2" />,
  casillaOk: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 12.5 3 3 5.5-6" /></>,
  cerrar: <path d="m6 6 12 12M18 6 6 18" />,
  minimizar: <path d="M6 17h12" />,
  atras: <path d="M15 5 8 12l7 7" />,
  adelante: <path d="m9 5 7 7-7 7" />,
  caretAbajo: <path d="m7 10 5 5 5-5z" fill="currentColor" stroke="none" />,
  caretDer: <path d="m10 7 5 5-5 5z" fill="currentColor" stroke="none" />,
  clip: <path d="m20 11.5-7.8 7.8a5 5 0 0 1-7-7l8.3-8.3a3.3 3.3 0 0 1 4.7 4.7L10 16.9a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4" />,
  bandera: <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>,
  engranaje: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>,
  bandeja: <><path d="M4 13v6h16v-6" /><path d="M4 13h4.5l1.5 2.5h4l1.5-2.5H20" /><path d="M12 3v8M8.5 7.5 12 11l3.5-3.5" /></>,
  enviados: <><path d="M3 11.5 21 4l-5 16-4.5-6.5z" /><path d="m11.5 13.5 4-4" /></>,
  borradores: <><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" /><path d="m14.5 7.5 3 3" /></>,
  spam: <><circle cx="12" cy="12" r="8.5" /><path d="m6 6 12 12" /></>,
  papelera: <><path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13" /><path d="M10 11v6M14 11v6" /></>,
  buscar: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  refrescar: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></>,
  imprimir: <><path d="M7 9V3.5h10V9" /><rect x="3.5" y="9" width="17" height="7.5" rx="1" /><path d="M7 14h10v6.5H7z" /></>,
  etiqueta: <><path d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5z" /><circle cx="8" cy="8.5" r="1.3" /></>,
  persona: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.4 4-6.5 8-6.5s7.2 2.1 8 6.5" /></>,
  adjunto: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>,
  responder: <><path d="M10 6 4 12l6 6" /><path d="M4 12h9a7 7 0 0 1 7 7" /></>,
  reenviar: <><path d="m14 6 6 6-6 6" /><path d="M20 12h-9a7 7 0 0 0-7 7" /></>,
  mas: <><circle cx="5.5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="18.5" cy="12" r="1.4" fill="currentColor" /></>,
  advertencia: <><path d="M12 3.5 2.5 20h19z" /><path d="M12 10v4.5M12 17.2v.3" /></>,
  candado: <><rect x="5" y="10.5" width="14" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  lista: <><path d="M9 6.5h11M9 12h11M9 17.5h11" /><path d="m3.5 6.5 1.3 1.3 2-2.3M3.5 12l1.3 1.3 2-2.3M3.5 17.5l1.3 1.3 2-2.3" /></>,
  inicio: <><path d="M4 11 12 4l8 7" /><path d="M6 9.5V20h12V9.5" /></>,
  reloj: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  hoja: <><rect x="3.5" y="4" width="17" height="16" rx="1" /><path d="M3.5 9h17M3.5 14.5h17M9.5 4v16" /></>,
  ojo: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  campana: <><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  chevronArriba: <path d="m7 14 5-5 5 5" />,
  volumen: <><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  silencio: <><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></>,
  bateria: <><rect x="3" y="8" width="16" height="8" rx="1.5" /><path d="M21 11v2" /><rect x="5" y="10" width="10" height="4" fill="currentColor" stroke="none" /></>,
  adelantar: <><path d="M4 6.5 11 12l-7 5.5zM12.5 6.5l7 5.5-7 5.5z" /></>,
};

export default function Icono({ nombre, tam = 18, titulo, className, trazo = 1.7 }) {
  const contenido = P[nombre];
  if (!contenido) return null;
  return (
    <svg
      className={className}
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={trazo}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? "img" : undefined}
      focusable="false"
    >
      {titulo ? <title>{titulo}</title> : null}
      {contenido}
    </svg>
  );
}
