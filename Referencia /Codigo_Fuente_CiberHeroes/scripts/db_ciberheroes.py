#!/usr/bin/env python3
"""SQLite para Ciber Héroes — resultados, eventos y limpieza."""
from __future__ import annotations

import json
import os
import shutil
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB = Path(os.environ.get("CH_SQLITE_PATH", ROOT / "data-ciber-heroes" / "ciberheroes.db"))
DEFAULT_DATA = Path(os.environ.get("CH_DATA_DIR", ROOT / "data-ciber-heroes"))


def connect(db_path: Path | None = None) -> sqlite3.Connection:
    path = Path(db_path or DEFAULT_DB)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS ch_resultados (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          documento TEXT NOT NULL,
          puntaje INTEGER NOT NULL DEFAULT 0,
          gano INTEGER NOT NULL DEFAULT 0,
          duration_ms INTEGER NOT NULL DEFAULT 0,
          started_at TEXT NULL,
          ended_at TEXT NULL,
          resultados_json TEXT,
          ronda_idx INTEGER NOT NULL DEFAULT 0,
          juego TEXT NOT NULL DEFAULT 'ciber-heroes-doomsday',
          fecha TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS ch_sesiones (
          documento TEXT PRIMARY KEY,
          pantalla TEXT NOT NULL DEFAULT 'intro',
          ronda_idx INTEGER NOT NULL DEFAULT 0,
          resultados_json TEXT,
          puntaje INTEGER NOT NULL DEFAULT 0,
          started_at TEXT NULL,
          updated_at TEXT NOT NULL,
          estado TEXT NOT NULL DEFAULT 'en_curso',
          gano INTEGER NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS ch_eventos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          documento TEXT NOT NULL,
          evento TEXT NOT NULL,
          ronda INTEGER NOT NULL DEFAULT 1,
          puntaje INTEGER NOT NULL DEFAULT 0,
          aciertos_ronda INTEGER NOT NULL DEFAULT 0,
          preguntas_ronda INTEGER NOT NULL DEFAULT 0,
          vidas INTEGER NULL,
          started_at TEXT NULL,
          fecha TEXT NOT NULL
        )
        """
    )
    extras_resultados = {
        "evento": "TEXT",
        "ronda": "INTEGER",
        "aciertos_ronda": "INTEGER DEFAULT 0",
        "preguntas_ronda": "INTEGER DEFAULT 0",
        "vidas": "INTEGER",
        "respuestas_correctas": "INTEGER DEFAULT 0",
        "duration_s": "INTEGER DEFAULT 0",
        "tiempo": "TEXT",
    }
    _ensure_columns(conn, "ch_resultados", extras_resultados)
    extras_eventos = {
        "ended_at": "TEXT",
        "duration_ms": "INTEGER DEFAULT 0",
        "duration_s": "INTEGER DEFAULT 0",
        "tiempo": "TEXT",
        "respuestas_correctas": "INTEGER DEFAULT 0",
        "gano": "INTEGER DEFAULT 0",
    }
    _ensure_columns(conn, "ch_eventos", extras_eventos)
    conn.commit()
    return conn


def _ensure_columns(conn: sqlite3.Connection, table: str, extras: dict[str, str]) -> None:
    cols = {row[1] for row in conn.execute(f"PRAGMA table_info({table})")}
    for name, typ in extras.items():
        if name not in cols:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {name} {typ}")


def _parse_iso(value: object) -> datetime | None:
    if not value or not isinstance(value, str):
        return None
    text = value.strip()
    if not text:
        return None
    try:
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def fmt_tiempo(ms: int) -> str:
    return fmt_tiempo_from_seconds(max(0, int(ms) // 1000))


def fmt_tiempo_from_seconds(total: int) -> str:
    total = max(0, int(total or 0))
    h, rem = divmod(total, 3600)
    m, s = divmod(rem, 60)
    parts: list[str] = []
    if h:
        parts.append("1 hora" if h == 1 else f"{h} horas")
    if m:
        parts.append("1 minuto" if m == 1 else f"{m} minutos")
    if s or not parts:
        parts.append("1 segundo" if s == 1 else f"{s} segundos")
    return " ".join(parts)


def duration_from(payload: dict) -> tuple[int, int, str]:
    ms = int(payload.get("durationMs") or payload.get("duration_ms") or 0)
    if ms <= 0:
        start = _parse_iso(payload.get("startedAt") or payload.get("started_at"))
        end = _parse_iso(payload.get("endedAt") or payload.get("ended_at"))
        if start and end:
            if start.tzinfo is None:
                start = start.replace(tzinfo=timezone.utc)
            if end.tzinfo is None:
                end = end.replace(tzinfo=timezone.utc)
            ms = max(0, int((end - start).total_seconds() * 1000))
    seconds = max(0, ms // 1000)
    return ms, seconds, fmt_tiempo_from_seconds(seconds)


def _ronda_num(payload: dict) -> int:
    if payload.get("ronda") is not None:
        return max(1, int(payload["ronda"]))
    return int(payload.get("rondaIdx") or 0) + 1


def save_resultado(payload: dict, db_path: Path | None = None) -> int:
    conn = connect(db_path)
    doc = "".join(c for c in str(payload.get("documento") or "") if c.isdigit())
    if not doc:
        raise ValueError("Falta documento")
    resultados = payload.get("resultados") or []
    if not isinstance(resultados, list):
        resultados = []
    fecha = datetime.now().isoformat(timespec="seconds")
    ronda = _ronda_num(payload)
    evento = str(payload.get("evento") or "fin")
    aciertos_ronda = int(payload.get("aciertosRonda") or 0)
    preguntas_ronda = int(payload.get("preguntasRonda") or aciertos_ronda)
    vidas = payload.get("vidasRestantes")
    vidas_i = None if vidas is None else int(vidas)
    puntaje = int(payload.get("puntaje") or payload.get("respuestasCorrectas") or 0)
    gano = 1 if payload.get("gano") else 0
    duration_ms, duration_s, tiempo = duration_from(payload)

    conn.execute(
        """
        INSERT INTO ch_eventos
          (documento, evento, ronda, puntaje, aciertos_ronda, preguntas_ronda, vidas,
           started_at, ended_at, fecha, duration_ms, duration_s, tiempo,
           respuestas_correctas, gano)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            doc, evento, ronda, puntaje, aciertos_ronda, preguntas_ronda, vidas_i,
            payload.get("startedAt"), payload.get("endedAt"), fecha,
            duration_ms, duration_s, tiempo, puntaje, gano,
        ),
    )

    cur = conn.execute(
        """
        INSERT INTO ch_resultados
          (documento, puntaje, gano, duration_ms, started_at, ended_at,
           resultados_json, ronda_idx, juego, fecha,
           evento, ronda, aciertos_ronda, preguntas_ronda, vidas,
           respuestas_correctas, duration_s, tiempo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            doc,
            puntaje,
            gano,
            duration_ms,
            payload.get("startedAt"),
            payload.get("endedAt"),
            json.dumps(resultados, ensure_ascii=False),
            ronda - 1,
            str(payload.get("juego") or "ciber-heroes-doomsday"),
            fecha,
            evento,
            ronda,
            aciertos_ronda,
            preguntas_ronda,
            vidas_i,
            puntaje,
            duration_s,
            tiempo,
        ),
    )
    conn.commit()
    rid = int(cur.lastrowid)
    conn.close()
    return rid


def import_folders(data_dir: Path | None = None, db_path: Path | None = None) -> int:
    root = Path(data_dir or DEFAULT_DATA)
    count = 0
    if not root.is_dir():
        return 0
    conn = connect(db_path)
    conn.close()
    for folder in sorted(root.iterdir()):
        if not folder.is_dir():
            continue
        jf = folder / "resultado.json"
        if not jf.is_file():
            continue
        try:
            payload = json.loads(jf.read_text(encoding="utf-8"))
        except Exception:
            continue
        doc = "".join(c for c in str(payload.get("documento") or "") if c.isdigit())
        if not doc:
            continue
        save_resultado(payload, db_path)
        count += 1
    return count


def list_resultados(limit: int = 20, db_path: Path | None = None) -> list[dict]:
    conn = connect(db_path)
    rows = conn.execute(
        """
        SELECT id, documento, respuestas_correctas, puntaje, gano, ronda, evento,
               tiempo, duration_s, aciertos_ronda, preguntas_ronda, ended_at, fecha
        FROM ch_resultados
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def reset_db(db_path: Path | None = None, data_dir: Path | None = None) -> dict:
    db = Path(db_path or DEFAULT_DB)
    root = Path(data_dir or DEFAULT_DATA)
    borradas = []
    if root.is_dir():
        for folder in sorted(root.iterdir()):
            if folder.is_dir() and " - " in folder.name:
                shutil.rmtree(folder, ignore_errors=True)
                borradas.append(folder.name)
    conn = connect(db)
    conn.execute("DELETE FROM ch_eventos")
    conn.execute("DELETE FROM ch_resultados")
    conn.execute("DELETE FROM ch_sesiones")
    try:
        conn.execute("DELETE FROM sqlite_sequence")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()
    return {"ok": True, "db": str(db), "carpetas_borradas": borradas}


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Uso: db_ciberheroes.py init|save|import|list|reset [json]", file=sys.stderr)
        return 2
    cmd = argv[1]
    if cmd == "init":
        connect().close()
        print(str(DEFAULT_DB))
        return 0
    if cmd == "save":
        raw = sys.stdin.read()
        if not str(raw).strip() and len(argv) > 2:
            raw = argv[2]
        payload = json.loads(raw or "{}")
        rid = save_resultado(payload)
        print(json.dumps({"ok": True, "id": rid}))
        return 0
    if cmd == "import":
        n = import_folders()
        print(json.dumps({"ok": True, "importados": n, "db": str(DEFAULT_DB)}))
        return 0
    if cmd == "list":
        print(json.dumps(list_resultados(), ensure_ascii=False, indent=2))
        return 0
    if cmd == "reset":
        print(json.dumps(reset_db(), ensure_ascii=False, indent=2))
        return 0
    print("Comando desconocido", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
