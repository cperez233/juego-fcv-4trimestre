#!/bin/bash
# Mantiene node server.js en :5005. Si se cae, lo relanza a los 5s.
set -u
ROOT="/home/desarrollo/game-fcv"
LOG="$ROOT/logs/game-fcv.log"
PIDFILE="$ROOT/logs/game-fcv.pid"
mkdir -p "$ROOT/logs"
cd "$ROOT" || exit 1
echo $$ > "$PIDFILE"
export PORT=5005
export HOST=0.0.0.0
while true; do
  echo "$(date -Is) arranque game-fcv :5005" >> "$LOG"
  /usr/bin/node "$ROOT/server.js" >> "$LOG" 2>&1
  code=$?
  echo "$(date -Is) node salió con código $code; reinicio en 5s" >> "$LOG"
  sleep 5
done
