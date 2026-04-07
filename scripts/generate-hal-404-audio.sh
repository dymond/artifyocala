#!/usr/bin/env bash
# Wrapper: neural TTS via Edge (see generate-hal-404-audio.py).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec python3 "$ROOT/scripts/generate-hal-404-audio.py"
