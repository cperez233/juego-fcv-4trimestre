import { useEffect, useRef, useState } from "react";
import { useJuego } from "../estado/juego.jsx";
import { proteccion as P } from "../data/eventos.js";
import Icono from "../ui/Icono.jsx";

/** Protección del equipo (genérica, sin marca): 5B y las descargas de E9, E13 y EX. Congela el reloj. */
export default function ModalProteccion() {
  const { state, dispatch } = useJuego();
  const ref = useRef(null);
  const [info, setInfo] = useState(false);
  const abierto = state.modal === "5B";

  useEffect(() => {
    const d = ref.current;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
    if (!abierto) setInfo(false);
  }, [abierto]);

  const decidir = (accion) => dispatch({ type: "proteccion", accion });

  return (
    <dialog
      ref={ref}
      className="proteccion"
      aria-labelledby="prot-titulo"
      onCancel={(e) => {
        // Esc equivale a cerrar con la ✕.
        e.preventDefault();
        decidir("cerrar_x");
      }}
    >
      {abierto ? (
        <div className="proteccion__caja">
          <header className="proteccion__cab">
            <span className="proteccion__escudo" aria-hidden="true">
              🛡
            </span>
            <h2 id="prot-titulo">{P.titulo}</h2>
            <button type="button" className="proteccion__x" onClick={() => decidir("cerrar_x")} aria-label={P.botones.cerrar}>
              <Icono nombre="cerrar" tam={16} />
            </button>
          </header>
          <div className="proteccion__cuerpo">
            <p className="proteccion__sub">
              <Icono nombre="advertencia" tam={20} /> {P.subtitulo}
            </p>
            <p>{P.texto}</p>
            <p className="proteccion__archivo">{state.descarga?.archivo}</p>
            {info ? <p className="proteccion__info">{P.masInfoTexto(state.descarga?.origen)}</p> : null}
          </div>
          <footer className="proteccion__pie">
            <button type="button" className="proteccion__btn proteccion__btn--primario" onClick={() => decidir("cuarentena")}>
              {P.botones.cuarentena}
            </button>
            <button
              type="button"
              className="proteccion__btn"
              onClick={() => {
                setInfo(true);
                decidir("mas_info");
              }}
              disabled={info}
            >
              {P.botones.masInfo}
            </button>
            <button type="button" className="proteccion__btn proteccion__btn--texto" onClick={() => decidir("permitir")}>
              {P.botones.permitir}
            </button>
          </footer>
        </div>
      ) : null}
    </dialog>
  );
}
