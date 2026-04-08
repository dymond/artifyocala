#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR=""
HOST="127.0.0.1"
URL_HOST="localhost"
PORT="0"
IDLE_MS="1800000"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-dir)
      PROJECT_DIR="${2:-}"; shift 2;;
    --host)
      HOST="${2:-}"; shift 2;;
    --url-host)
      URL_HOST="${2:-}"; shift 2;;
    --port)
      PORT="${2:-}"; shift 2;;
    --idle-ms)
      IDLE_MS="${2:-}"; shift 2;;
    -h|--help)
      echo "Usage: scripts/start-server.sh --project-dir <path> [--host 127.0.0.1] [--url-host localhost] [--port 0] [--idle-ms 1800000]"
      exit 0;;
    *)
      echo "Unknown arg: $1" >&2
      exit 2;;
  esac
done

if [[ -z "$PROJECT_DIR" ]]; then
  echo "--project-dir is required" >&2
  exit 2
fi

mkdir -p "$PROJECT_DIR/.superpowers/brainstorm"

# Start server; capture first JSON line; keep server running in background.
node "$PROJECT_DIR/scripts/brainstorm-server.mjs" \
  --project-dir "$PROJECT_DIR" \
  --host "$HOST" \
  --port "$PORT" \
  --url-host "$URL_HOST" \
  --idle-ms "$IDLE_MS" \
  >"$PROJECT_DIR/.superpowers/brainstorm/last-start.json" 2>"$PROJECT_DIR/.superpowers/brainstorm/last-error.log" &

PID=$!
echo "$PID" >"$PROJECT_DIR/.superpowers/brainstorm/last-pid"

# Wait briefly for server-info to show up.
STARTED=""
for _ in $(seq 1 50); do
  if [[ -s "$PROJECT_DIR/.superpowers/brainstorm/last-start.json" ]]; then
    STARTED="$(head -n 1 "$PROJECT_DIR/.superpowers/brainstorm/last-start.json")"
    break
  fi
  sleep 0.05
done

if [[ -z "$STARTED" ]]; then
  echo "Failed to start server (pid=$PID). See .superpowers/brainstorm/last-error.log" >&2
  exit 1
fi

echo "$STARTED"
