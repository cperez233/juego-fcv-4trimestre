/**
 * Fondo del escritorio: una flor de pétalos azules sobre degradado claro, en la línea del fondo por defecto
 * de Windows 11 (dibujo propio, sin imágenes externas). Decorativo.
 */
const PETALOS = [
  { rot: -62, esc: 1, op: 0.95, g: "p1" },
  { rot: -28, esc: 1.08, op: 0.92, g: "p2" },
  { rot: 6, esc: 1.12, op: 0.95, g: "p1" },
  { rot: 40, esc: 1.04, op: 0.9, g: "p3" },
  { rot: 74, esc: 0.94, op: 0.88, g: "p2" },
  { rot: 108, esc: 0.86, op: 0.8, g: "p3" },
  { rot: -96, esc: 0.88, op: 0.82, g: "p3" },
];

export default function FondoEscritorio() {
  return (
    <svg className="fondo-escritorio" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="fe-cielo" cx="58%" cy="62%" r="75%">
          <stop offset="0" stopColor="#dcebfb" />
          <stop offset="0.45" stopColor="#9fc4ec" />
          <stop offset="1" stopColor="#3f78c0" />
        </radialGradient>
        <linearGradient id="p1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b3d91" />
          <stop offset="0.55" stopColor="#1f6fd6" />
          <stop offset="1" stopColor="#8ec5ff" />
        </linearGradient>
        <linearGradient id="p2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#123f86" />
          <stop offset="0.6" stopColor="#3d8ae6" />
          <stop offset="1" stopColor="#c3e0ff" />
        </linearGradient>
        <linearGradient id="p3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a2f6e" />
          <stop offset="0.5" stopColor="#2a64c4" />
          <stop offset="1" stopColor="#6fb1f7" />
        </linearGradient>
        <radialGradient id="fe-brillo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="fe-suave" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="fe-sombra" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>
      <rect width="1600" height="900" fill="url(#fe-cielo)" />
      <ellipse cx="930" cy="560" rx="420" ry="250" fill="#0b2d66" opacity="0.28" filter="url(#fe-sombra)" />
      <g transform="translate(900 540)" filter="url(#fe-suave)">
        {PETALOS.map((p, i) => (
          <path
            key={i}
            transform={`rotate(${p.rot}) scale(${p.esc})`}
            d="M0 0 C 90 -120 300 -150 420 -40 C 330 10 180 40 0 0 Z"
            fill={`url(#${p.g})`}
            opacity={p.op}
          />
        ))}
        <circle r="70" fill="url(#fe-brillo)" />
      </g>
    </svg>
  );
}
