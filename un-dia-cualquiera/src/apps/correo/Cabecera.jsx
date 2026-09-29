import { textos } from "../../data/textos.js";
import Icono from "../../ui/Icono.jsx";

const T = textos.correo;

/** Marca genérica "Correo FCV" (sin logos de terceros). */
export function Marca() {
  return (
    <span className="zc-marca">
      <Icono nombre="correo" tam={26} trazo={1.6} />
      <span className="zc-marca__sep" aria-hidden="true" />
      <span className="zc-marca__texto">{T.marca}</span>
    </span>
  );
}

/** Franja azul: marca, búsqueda, usuario con cuota y pestañas de aplicación. */
export default function Cabecera({ pestana, onPestana, busqueda, onBusqueda, usuario }) {
  return (
    <header className="zc-cabecera">
      <div className="zc-cabecera__fila">
        <Marca />
        <div className="zc-buscar" role="search">
          <span className="zc-buscar__tipo" aria-hidden="true">
            <Icono nombre="correo" tam={14} />
            <Icono nombre="caretAbajo" tam={10} />
          </span>
          <input
            type="search"
            className="zc-buscar__input"
            placeholder={T.buscar}
            aria-label={T.buscar}
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
            autoComplete="off"
          />
          <Icono nombre="buscar" tam={14} className="zc-buscar__lupa" />
        </div>
        <div className="zc-usuario">
          <span className="zc-usuario__nombre">
            {usuario} <Icono nombre="caretAbajo" tam={10} />
          </span>
          <span className="zc-cuota" role="img" aria-label={T.cuota}>
            <span className="zc-cuota__uso" />
          </span>
        </div>
      </div>
      <div className="zc-cabecera__fila zc-cabecera__fila--pestanas">
        <div className="zc-pestanas" role="tablist">
          {T.pestanas.map((p, i) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={pestana === i}
              className={`zc-pestana${pestana === i ? " is-activa" : ""}`}
              onClick={() => onPestana(i)}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="zc-refrescar" aria-hidden="true">
          <Icono nombre="refrescar" tam={18} trazo={2} />
        </span>
      </div>
    </header>
  );
}
