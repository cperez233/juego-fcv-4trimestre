import { useState } from "react";
import { useJuego } from "../estado/juego.jsx";

/**
 * Solo en desarrollo (npm run dev): muestra lo que el juego está registrando,
 * para verificar la métrica de inspección. No existe en la versión publicada.
 */
export default function RegistroDev() {
  const { state } = useJuego();
  const [abierto, setAbierto] = useState(false);
  // Para las pruebas automáticas en desarrollo.
  window.__udc = state;
  const r = state.registro;
  return (
    <div className={`dev-registro${abierto ? " is-abierto" : ""}`}>
      <button type="button" className="dev-registro__boton" onClick={() => setAbierto((x) => !x)} aria-expanded={abierto}>
        Registro (dev) · {r.acciones.length}
      </button>
      {abierto ? (
        <div className="dev-registro__panel">
          <h2>Inspecciones</h2>
          <pre>{JSON.stringify(r.inspecciones, null, 1)}</pre>
          <h2>Acciones</h2>
          <pre>{JSON.stringify(r.acciones, null, 1)}</pre>
          <h2>Pendientes</h2>
          <pre>{JSON.stringify(state.pendientes)}</pre>
        </div>
      ) : null}
    </div>
  );
}
