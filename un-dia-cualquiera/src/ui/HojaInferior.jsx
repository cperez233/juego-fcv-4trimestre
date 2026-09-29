import { useEffect, useRef } from "react";
import Icono from "./Icono.jsx";

/**
 * Hoja inferior modal (móvil) sobre <dialog>: foco atrapado y Esc nativos.
 * Se abre con un toque; nunca con "mantener presionado".
 */
export default function HojaInferior({ abierta, onCerrar, titulo, etiquetaCerrar, children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierta && !d.open) d.showModal();
    if (!abierta && d.open) d.close();
  }, [abierta]);

  return (
    <dialog
      ref={ref}
      className={`hoja ${className}`}
      aria-label={titulo}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar();
      }}
    >
      <div className="hoja__contenido">
        <div className="hoja__cabecera">
          <span className="hoja__asa" aria-hidden="true" />
          <h2 className="hoja__titulo">{titulo}</h2>
          <button type="button" className="hoja__cerrar" onClick={onCerrar} aria-label={etiquetaCerrar}>
            <Icono nombre="cerrar" tam={20} />
          </button>
        </div>
        {abierta ? children : null}
      </div>
    </dialog>
  );
}
