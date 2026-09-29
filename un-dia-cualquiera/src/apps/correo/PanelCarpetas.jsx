import { config } from "../../data/config.js";
import { textos } from "../../data/textos.js";
import Icono from "../../ui/Icono.jsx";

const T = textos.correo;

export const CARPETAS = [
  { id: "entrada", icono: "bandeja", cuenta: "noLeidos" },
  { id: "enviados", icono: "enviados" },
  { id: "borradores", icono: "borradores", cuenta: "total" },
  { id: "spam", icono: "spam", cuenta: "noLeidos" },
  { id: "papelera", icono: "papelera" },
];

export function contarCarpeta(correos, carpeta) {
  const en = correos.filter((c) => c.carpeta === carpeta.id);
  if (carpeta.cuenta === "total") return en.length;
  if (carpeta.cuenta === "noLeidos") return en.filter((c) => !c.leido).length;
  return 0;
}

/** Lista de carpetas (compartida entre escritorio y la hoja de carpetas en móvil). */
export function ListaCarpetas({ correos, carpeta, onCarpeta }) {
  return (
    <ul className="zc-carpetas__lista">
      {CARPETAS.map((c) => {
        const n = contarCarpeta(correos, c);
        const nombre = T.carpetas[c.id];
        return (
          <li key={c.id}>
            <button
              type="button"
              className={`zc-carpeta${carpeta === c.id ? " is-activa" : ""}${n ? " is-negrita" : ""}`}
              aria-current={carpeta === c.id ? "true" : undefined}
              onClick={() => onCarpeta(c.id)}
            >
              <Icono nombre={c.icono} tam={16} className="zc-carpeta__icono" />
              <span>
                {nombre}
                {n ? ` (${n})` : ""}
              </span>
              {c.id === "entrada" && carpeta === c.id ? <Icono nombre="caretAbajo" tam={12} className="zc-carpeta__caret" /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Mini calendario decorativo del mes del juego, con el día de hoy marcado. */
function MiniCalendario() {
  const [y, m, d] = config.fechaJuego.split("-").map(Number);
  const primero = new Date(y, m - 1, 1).getDay();
  const diasMes = new Date(y, m, 0).getDate();
  const diasPrev = new Date(y, m - 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < 42; i++) {
    const n = i - primero + 1;
    if (n < 1) celdas.push({ n: diasPrev + n, fuera: true });
    else if (n > diasMes) celdas.push({ n: n - diasMes, fuera: true });
    else celdas.push({ n, hoy: n === d });
  }
  const mes = textos.fecha.meses[m - 1];
  return (
    <div className="zc-cal" aria-hidden="true">
      <div className="zc-cal__cab">
        <span>◂◂ ◂</span>
        <span className="zc-cal__mes">
          {mes.charAt(0).toUpperCase() + mes.slice(1)} {y}
        </span>
        <span>▸ ▸▸</span>
      </div>
      <div className="zc-cal__grilla">
        {textos.fecha.diasCortos.map((dd, i) => (
          <span key={`c${i}`} className="zc-cal__dia">
            {dd}
          </span>
        ))}
        {celdas.map((c, i) => (
          <span key={i} className={`zc-cal__n${c.fuera ? " is-fuera" : ""}${c.hoy ? " is-hoy" : ""}`}>
            {c.n}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PanelCarpetas({ correos, carpeta, onCarpeta }) {
  return (
    <nav className="zc-carpetas" aria-label={T.carpetasTitulo}>
      <div className="zc-carpetas__arriba">
        <h2 className="zc-seccion">
          <Icono nombre="caretAbajo" tam={12} />
          <span>{T.carpetasTitulo}</span>
          <Icono nombre="engranaje" tam={14} className="zc-seccion__eng" />
        </h2>
        <ListaCarpetas correos={correos} carpeta={carpeta} onCarpeta={onCarpeta} />
        {T.secciones.map((s, i) => (
          <p key={s} className="zc-seccion zc-seccion--deco" aria-hidden="true">
            {i === 2 ? <Icono nombre="caretDer" tam={12} /> : <span className="zc-seccion__hueco" />}
            <span>{s}</span>
            {i < 2 ? <Icono nombre="engranaje" tam={14} className="zc-seccion__eng" /> : null}
          </p>
        ))}
      </div>
      <MiniCalendario />
    </nav>
  );
}
