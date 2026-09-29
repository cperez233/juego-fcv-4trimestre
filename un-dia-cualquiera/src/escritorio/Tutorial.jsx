import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { textos } from "../data/textos.js";

const T = textos.tutorial;

/** Tutorial de 4 globos sobre el escritorio (sin pistas de revisar remitentes ni enlaces). */
export default function Tutorial({ onFin }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const boton = useRef(null);
  const paso = T.pasos[i];

  useLayoutEffect(() => {
    const medir = () => {
      const el = [...document.querySelectorAll(`[data-ancla="${paso.ancla}"]`)].find((x) => x.offsetParent !== null);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [paso.ancla]);

  useEffect(() => {
    boton.current?.focus();
  }, [i]);

  const ultimo = i === T.pasos.length - 1;
  const siguiente = () => (ultimo ? onFin() : setI(i + 1));

  // Globo debajo del ancla si hay espacio; si no, encima.
  const debajo = rect && rect.bottom < window.innerHeight * 0.55;
  const estiloGlobo = rect
    ? {
        top: debajo ? rect.bottom + 14 : undefined,
        bottom: debajo ? undefined : window.innerHeight - rect.top + 14,
        left: Math.max(12, Math.min(window.innerWidth - 332, rect.left + rect.width / 2 - 160)),
      }
    : { top: "40%", left: "50%", transform: "translateX(-50%)" };

  return (
    <div className="tutorial" role="dialog" aria-modal="true" aria-labelledby="tut-titulo" aria-describedby="tut-texto">
      {rect ? (
        <div
          className="tutorial__foco"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
          aria-hidden="true"
        />
      ) : (
        <div className="tutorial__velo" aria-hidden="true" />
      )}
      <div className={`tutorial__globo${debajo ? " is-debajo" : " is-encima"}`} style={estiloGlobo}>
        <p className="tutorial__paso">{T.paso(i + 1, T.pasos.length)}</p>
        <h2 id="tut-titulo">{paso.titulo}</h2>
        <p id="tut-texto">{paso.texto}</p>
        <button ref={boton} type="button" className="tutorial__btn" onClick={siguiente}>
          {ultimo ? T.empezar : T.siguiente}
        </button>
      </div>
    </div>
  );
}
