#!/usr/bin/env bash
set -euo pipefail

SESSION_DIR="${1:-}"
if [[ -z "$SESSION_DIR" ]]; then
  echo "Usage: scripts/stop-server.sh <session_dir>" >&2
  exit 2
fi

INFO="$SESSION_DIR/state/server-info"
if [[ ! -f "$INFO" ]]; then
  echo "No server-info at: $INFO" >&2
  exit 1
fi

PID="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log(j.pid||'');" "$INFO")"
if [[ -z "$PID" ]]; then
  echo "No pid found in server-info" >&2
  exit 1
fi

kill "$PID" 2>/dev/null || true
echo "stopped pid $PID"
