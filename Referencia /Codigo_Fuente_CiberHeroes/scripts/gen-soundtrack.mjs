/**
 * Loop heroico / movido royalty-free → public/audio/soundtrack.wav
 * Más rápido, brillante y fuerte (estilo fanfarria de héroes).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "audio", "soundtrack.wav");

const SR = 44100;
const BPM = 168; // más movido
const BEAT = 60 / BPM;
const BARS = 16;
const BEATS_PER_BAR = 4;
const DURATION = BARS * BEATS_PER_BAR * BEAT;
const N = Math.floor(SR * DURATION);

const L = new Float32Array(N);
const R = new Float32Array(N);

const note = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Tonalidad mayor heroica (C / G) — brillante
const ROOT = 48; // C3
// Bajo enérgico (octavas + quinta)
const bassNotes = [0, 0, 7, 0, 5, 5, 7, 5, 0, 0, 7, 12, 5, 7, 5, 0];
// Fanfarria de héroes (cuartas / quintas / saltos)
const leadPhrase = [
  12, 16, 19, 24, 19, 16, 19, 16,
  14, 17, 21, 26, 21, 17, 21, 17,
  12, 16, 19, 24, 26, 24, 19, 16,
  17, 19, 21, 24, 26, 28, 24, 19,
];
const padChord = [
  [0, 4, 7, 12],
  [7, 11, 14, 19],
  [5, 9, 12, 17],
  [0, 7, 12, 16],
];

function clamp(x) {
  return Math.max(-1, Math.min(1, x));
}

function envADSR(t, a, d, s, r, hold) {
  if (t < 0) return 0;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < a + d + hold) return s;
  const rt = t - (a + d + hold);
  if (rt < r) return s * (1 - rt / r);
  return 0;
}

function writeStereo(i, l, r) {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
}

const noise = new Float32Array(SR);
for (let i = 0; i < SR; i++) noise[i] = Math.random() * 2 - 1;

// Kick fuerte (cuatro en el piso + syncopas)
for (let beat = 0; beat < BARS * BEATS_PER_BAR; beat++) {
  const t0 = beat * BEAT;
  // kick en cada beat + ghost en offbeat de a ratos
  const hits = [0];
  if (beat % 4 === 2) hits.push(0.5 * BEAT);
  for (const off of hits) {
    const len = 0.16;
    for (let i = 0; i < len * SR; i++) {
      const t = i / SR;
      const f = 170 * Math.exp(-t * 32) + 45;
      const amp = Math.exp(-t * 16) * 0.72;
      const s = Math.sin(2 * Math.PI * f * t) * amp;
      writeStereo(Math.floor((t0 + off + t) * SR), s, s);
    }
  }
}

// Snare más presente
for (let beat = 0; beat < BARS * BEATS_PER_BAR; beat++) {
  if (beat % 4 !== 1 && beat % 4 !== 3) continue;
  const t0 = beat * BEAT;
  const len = 0.13;
  for (let i = 0; i < len * SR; i++) {
    const t = i / SR;
    const amp = Math.exp(-t * 20) * 0.38;
    const n = noise[i % SR] * amp;
    const tone = Math.sin(2 * Math.PI * 220 * t) * amp * 0.4;
    writeStereo(Math.floor((t0 + t) * SR), n + tone, n + tone);
  }
}

// Hats rápidos (16avos) — sensación movida
for (let sixteenth = 0; sixteenth < BARS * BEATS_PER_BAR * 4; sixteenth++) {
  const t0 = sixteenth * (BEAT / 4);
  const accent = sixteenth % 2 === 0;
  const len = accent ? 0.035 : 0.022;
  const vol = accent ? 0.09 : 0.05;
  for (let i = 0; i < len * SR; i++) {
    const t = i / SR;
    const amp = Math.exp(-t * 70) * vol;
    const n = noise[(i * 5) % SR] * amp;
    writeStereo(Math.floor((t0 + t) * SR), n * 0.8, n);
  }
}

// Bass potente
for (let step = 0; step < BARS * 4; step++) {
  const deg = bassNotes[step % bassNotes.length];
  const f = note(ROOT + deg);
  const t0 = step * BEAT;
  const hold = BEAT * 0.82;
  for (let i = 0; i < (hold + 0.08) * SR; i++) {
    const t = i / SR;
    const e = envADSR(t, 0.008, 0.05, 0.75, 0.08, hold);
    const phase = 2 * Math.PI * f * t;
    let s = 0;
    for (let h = 1; h <= 8; h++) s += Math.sin(phase * h) / h;
    s *= e * 0.3;
    writeStereo(Math.floor((t0 + t) * SR), s, s * 0.95);
  }
}

// Pad brillante
for (let bar = 0; bar < BARS; bar++) {
  const chord = padChord[bar % padChord.length];
  const t0 = bar * BEAT * 4;
  const hold = BEAT * 3.5;
  for (const deg of chord) {
    const f = note(ROOT + 12 + deg);
    for (let i = 0; i < (hold + 0.35) * SR; i++) {
      const t = i / SR;
      const e = envADSR(t, 0.12, 0.2, 0.5, 0.3, hold);
      const det = 1.004;
      const s =
        (Math.sin(2 * Math.PI * f * t) +
          Math.sin(2 * Math.PI * f * det * t) * 0.65 +
          Math.sin(2 * Math.PI * f * 2 * t) * 0.2) *
        e *
        0.09;
      const pan = deg % 7 === 0 ? -0.25 : 0.2;
      writeStereo(Math.floor((t0 + t) * SR), s * (1 - pan), s * (1 + pan));
    }
  }
}

// Melodía / fanfarria (más fuerte y aguda)
for (let step = 0; step < BARS * 4; step++) {
  if (step % 16 === 15) continue;
  const deg = leadPhrase[step % leadPhrase.length];
  const f = note(ROOT + 12 + deg);
  const t0 = step * BEAT;
  const hold = BEAT * 0.78;
  for (let i = 0; i < (hold + 0.12) * SR; i++) {
    const t = i / SR;
    const e = envADSR(t, 0.01, 0.05, 0.6, 0.1, hold);
    const phase = 2 * Math.PI * f * t;
    // brass: odd harmonics
    let s =
      Math.sin(phase) * 0.55 +
      Math.sin(phase * 2) * 0.28 +
      Math.sin(phase * 3) * 0.18 +
      Math.sin(phase * 5) * 0.08;
    s *= e * 0.26;
    const idx = Math.floor((t0 + t) * SR);
    writeStereo(idx, s * 1.1, s * 0.95);
    writeStereo(idx + Math.floor(0.06 * SR), s * 0.3, s * 0.4);
  }
}

// Contra-melodía rápida (octavos) — más “movido”
for (let eighth = 0; eighth < BARS * 8; eighth++) {
  if (eighth % 8 === 3 || eighth % 8 === 7) continue;
  const pattern = [19, 24, 19, 16, 21, 26, 21, 17];
  const deg = pattern[eighth % pattern.length];
  const f = note(ROOT + 12 + deg);
  const t0 = eighth * (BEAT / 2);
  const hold = BEAT * 0.35;
  for (let i = 0; i < (hold + 0.05) * SR; i++) {
    const t = i / SR;
    const e = envADSR(t, 0.005, 0.03, 0.4, 0.05, hold);
    const s = Math.sin(2 * Math.PI * f * t) * e * 0.1;
    writeStereo(Math.floor((t0 + t) * SR), s * 0.7, s);
  }
}

// Impactos heroicos cada 4 compases
for (let bar = 0; bar < BARS; bar += 4) {
  const t0 = bar * BEAT * 4;
  for (let i = 0; i < 0.35 * SR; i++) {
    const t = i / SR;
    const f = 90 + t * 280;
    const amp = Math.exp(-t * 8) * 0.35;
    const s = Math.sin(2 * Math.PI * f * t) * amp;
    writeStereo(Math.floor((t0 + t) * SR), s, s);
  }
}

// Soft clip + normalización alta + fade corto de loop
const fade = Math.floor(0.03 * SR);
let peak = 0;
for (let i = 0; i < N; i++) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = peak > 0 ? 0.98 / peak : 1;
for (let i = 0; i < N; i++) {
  let g = 1;
  if (i < fade) g = i / fade;
  if (i > N - fade) g = (N - i) / fade;
  // soft clip para más “punch”
  let l = Math.tanh(L[i] * norm * 1.15) * g;
  let r = Math.tanh(R[i] * norm * 1.15) * g;
  L[i] = clamp(l);
  R[i] = clamp(r);
}

const dataSize = N * 2 * 2;
const buf = Buffer.alloc(44 + dataSize);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + dataSize, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 2 * 2, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(dataSize, 40);

let o = 44;
for (let i = 0; i < N; i++) {
  const sl = Math.max(-32767, Math.min(32767, Math.floor(L[i] * 32767)));
  const sr = Math.max(-32767, Math.min(32767, Math.floor(R[i] * 32767)));
  buf.writeInt16LE(sl, o);
  buf.writeInt16LE(sr, o + 2);
  o += 4;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buf);
console.log(`OK ${OUT} (${(buf.length / 1024 / 1024).toFixed(2)} MB, ${DURATION.toFixed(1)}s @ ${BPM} BPM)`);
