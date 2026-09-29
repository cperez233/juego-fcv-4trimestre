/** Silueta azul de contacto, como el avatar por defecto del webmail. */
export default function Avatar({ tam = 44 }) {
  return (
    <svg className="zc-avatar" width={tam} height={tam} viewBox="0 0 44 44" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="zc-av" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb0e3" />
          <stop offset="1" stopColor="#3b6fb0" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="13" r="9" fill="url(#zc-av)" />
      <path d="M5 43c1-11 7.5-17 17-17s16 6 17 17z" fill="url(#zc-av)" />
      <path d="M17 26.5 22 33l5-6.5" fill="none" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

