import Icono from "../ui/Icono.jsx";
import AppIcono from "./AppIcono.jsx";
import { textos } from "../data/textos.js";

const T = textos.escritorio;

/** Ventana de aplicación dentro del escritorio (sin arrastrar ni redimensionar). */
export default function Ventana({ id, icono, onMinimizar, onCerrar, children }) {
  const titulo = T.tituloVentana[id];
  return (
    <section className="ventana" aria-label={titulo}>
      <header className="ventana__barra">
        <AppIcono id={id} icono={icono} tam={18} />
        <h1 className="ventana__titulo">{titulo}</h1>
        <div className="ventana__controles">
          <button type="button" className="ventana__control" onClick={onMinimizar} aria-label={`${T.minimizar} ${titulo}`}>
            <Icono nombre="minimizar" tam={16} />
          </button>
          <span className="ventana__control ventana__control--max" aria-hidden="true">
            <span className="ventana__cuadro" />
          </span>
          <button type="button" className="ventana__control ventana__control--cerrar" onClick={onCerrar} aria-label={`${T.cerrar} ${titulo}`}>
            <Icono nombre="cerrar" tam={16} />
          </button>
        </div>
      </header>
      <div className="ventana__contenido">{children}</div>
    </section>
  );
}
