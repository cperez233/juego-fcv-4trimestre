# data/ (privado, fuera de `public/`)

Esta carpeta la lee **solo el servidor** (`server.js`). Nada de aquí se publica en el navegador.

- `cedulas.csv` — lista de documentos autorizados (una cédula por línea). La valida el servidor en `POST /api/validar` (Fase 5).
- `participaciones/` — una carpeta por participación: `DDMMYYYY - CEDULA/resultado.json` y `eventos.jsonl` (Fase 5).

Todo el contenido, salvo este README, está en `.gitignore`.
