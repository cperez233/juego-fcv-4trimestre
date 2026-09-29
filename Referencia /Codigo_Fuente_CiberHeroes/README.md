# Max Héroes Doomsday — FCV

Juego web de clasificación de activos de información (N1–N4) con héroes, voces e intro. Hecho con **Vite + React**.

## Requisitos

- [Node.js](https://nodejs.org/) **18+** (recomendado 20 LTS)
- npm (viene con Node)
- Navegador moderno (Chrome, Firefox, Edge)

## Cómo ejecutarlo en otra máquina

```bash
# 1. Clonar el repositorio (necesitas acceso: es privado)
git clone https://github.com/RamiroS1/game-fcv.git
cd game-fcv

# 2. Instalar dependencias
npm install

# 3. Arrancar el servidor de desarrollo
npm run dev
```

Abre en el navegador la URL que muestre Vite, normalmente:

**http://localhost:5173/**

Para acceder desde otro dispositivo en la misma red:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Luego usa `http://<IP-de-tu-PC>:5173/`.

## Scripts útiles

| Comando | Qué hace |
|--------|----------|
| `npm run dev` | Servidor de desarrollo (hot reload) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build en **http://localhost:5005/** (cabeceras de seguridad) |
| `npm run preview:lan` | Preview accesible en la red |

## Soundtrack (opcional)

El tema oficial de Avengers **no** está incluido (copyright). Si tienes un MP3 con derecho de uso:

1. Colócalo en `public/audio/soundtrack.mp3`
2. Recarga el juego
3. La música arranca al pulsar **¡Unirme al equipo!** (botón 🎵 / 🔇 arriba a la derecha)

## Voces

Los MP3 de la intro están en `public/voces/`. Para regenerarlos (API Deepgram):

```bash
cd voces-fcv
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install requests
export DEEPGRAM_API_KEY='tu_key'
python generar_voces.py
```

Luego copia los nuevos archivos a `public/voces/` si hace falta.

## Estructura rápida

```
game-fcv/
├── max-heroes-doomsday.jsx   # Juego principal
├── src/
│   ├── main.jsx              # Entrada React
│   └── session.js            # localStorage + sync /api
├── api/                      # PHP delgado (DB propia, no Mundial)
│   ├── schema.sql
│   ├── config.php            # MySQL + REMOTE_LOG_URL
│   ├── validar.php
│   ├── sesion.php
│   ├── score.php
│   └── configuracion_inicial.php
├── public/
│   ├── data/identificaciones.csv
│   ├── voces/
│   └── audio/
├── voces-fcv/
├── package.json
└── vite.config.js
```

## Sesión, estadísticas y API

El progreso se guarda en **localStorage** por cédula (`ch-sesion:{documento}`): pantalla, ronda, puntaje, tiempos. Si pierdes una ronda y vuelves a entrar con la misma cédula, puedes **continuar en esa ronda** (las ya ganadas se conservan).

Al terminar (victoria o derrota de ronda) se envía un POST enriquecido a `/api/score.php`:

```json
{
  "documento": "...",
  "puntaje": 7,
  "gano": false,
  "durationMs": 492000,
  "startedAt": "...",
  "endedAt": "...",
  "resultados": ["win"],
  "rondaIdx": 1,
  "juego": "ciber-heroes-doomsday"
}
```

Sin PHP el juego **sigue funcionando**; las llamadas a API fallan en silencio.

### Desplegar API PHP (DB separada del Mundial)

1. Crear base `ciberheroes` e importar [`api/schema.sql`](api/schema.sql)
2. Ajustar usuario/clave en [`api/config.php`](api/config.php)
3. Cargar cédulas: `php api/configuracion_inicial.php` (lee `public/data/identificaciones.csv`)
4. Servir el build (`dist/`) y la carpeta `api/` en el mismo host (Apache/Nginx + PHP)
5. Opcional: en `config.php`, `CH_REMOTE_LOG_URL` para reenviar cada score a otra máquina

### Proxy en desarrollo

```bash
CH_API_PROXY=http://127.0.0.1:8080 npm run dev
```

## Notas

- El navegador puede bloquear audio hasta el primer clic del usuario.
- Reintentos por cédula están permitidos (historial en `ch_resultados`, sin UNIQUE por documento).
- No hace falta backend para jugar en local; la API es para el hosting y el log remoto.
- Cabeceras de seguridad: CSP, `X-Frame-Options: DENY`, `nosniff`, `Cache-Control: no-store` (Vite preview, `.htaccess` en Apache, API PHP).
