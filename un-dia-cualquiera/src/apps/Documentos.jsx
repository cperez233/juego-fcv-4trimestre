import { useEffect, useRef, useState } from "react";
import { useJuego } from "../estado/juego.jsx";
import { documentosApp as D } from "../data/eventos.js";
import Icono from "../ui/Icono.jsx";
import "./documentos.css";

/** Documentos: el informe abierto y Archivo → Guardar como PDF (la vía segura de E5, que no se anuncia). */
export default function Documentos() {
  const { state, dispatch } = useJuego();
  const [menu, setMenu] = useState(null);
  const [dialogo, setDialogo] = useState(false);
  const menuRef = useRef(null);
  const dlg = useRef(null);

  useEffect(() => {
    const d = dlg.current;
    if (dialogo && !d.open) d.showModal();
    if (!dialogo && d.open) d.close();
  }, [dialogo]);

  useEffect(() => {
    if (!menu) return undefined;
    const cerrar = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenu(null);
    };
    document.addEventListener("pointerdown", cerrar);
    return () => document.removeEventListener("pointerdown", cerrar);
  }, [menu]);

  const opcion = (o) => {
    setMenu(null);
    if (o === "Guardar como PDF") setDialogo(true);
    else if (o === "Guardar") dispatch({ type: "toast", texto: D.guardado, extra: { estado: true } });
    else if (o === "Imprimir") dispatch({ type: "toast", texto: D.impreso, extra: { estado: true } });
    else dispatch({ type: "toast", texto: D.otros, extra: { estado: true } });
  };

  const C = D.contenido;
  return (
    <div className="doc">
      <div className="doc-barra">
        <span className="doc-archivo">
          <span aria-hidden="true">📄</span> {D.archivo}
          {state.archivos.pdf ? <span className="doc-pdf"> · PDF guardado ✓</span> : null}
        </span>
      </div>
      <div className="doc-menus" ref={menuRef}>
        {D.menus.map((m) => (
          <div key={m} className="doc-menu">
            <button type="button" className={`doc-menu__btn${menu === m ? " is-abierto" : ""}`} aria-expanded={menu === m} aria-haspopup="true" onClick={() => setMenu(menu === m ? null : m)}>
              {m}
            </button>
            {menu === m ? (
              <ul className="doc-menu__lista">
                {(m === "Archivo" ? D.menuArchivo : ["—"]).map((o) => (
                  <li key={o}>
                    <button type="button" onClick={() => (o === "—" ? setMenu(null) : opcion(o))} autoFocus={o === (m === "Archivo" ? D.menuArchivo[0] : "—")}>
                      {o === "—" ? D.otros : o}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
      <div className="doc-hoja-wrap">
        <article className="doc-hoja">
          <h2>{C.titulo}</h2>
          <p className="doc-area">{C.area}</p>
          {C.secciones.map(([t, x]) => (
            <section key={t}>
              <h3>{t}</h3>
              <p>{x}</p>
            </section>
          ))}
        </article>
      </div>

      <dialog ref={dlg} className="doc-dialogo" aria-labelledby="doc-pdf-t" onClose={() => setDialogo(false)}>
        {dialogo ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDialogo(false);
              dispatch({ type: "guardarPdf", texto: D.guardarPdf.listo });
            }}
          >
            <h2 id="doc-pdf-t">
              <Icono nombre="adjunto" tam={18} /> {D.guardarPdf.titulo}
            </h2>
            <label>
              {D.guardarPdf.nombre}
              <input value={D.guardarPdf.archivo} readOnly />
            </label>
            <p>{D.guardarPdf.ubicacion}</p>
            <div className="doc-dialogo__botones">
              <button type="button" onClick={() => setDialogo(false)}>
                {D.guardarPdf.cancelar}
              </button>
              <button type="submit" className="is-primario">
                {D.guardarPdf.guardar}
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}
