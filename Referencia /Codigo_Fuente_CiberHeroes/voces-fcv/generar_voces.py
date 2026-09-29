#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
═══════════════════════════════════════════════════════════════
  GENERADOR DE VOCES — Ciber Héroes Doomsday (FCV)
  Genera los 28 audios del juego usando la API de Deepgram.
═══════════════════════════════════════════════════════════════

USO
───
  1. pip install requests
  2. Pon DEEPGRAM_API_KEY en .env, en el entorno, o abajo
  3. python generar_voces.py --forzar

  Extras:
     python generar_voces.py --listar      → muestra voces disponibles
     python generar_voces.py --solo trueno → regenera solo un personaje
     python generar_voces.py --forzar      → rehace archivos ya existentes

CALIDAD
───────
  Deepgram MP3 nativo llega como máximo a 48 kbps (suena recortado).
  Pedimos WAV lineal 24 kHz y lo convertimos a MP3 192 kbps con ffmpeg.
  Al final se copia a ../public/voces/ para el juego.

PANTALLA vs AUDIO
─────────────────
  En pantalla se deja N1, N2, N3, N4.
  En el guion hablado se dice "nivel uno / dos / tres / cuatro"
  para que no suene como "Nero".
"""

import os
import shutil
import subprocess
import sys
import tempfile
import time
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Falta 'requests'. Instálalo con:  pip install requests")


# ═══════════════════════════════════════════════
#  CONFIGURACIÓN
# ═══════════════════════════════════════════════

ROOT = Path(__file__).resolve().parent
CARPETA_SALIDA = ROOT / "voces"
CARPETA_PUBLIC = ROOT.parent / "public" / "voces"
URL = "https://api.deepgram.com/v1/speak"

# WAV sin pérdida; ffmpeg lo pasa a MP3 192k (el MP3 de Deepgram es 48 kbps)
PARAMS_AUDIO = {
    "encoding": "linear16",
    "container": "wav",
    "sample_rate": "24000",
}

MP3_BITRATE = "192k"
PAD_SILENCIO = 0.28  # segundos al final para que no corte la última sílaba


def cargar_dotenv():
    env_path = ROOT / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


cargar_dotenv()
API_KEY = os.environ.get("DEEPGRAM_API_KEY", "PEGA_AQUI_TU_API_KEY")


# ═══════════════════════════════════════════════
#  VOCES POR PERSONAJE
#  Thor / Elástico: valerio y luciano (más claras que aquila / javier)
# ═══════════════════════════════════════════════

VOCES = {
    "max":       "aura-2-celeste-es",   # Young, energetic → base infantil
    "centinela": "aura-2-celeste-es",   # Colombian feminine
    "barrera":   "aura-2-estrella-es",  # Mexican feminine
    "elastico":  "aura-2-luciano-es",   # Mexican masculine, charismatic
    "antorcha":  "aura-2-gloria-es",    # Colombian feminine
    "trueno":    "aura-2-valerio-es",   # Mexican masculine, deep
    "doom":      "aura-2-nestor-es",    # Peninsular masculine
    "narrador":  "aura-2-alvaro-es",    # Peninsular masculine
    "euforia":   "aura-2-luciano-es",   # Charismatic, cheerful → briefing
}

# Velocidad Deepgram (si el idioma lo soporta). >1 = más rápido.
SPEED = {
    "max": 1.08,
    "euforia": 1.12,
}

# Post-proceso ffmpeg: tono más agudo = más juvenil / menos “adulto”
# (gratis al regenerar; también se aplicó offline a intros de héroes)
PITCH = {
    "max": 1.22,
    "barrera": 1.14,
    "centinela": 1.14,
    "elastico": 1.16,
    "antorcha": 1.14,
    "trueno": 1.15,
    "euforia": 1.08,
}


# ═══════════════════════════════════════════════
#  GUION — 28 frases
#  (archivo_sin_extension, personaje, texto hablado)
# ═══════════════════════════════════════════════

GUION = [
    # ── LA CENTINELA · Ronda 1 ──────────────────
    ("centinela_grito", "centinela", "¡Escudo arriba! Nada pasa de aquí."),
    ("centinela_ok",    "centinela", "¡El escudo repele el ataque!"),
    ("centinela_fail",  "centinela", "¡No! Rompió mi guardia."),

    # ── LA BARRERA · Ronda 2 ────────────────────
    ("barrera_grito",   "barrera",   "Mi campo protege lo más sensible."),
    ("barrera_ok",      "barrera",   "¡Campo de fuerza expandido!"),
    ("barrera_fail",    "barrera",   "¡No! Mi campo se quiebra."),

    # ── EL ELÁSTICO · Ronda 3 ───────────────────
    ("elastico_grito",  "elastico",  "Llego a cada rincón de la institución."),
    ("elastico_ok",     "elastico",  "¡Alcance total sobre Doom!"),
    ("elastico_fail",   "elastico",  "¡Ay, no! Me dejó todo enredado."),

    # ── LA ANTORCHA · Ronda 4 ───────────────────
    ("antorcha_grito",  "antorcha",  "Lo público se comparte con orgullo."),
    ("antorcha_ok",     "antorcha",  "¡Llamarada directa!"),
    ("antorcha_fail",   "antorcha",  "Oh no. Apagó mis llamas."),

    # ── TRUENO · Ronda 5 ────────────────────────
    ("trueno_grito",    "trueno",    "La batalla final es mía. ¡Por la efe ce ve!"),
    ("trueno_ok",       "trueno",    "¡El martillo golpea a Doom!"),
    ("trueno_fail",     "trueno",    "¡Doctor Doom contraataca!"),

    # ── DOCTOR DOOM ─────────────────────────────
    ("doom_amenaza",    "doom",      "La información de la efe ce ve será mía."),
    ("doom_ataque",     "doom",      "¡Un error más y todo será mío!"),
    ("doom_derrota",    "doom",      "¡Esto no ha terminado!"),
    ("doom_victoria",   "doom",      "La efe ce ve es mía. Nadie pudo detenerme."),

    # ── NARRADOR · Intro (intro_1 ya no se usa: el texto pasó a Max) ──
    ("intro_n1", "narrador",
     "Nivel uno: información clínica y sensible. La más protegida de todas."),
    ("intro_n2", "narrador",
     "Nivel dos: confidencial institucional. Contratos, finanzas y asuntos jurídicos."),
    ("intro_n3", "narrador",
     "Nivel tres: información interna. La que hace funcionar la operación cada día."),
    ("intro_n4", "narrador",
     "Nivel cuatro: información pública. La que la institución decidió compartir con el mundo."),
    ("intro_cierre", "narrador",
     "Cinco rondas. Tres rayos. Un solo objetivo: proteger la información de la efe ce ve."),

    # ── NARRADOR · Sistema ──────────────────────
    ("sys_ronda_ok",   "narrador", "¡Ronda superada! El siguiente héroe toma el relevo."),
    ("sys_victoria",   "narrador", "¡Victoria total! La información está a salvo."),
    ("sys_derrota",    "narrador", "Misión fallida. Repasa los niveles y vuelve más fuerte."),

    # ── INTRO: Max (mascota) presenta; incluye el briefing que antes decía el narrador ──
    # Pantalla: N1–N4. Audio: "nivel uno/dos/tres/cuatro".

    ("intro_mascota", "max",
     "¡Hola! Yo soy Max, la mascota de Ciber Héroes. "
     "Doctor Doom infiltró los sistemas de la Fundación Cardiovascular de Colombia "
     "y cinco héroes somos la última defensa. "
     "En este juego vamos a cuidar la información: "
     "si la clasificamos bien… ¡lo vamos a detener! "
     "Ahora te presento a mi equipo. ¿Listo para la misión? ¡Vamos!"),

    # Briefing: título eufórico al pasar a instrucciones
    ("briefing_titulo", "euforia",
     "¡Prepárate para la batalla!"),

    ("intro_trueno", "trueno",
     "Soy Trueno, líder de este equipo y guardián de la efe ce ve. "
     "No toda la información vale lo mismo: unas cosas se pueden compartir "
     "y otras se protegen con la vida. "
     "Cada héroe te enseñará un nivel. Escúchalos bien: después te toca a ti."),

    ("intro_barrera", "barrera",
     "Detrás de cada dato hay una persona. "
     "Cuando algo es tan delicado que un solo error hace daño real a alguien, "
     "yo levanto mi campo de fuerza. Eso es el nivel uno: la salud de una persona, "
     "su cuerpo, su historia clínica, sus datos genéticos. "
     "Aquí no basta con tener acceso, hay que tener una razón legítima para mirar."),

    ("intro_centinela", "centinela",
     "Protejo a la institución completa. "
     "Mi escudo no cuida a una sola persona, cuida a toda la efe ce ve. "
     "El nivel dos es lo que la sostiene por dentro: contratos, estrategia financiera, "
     "informes jurídicos, la base de datos del personal. "
     "Si esto se filtra, se lastima a la organización entera. "
     "El acceso no depende de tu cargo, depende de tu función."),

    ("intro_elastico", "elastico",
     "Yo conecto cada rincón de la institución. "
     "Me estiro por toda la efe ce ve uniendo áreas. El nivel tres es la información "
     "que hace que todo funcione día a día: manuales, actas, procedimientos, calendarios. "
     "No es secreta ni es un tesoro, pero es nuestra. "
     "Circula puertas adentro entre quienes trabajamos aquí, y ahí se queda."),

    ("intro_antorcha", "antorcha",
     "A mí me ven desde kilómetros, y así debe ser. "
     "El nivel cuatro es la información que la institución decidió mostrarle al mundo: "
     "comunicados, la dirección de la sede, los reportes que exige la ley. "
     "Compartirla no es un riesgo, es el objetivo. Pero cuidado con la trampa: "
     "público significa que alguien autorizó publicarlo, "
     "no que a ti te parezca inofensivo."),
]


# ═══════════════════════════════════════════════
#  FUNCIONES
# ═══════════════════════════════════════════════

C = {"ok": "\033[92m", "err": "\033[91m", "warn": "\033[93m",
     "dim": "\033[90m", "b": "\033[1m", "x": "\033[0m"}


def validar_key():
    if not API_KEY or API_KEY == "PEGA_AQUI_TU_API_KEY":
        sys.exit(
            f"{C['err']}Falta la API key.{C['x']}\n"
            "Crea voces-fcv/.env con DEEPGRAM_API_KEY=..., o ejecuta:\n"
            "  export DEEPGRAM_API_KEY='tu_key_aqui'"
        )


def hay_ffmpeg():
    return shutil.which("ffmpeg") is not None


def preparar_texto(texto):
    t = " ".join(texto.split())
    t = t.replace("…", ".")
    if t and t[-1] not in ".!?":
        t += "."
    return t


def wav_a_mp3(wav_path, mp3_path, pitch=1.0):
    filters = [f"apad=pad_dur={PAD_SILENCIO}"]
    # Tono más agudo (niño) manteniendo duración aproximada
    if pitch and abs(float(pitch) - 1.0) > 0.01:
        p = float(pitch)
        p = max(0.85, min(1.45, p))
        rate = int(24000 * p)
        filters.append(f"asetrate={rate}")
        filters.append("aresample=24000")
        # Compensar duración (atempo solo admite 0.5–2.0)
        comp = 1.0 / p
        while comp < 0.5:
            filters.append("atempo=0.5")
            comp /= 0.5
        while comp > 2.0:
            filters.append("atempo=2.0")
            comp /= 2.0
        filters.append(f"atempo={comp:.4f}")
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(wav_path),
        "-af", ",".join(filters),
        "-codec:a", "libmp3lame",
        "-b:a", MP3_BITRATE,
        str(mp3_path),
    ]
    subprocess.run(cmd, check=True)


def listar_voces():
    print(f"\n{C['b']}Consultando voces disponibles…{C['x']}\n")
    r = requests.get(
        "https://api.deepgram.com/v1/models",
        headers={"Authorization": f"Token {API_KEY}"},
        timeout=30,
    )
    if r.status_code != 200:
        sys.exit(f"{C['err']}Error {r.status_code}: {r.text[:300]}{C['x']}")

    data = r.json()
    tts = data.get("tts", [])
    es = [m for m in tts if "es" in (m.get("languages") or [])]

    if not es:
        print(f"{C['warn']}No se encontraron voces en español.{C['x']}")
        print("Modelos TTS disponibles:")
        for m in tts[:40]:
            print(f"  {m.get('canonical_name','?')}")
        return

    print(f"{C['b']}Voces en español ({len(es)}):{C['x']}\n")
    for m in es:
        nombre = m.get("name", "?")
        canon = m.get("canonical_name", "?")
        meta = m.get("metadata", {}) or {}
        acento = meta.get("accent", "")
        tags = ", ".join(meta.get("tags", [])[:4])
        print(f"  {C['b']}{nombre:<12}{C['x']} {canon:<26} "
              f"{C['dim']}{acento}  {tags}{C['x']}")

    print(f"\n{C['dim']}Copia los canonical_name al diccionario VOCES.{C['x']}\n")


def generar(nombre, personaje, texto, forzar=False, copiar_public=True):
    destino = CARPETA_SALIDA / f"{nombre}.mp3"

    if destino.exists() and not forzar:
        print(f"  {C['dim']}○ {nombre:<20} ya existe{C['x']}")
        return "skip"

    modelo = VOCES.get(personaje)
    if not modelo:
        print(f"  {C['err']}✗ {nombre:<20} personaje '{personaje}' sin voz{C['x']}")
        return "error"

    hablado = preparar_texto(texto)
    params = {"model": modelo, **PARAMS_AUDIO}
    if personaje in SPEED:
        params["speed"] = str(SPEED[personaje])

    try:
        r = requests.post(
            URL,
            headers={
                "Authorization": f"Token {API_KEY}",
                "Content-Type": "application/json",
            },
            params=params,
            json={"text": hablado},
            timeout=90,
        )
    except requests.RequestException as e:
        print(f"  {C['err']}✗ {nombre:<20} red: {e}{C['x']}")
        return "error"

    if r.status_code != 200:
        # Si speed no está soportado, reintentar sin él
        if personaje in SPEED and r.status_code == 400:
            params.pop("speed", None)
            try:
                r = requests.post(
                    URL,
                    headers={
                        "Authorization": f"Token {API_KEY}",
                        "Content-Type": "application/json",
                    },
                    params=params,
                    json={"text": hablado},
                    timeout=90,
                )
            except requests.RequestException as e:
                print(f"  {C['err']}✗ {nombre:<20} red: {e}{C['x']}")
                return "error"
        if r.status_code != 200:
            detalle = r.text[:200].replace("\n", " ")
            print(f"  {C['err']}✗ {nombre:<20} HTTP {r.status_code}: {detalle}{C['x']}")
            if r.status_code == 400 and "model" in detalle.lower():
                print(f"    {C['warn']}→ La voz '{modelo}' no existe. "
                      f"Corre --listar para ver las válidas.{C['x']}")
            return "error"

    CARPETA_SALIDA.mkdir(parents=True, exist_ok=True)

    pitch = PITCH.get(personaje, 1.0)
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(r.content)
            wav_tmp = Path(tmp.name)
        wav_a_mp3(wav_tmp, destino, pitch=pitch)
    except subprocess.CalledProcessError as e:
        print(f"  {C['err']}✗ {nombre:<20} ffmpeg: {e}{C['x']}")
        return "error"
    finally:
        try:
            wav_tmp.unlink(missing_ok=True)
        except Exception:
            pass

    if copiar_public:
        CARPETA_PUBLIC.mkdir(parents=True, exist_ok=True)
        shutil.copy2(destino, CARPETA_PUBLIC / destino.name)

    kb = destino.stat().st_size / 1024
    extra = f"  pitch×{pitch}" if abs(pitch - 1.0) > 0.01 else ""
    print(f"  {C['ok']}✓ {nombre:<20}{C['x']} {kb:6.1f} KB  "
          f"{C['dim']}{modelo}{extra}{C['x']}")
    return "ok"


def main():
    ap = argparse.ArgumentParser(
        description="Genera las voces del juego Ciber Héroes Doomsday."
    )
    ap.add_argument("--listar", action="store_true",
                    help="Muestra las voces en español disponibles y sale")
    ap.add_argument("--solo", metavar="PERSONAJE",
                    help="Genera solo un personaje (max, euforia, centinela, barrera, "
                         "elastico, antorcha, trueno, doom, narrador)")
    ap.add_argument("--forzar", action="store_true",
                    help="Regenera aunque el archivo ya exista")
    ap.add_argument("--sin-public", action="store_true",
                    help="No copiar a public/voces/")
    args = ap.parse_args()

    validar_key()

    if args.listar:
        listar_voces()
        return

    if not hay_ffmpeg():
        sys.exit(f"{C['err']}Falta ffmpeg (necesario para MP3 192k).{C['x']}")

    CARPETA_SALIDA.mkdir(parents=True, exist_ok=True)

    trabajo = GUION
    if args.solo:
        trabajo = [g for g in GUION if g[1] == args.solo]
        if not trabajo:
            sys.exit(f"{C['err']}Personaje '{args.solo}' no encontrado.{C['x']}\n"
                     f"Opciones: {', '.join(VOCES)}")

    total_chars = sum(len(preparar_texto(t)) for _, _, t in trabajo)

    print(f"\n{C['b']}═══ Generando {len(trabajo)} audios ═══{C['x']}")
    print(f"{C['dim']}Carpeta: {CARPETA_SALIDA}/")
    print(f"Copia pública: {CARPETA_PUBLIC}/")
    print(f"Caracteres: {total_chars}  ·  "
          f"Costo aprox: ${total_chars * 30 / 1_000_000:.4f} USD{C['x']}\n")

    stats = {"ok": 0, "skip": 0, "error": 0}
    personaje_actual = None

    for nombre, personaje, texto in trabajo:
        if personaje != personaje_actual:
            personaje_actual = personaje
            print(f"\n{C['b']}{personaje.upper()}{C['x']} "
                  f"{C['dim']}({VOCES.get(personaje,'?')}){C['x']}")
        stats[generar(nombre, personaje, texto, args.forzar,
                      copiar_public=not args.sin_public)] += 1
        time.sleep(0.25)

    print(f"\n{C['b']}═══ Resultado ═══{C['x']}")
    print(f"  {C['ok']}Generados: {stats['ok']}{C['x']}")
    if stats["skip"]:
        print(f"  {C['dim']}Omitidos:  {stats['skip']} (usa --forzar){C['x']}")
    if stats["error"]:
        print(f"  {C['err']}Errores:   {stats['error']}{C['x']}")

    if stats["ok"]:
        peso = sum(
            p.stat().st_size for p in CARPETA_SALIDA.glob("*.mp3")
        ) / 1024
        print(f"\n{C['dim']}Peso total: {peso:.1f} KB en {CARPETA_SALIDA}/{C['x']}")
        print(f"{C['ok']}Listo. Recarga el juego para oír las voces nuevas.{C['x']}\n")


if __name__ == "__main__":
    main()
