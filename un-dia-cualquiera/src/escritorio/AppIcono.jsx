import Icono from "../ui/Icono.jsx";

/** Ícono de aplicación: cuadro redondeado de color con el glifo en blanco (sin logos de marcas). */
export default function AppIcono({ id, icono, tam = 32 }) {
  return (
    <span className={`app-icono app-icono--${id}`} style={{ width: tam, height: tam }} aria-hidden="true">
      <Icono nombre={icono || id} tam={Math.round(tam * 0.58)} trazo={1.9} />
    </span>
  );
}
