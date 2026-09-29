/** Renderiza **negrita** dentro de un texto de src/data. Nada más. */
export default function TextoRico({ texto }) {
  const partes = String(texto).split(/(\*\*[^*]+\*\*)/g);
  return partes.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}
