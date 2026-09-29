import { useEffect, useRef } from "react";
import { documentos } from "../../data/relleno.js";
import { textos } from "../../data/textos.js";
import Icono from "../../ui/Icono.jsx";

/** Vista previa de solo lectura de un adjunto (hoja de cálculo o texto). */
export default function VisorDocumento({ doc, onCerrar }) {
  const ref = useRef(null);
  const d = doc ? documentos[doc] : null;

  useEffect(() => {
    const el = ref.current;
    if (d && !el.open) el.showModal();
    if (!d && el.open) el.close();
  }, [d]);

  return (
    <dialog ref={ref} className="visor" aria-label={d?.titulo} onClose={onCerrar}>
      {d ? (
        <>
          <header className="visor__cab">
            <Icono nombre={d.tipo === "hoja" ? "hoja" : "adjunto"} tam={18} />
            <h2>{d.titulo}</h2>
            <span className="visor__nota">{textos.visor.soloLectura}</span>
            <button type="button" className="visor__cerrar" onClick={onCerrar} aria-label={textos.visor.cerrar}>
              <Icono nombre="cerrar" tam={18} />
            </button>
          </header>
          <div className="visor__cuerpo">
            {d.tipo === "hoja" ? (
              <div className="visor__tabla-wrap">
                <table className="visor__tabla">
                  <thead>
                    <tr>
                      {d.columnas.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.filas.map((f, i) => (
                      <tr key={i}>
                        {f.map((v, j) => (
                          <td key={j}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="visor__pagina">
                {d.parrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
