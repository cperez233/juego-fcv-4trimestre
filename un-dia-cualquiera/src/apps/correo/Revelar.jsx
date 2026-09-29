import { useEffect, useRef, useState } from "react";
import { textos } from "../../data/textos.js";
import Avatar from "./Avatar.jsx";

const T = textos.correo;

// Tiempo que el cursor (o el foco) debe quedarse encima para mostrar la información.
// Evita contar como "inspección" un paso accidental del mouse o del tabulador.
const RETARDO_MS = 450;

/**
 * Muestra una capa al pasar el cursor, al dejar el foco o al hacer clic, y avisa (onMostrar)
 * cada vez que se hace visible. De aquí sale la métrica de inspección.
 */
export function useRevelar(onMostrar) {
  const [visible, setVisible] = useState(false);
  const tIn = useRef(null);
  const tOut = useRef(null);
  const visibleRef = useRef(false);
  visibleRef.current = visible;

  useEffect(
    () => () => {
      clearTimeout(tIn.current);
      clearTimeout(tOut.current);
    },
    []
  );

  const abrir = () => {
    if (!visibleRef.current) onMostrar();
    setVisible(true);
  };

  return {
    visible,
    mostrarPronto() {
      clearTimeout(tOut.current);
      clearTimeout(tIn.current);
      if (!visibleRef.current) tIn.current = setTimeout(abrir, RETARDO_MS);
    },
    ocultarPronto() {
      clearTimeout(tIn.current);
      tOut.current = setTimeout(() => setVisible(false), 160);
    },
    alternar() {
      clearTimeout(tIn.current);
      if (visibleRef.current) setVisible(false);
      else abrir();
    },
    cerrar() {
      clearTimeout(tIn.current);
      setVisible(false);
    },
  };
}

export function dominioDe(correo) {
  return correo.split("@")[1] || "";
}

/** Contenido de los detalles del remitente (tarjeta en escritorio, hoja inferior en móvil). */
export function DetallesRemitente({ de }) {
  return (
    <div className="zc-tarjeta__cuerpo">
      <Avatar tam={52} />
      <dl className="zc-tarjeta__datos">
        <dt>{T.tarjeta.nombre}</dt>
        <dd className="zc-tarjeta__nombre">{de.nombre}</dd>
        <dt>{T.tarjeta.correo}</dt>
        <dd>{de.correo}</dd>
        <dt>{T.tarjeta.dominio}</dt>
        <dd>{dominioDe(de.correo)}</dd>
      </dl>
    </div>
  );
}

/**
 * Píldora "De:" con tarjeta de detalles.
 * Escritorio: pasar el cursor, dejar el foco o hacer clic. Móvil: un toque abre la hoja inferior.
 */
export function PildoraRemitente({ de, movil, onInspeccion, onAbrirHoja }) {
  const r = useRevelar(onInspeccion);
  const id = `tarjeta-${de.correo.replace(/[^a-z0-9]/gi, "")}`;
  const texto = `"${de.nombre}" <${de.correo}>`;

  if (movil) {
    return (
      <button type="button" className="zc-pildora" aria-haspopup="dialog" onClick={onAbrirHoja}>
        {texto}
      </button>
    );
  }

  return (
    <span className="zc-revelar" onMouseEnter={r.mostrarPronto} onMouseLeave={r.ocultarPronto}>
      <button
        type="button"
        className="zc-pildora"
        aria-expanded={r.visible}
        aria-controls={id}
        onClick={r.alternar}
        onFocus={r.mostrarPronto}
        onBlur={r.ocultarPronto}
        onKeyDown={(e) => e.key === "Escape" && r.cerrar()}
      >
        {texto}
      </button>
      <div id={id} role="group" aria-label={T.tarjeta.titulo} className="zc-tarjeta" hidden={!r.visible}>
        <DetallesRemitente de={de} />
      </div>
    </span>
  );
}

/**
 * Enlace dentro del cuerpo del correo. Nunca es un <a href>: es un botón interno.
 * Escritorio: tooltip con la URL real. Móvil: un toque abre la hoja con la URL y la opción de abrir.
 */
export function EnlaceCorreo({ enlace, texto, estilo = "boton", movil, onInspeccion, onClic, onAbrirHoja }) {
  const r = useRevelar(onInspeccion);
  const id = `url-${enlace.id}`;
  const clase = estilo === "boton" ? "zc-cta" : "zc-link";

  if (movil) {
    return (
      <button type="button" className={clase} aria-haspopup="dialog" onClick={onAbrirHoja}>
        {texto}
      </button>
    );
  }

  return (
    <span className="zc-revelar zc-revelar--enlace" onMouseEnter={r.mostrarPronto} onMouseLeave={r.ocultarPronto}>
      <button
        type="button"
        className={clase}
        aria-describedby={r.visible ? id : undefined}
        onClick={onClic}
        onFocus={r.mostrarPronto}
        onBlur={r.ocultarPronto}
        onKeyDown={(e) => e.key === "Escape" && r.cerrar()}
      >
        {texto}
      </button>
      <span id={id} role="tooltip" className="zc-url" hidden={!r.visible}>
        {enlace.url}
      </span>
    </span>
  );
}
