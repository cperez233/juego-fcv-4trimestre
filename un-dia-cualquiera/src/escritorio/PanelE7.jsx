import { useMemo } from "react";
import { useJuego } from "../estado/juego.jsx";
import { e7 as E } from "../data/eventos.js";
import Icono from "../ui/Icono.jsx";

function mezclar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * E7 · 7A — El momento de la verdad. Deja libre la barra de tareas: desconectar la red
 * (ícono de red) es parte de la reacción y no aparece en la alerta.
 */
export default function PanelE7() {
  const { state, dispatch } = useJuego();
  const e7 = state.e7;
  const acciones = useMemo(() => mezclar(E.acciones), []);
  if (!e7 || e7.version !== "A" || state.modal !== "e7") return null;

  const c = E.consecuencias[e7.etiqueta];
  const ms = Math.max(0, (e7.fin ?? state.msReal) - e7.inicio);
  const seg = Math.min(E.duracionSeg, Math.floor(ms / 1000));
  const contenido = ["reportar", "mesa_ayuda"].includes(e7.resultado);
  // Las áreas se van afectando cada ~7 s. Si reporta, la cadena se corta; si no, llega a todas.
  const enCurso = Math.min(E.areas.length, Math.floor(ms / 7500) + 1);
  const afectadas = e7.resultado && !contenido ? E.areas.length : enCurso;

  return (
    <section className="e7" role="alertdialog" aria-labelledby="e7-titulo" aria-describedby="e7-texto">
      <div className="e7__caja">
        <header className="e7__cab">
          <Icono nombre="advertencia" tam={26} />
          <div>
            <h2 id="e7-titulo">{c.titulo}</h2>
            <p id="e7-texto">{c.texto}</p>
            {c.extra ? <p className="e7__extra">⚠ {c.extra}</p> : null}
          </div>
        </header>

        <div className="e7__grilla">
          <div className="e7__contador" aria-live="off">
            <span className="e7__etq">{E.contador}</span>
            <span className="e7__seg">00:{String(seg).padStart(2, "0")}</span>
            <span className="e7__barra" aria-hidden="true">
              <span style={{ width: `${(seg / E.duracionSeg) * 100}%` }} />
            </span>
          </div>
          <div className="e7__mapa">
            <span className="e7__etq">{E.mapaTitulo}</span>
            <ul>
              {E.areas.map((a, i) => {
                const mal = i < afectadas;
                return (
                  <li key={a} className={mal ? "is-afectada" : ""}>
                    <span aria-hidden="true">{mal ? "⚠" : "●"}</span> {a}
                    {mal ? <span className="e7__estado"> · {E.afectada}</span> : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {e7.resultado ? (
          <p className={`e7__resultado${contenido ? " is-ok" : ""}`} role="status">
            {E.resultado[e7.resultado]}
          </p>
        ) : (
          <div className="e7__acciones">
            <p className="e7__pregunta">{E.pregunta}</p>
            <div className="e7__botones">
              {acciones.map((a) => (
                <button key={a.texto} type="button" className="e7__btn" onClick={() => dispatch({ type: "e7Accion", accion: a.id, canal: a.canal })}>
                  {a.texto}
                </button>
              ))}
            </div>
            {!state.red ? <p className="e7__red">✓ {E.desconectada}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
