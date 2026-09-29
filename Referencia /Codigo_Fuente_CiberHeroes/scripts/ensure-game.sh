#!/bin/bash
# Si el juego no responde en :5005, arranca (o relanza) el supervisor.
ROOT="/home/desarrollo/game-fcv"
mkdir -p "$ROOT/logs"
LOG="$ROOT/logs/game-fcv.log"

http_ok() {
  python3 - <<'PY' >/dev/null 2>&1
import urllib.request
urllib.request.urlopen("http://127.0.0.1:5005/", timeout=3)
PY
}

stop_game() {
  pkill -f "$ROOT/scripts/game-fcv-run.sh" >/dev/null 2>&1 || true
  pkill -f "/usr/bin/node $ROOT/server.js" >/dev/null 2>&1 || true
  sleep 1
}

if ss -tln 2>/dev/null | grep -qE ':5005([^0-9]|$)'; then
  if http_ok; then
    exit 0
  fi
  echo "$(date -Is) :5005 no responde HTTP; relanzo" >> "$LOG"
  stop_game
fi

if pgrep -f "$ROOT/scripts/game-fcv-run.sh" >/dev/null 2>&1; then
  if http_ok; then
    exit 0
  fi
  stop_game
fi

nohup /bin/bash "$ROOT/scripts/game-fcv-run.sh" >/dev/null 2>&1 &
disown || true
sleep 2
exit 0
