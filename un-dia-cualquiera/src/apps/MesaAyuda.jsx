import { useState } from "react";
import { useJuego } from "../estado/juego.jsx";
import { mesaAyuda as M } from "../data/eventos.js";
import "./documentos.css";

/**
 * Portal de casos (guion 9.4): categoría + asunto de una lista. La descripción es opcional
 * y no se guarda ni se envía (solo se cuentan los caracteres para mostrar puntos).
 */
export default function MesaAyuda() {
  const { state, dispatch } = useJuego();
  const [cat, setCat] = useState("");
  const [asunto, setAsunto] = useState("");
  const [largo, setLargo] = useState(0);
  const [error, setError] = useState(false);
  const [creado, setCreado] = useState(null);

  const categoria = M.categorias.find((c) => c.id === cat);
  const reiniciar = () => {
    setCat("");
    setAsunto("");
    setLargo(0);
    setCreado(null);
  };

  return (
    <div className="mesa">
      <header className="mesa-cab">
        <strong>{M.titulo}</strong>
        <span>{M.subtitulo}</span>
      </header>
      <div className="mesa-cuerpo">
        <section className="mesa-form">
          <h2>{M.nuevo}</h2>
          {creado ? (
            <div className="mesa-ok" role="status">
              <p>✓ {M.creado(creado)}</p>
              <button type="button" className="mesa-btn mesa-btn--linea" onClick={reiniciar}>
                {M.nuevo}
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const a = categoria?.asuntos.find((x) => x.id === asunto);
                if (!categoria || !a) {
                  setError(true);
                  return;
                }
                setCreado(M.numero + state.casos.length);
                dispatch({ type: "crearCaso", categoria: categoria.id, asunto: a.id, texto: a.texto });
              }}
            >
              <label htmlFor="mesa-cat">{M.categoria}</label>
              <select
                id="mesa-cat"
                value={cat}
                onChange={(e) => {
                  setCat(e.target.value);
                  setAsunto("");
                  setError(false);
                }}
                aria-invalid={(error && !categoria) || undefined}
              >
                <option value="">{M.elegir}</option>
                {M.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.texto}
                  </option>
                ))}
              </select>
              <label htmlFor="mesa-asunto">{M.asunto}</label>
              <select
                id="mesa-asunto"
                value={asunto}
                disabled={!categoria}
                onChange={(e) => {
                  setAsunto(e.target.value);
                  setError(false);
                }}
                aria-invalid={(error && !asunto) || undefined}
              >
                <option value="">{M.elegir}</option>
                {categoria?.asuntos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.texto}
                  </option>
                ))}
              </select>
              {error ? (
                <p className="mesa-error" role="alert">
                  ⚠ {M.faltaCategoria}
                </p>
              ) : null}
              <label htmlFor="mesa-desc">{M.descripcion}</label>
              {/* El texto no se conserva: solo se cuenta su largo para mostrar puntos. */}
              <textarea id="mesa-desc" autoComplete="off" rows={4} value={"•".repeat(largo)} onChange={(e) => setLargo(e.target.value.length)} aria-describedby="mesa-ayuda" />
              <p id="mesa-ayuda" className="mesa-nota">
                {M.ayuda}
              </p>
              <button type="submit" className="mesa-btn">
                {M.enviar}
              </button>
            </form>
          )}
        </section>
        <section className="mesa-casos">
          <h2>{M.misCasos}</h2>
          <ul>
            {[...state.casos].reverse().map((c) => (
              <li key={c.numero}>
                <strong>#{c.numero}</strong> · {c.texto} · <span className="mesa-estado">{c.estado}</span>
              </li>
            ))}
            <li>
              <strong>#{M.casoCerrado.numero}</strong> · {M.casoCerrado.texto} · <span className="mesa-estado is-cerrado">{M.casoCerrado.estado}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
