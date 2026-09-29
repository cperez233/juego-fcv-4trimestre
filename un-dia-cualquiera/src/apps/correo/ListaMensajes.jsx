import { useRef } from "react";
import { textos } from "../../data/textos.js";
import { fechaLista } from "../../util/tiempo.js";
import Icono from "../../ui/Icono.jsx";

const T = textos.correo;

export function vistaPrevia(correo) {
  const p = correo.cuerpo.find((b) => b.tipo === "p" || b.tipo === "pre");
  return p ? p.texto.replace(/\*\*/g, "").replace(/\s+/g, " ") : "";
}

/** Lista central: "Ordenado por Fecha", N conversaciones y filas de dos líneas. */
export default function ListaMensajes({ correos, seleccion, onSeleccionar, carpeta }) {
  const ref = useRef(null);
  const enviados = carpeta === "enviados" || carpeta === "borradores";

  const mover = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const botones = [...ref.current.querySelectorAll(".zc-fila")];
    const i = botones.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const sig = botones[Math.min(botones.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))];
    sig.focus();
    onSeleccionar(sig.dataset.id);
  };

  return (
    <section className="zc-lista" aria-label={T.carpetas[carpeta]}>
      <div className="zc-lista__cab">
        <span>
          {T.ordenado} <span aria-hidden="true">▿</span>
        </span>
        <span>{T.conversaciones(correos.length)}</span>
      </div>
      {correos.length === 0 ? (
        <p className="zc-lista__vacia">{T.carpetaVacia}</p>
      ) : (
        <ul className="zc-lista__filas" ref={ref} onKeyDown={mover}>
          {correos.map((c) => {
            const quien = enviados ? (Array.isArray(c.para) ? c.para.join(", ") : c.para) : c.de.nombre;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  data-id={c.id}
                  className={`zc-fila${seleccion === c.id ? " is-sel" : ""}${c.leido ? "" : " is-noleido"}`}
                  aria-current={seleccion === c.id ? "true" : undefined}
                  onClick={() => onSeleccionar(c.id)}
                >
                  <span className="zc-fila__l1">
                    <span className="zc-punto" aria-hidden="true" />
                    <span className="zc-fila__de">{quien}</span>
                    <span className="zc-fila__fecha">{fechaLista(c.fecha)}</span>
                  </span>
                  <span className="zc-fila__l2">
                    <span className="zc-fila__texto">
                      <span className="zc-fila__asunto">{c.asunto}</span>
                      <span className="zc-fila__prev"> - {vistaPrevia(c)}</span>
                    </span>
                    {c.adjuntos.length ? <Icono nombre="clip" tam={15} className="zc-fila__icono" /> : <span className="zc-fila__hueco" />}
                    <Icono nombre="bandera" tam={15} className="zc-fila__icono zc-fila__icono--bandera" />
                  </span>
                  {c.leido ? null : <span className="sr-only">(no leído)</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
