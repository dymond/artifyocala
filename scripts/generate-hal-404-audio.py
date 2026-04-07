#!/usr/bin/env python3
"""
Regenerate public/audio/hal-404/tier-{tier}-v{variant}.mp3 using Microsoft Edge neural TTS (edge-tts).

No API key — uses the same free Edge voices as the browser.

Default voice is **en-US-ChristopherNeural** (News / “Authority”): clearer prosody and less
flat “robot” timbre than a generic UK male at heavy negative rate. Still slow and slightly
low-pitched for a HAL-adjacent, omniscient read. Edge TTS does not expose SSML emphasis;
voice + rate + pitch + volume are the levers.

Requires: pip install edge-tts

Usage (from repo root):
  python3 scripts/generate-hal-404-audio.py

Override defaults (examples):
  HAL404_EDGE_VOICE=en-GB-RyanNeural
  HAL404_EDGE_RATE=-18%
  HAL404_EDGE_PITCH=-4Hz
  HAL404_EDGE_VOLUME=+4%
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TIER_LINES_JSON = ROOT / "src/lib/hal-404-speech-tiers.json"
OUT_DIR = ROOT / "public/audio/hal-404"


def load_env_file(path: Path) -> None:
    """
    Load KEY=VALUE pairs from a local `.env` file for convenience.

    We only set variables that are not already present in the process environment
    (so `HAL404_EDGE_*` exports still take precedence).
    """
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if not key:
            continue
        os.environ.setdefault(key, value)


load_env_file(ROOT / ".env")

VOICE = os.environ.get("HAL404_EDGE_VOICE", "en-US-ChristopherNeural")
# Slightly less slowdown than -22%: keeps consonants crisp (less “mushy” / robotic).
RATE = os.environ.get("HAL404_EDGE_RATE", "-14%")
PITCH = os.environ.get("HAL404_EDGE_PITCH", "-3Hz")
VOLUME = os.environ.get("HAL404_EDGE_VOLUME", "+6%")


def load_tier_lines() -> list[list[str]]:
    if not TIER_LINES_JSON.exists():
        print(f"Missing {TIER_LINES_JSON}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(TIER_LINES_JSON.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        print(
            "hal-404-speech-tiers.json must be a non-empty array of string arrays",
            file=sys.stderr,
        )
        sys.exit(1)
    out: list[list[str]] = []
    for tier in data:
        if not isinstance(tier, list) or not tier:
            print("Each tier must be a non-empty array of strings", file=sys.stderr)
            sys.exit(1)
        out.append([str(line) for line in tier])
    return out


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tiers = load_tier_lines()
    clip_total = sum(len(v) for v in tiers)
    print(
        f"Voice={VOICE} rate={RATE} pitch={PITCH} volume={VOLUME} "
        f"tiers={len(tiers)} clips={clip_total}"
    )

    for i, variants in enumerate(tiers):
        for j, msg in enumerate(variants):
            out = OUT_DIR / f"tier-{i}-v{j}.mp3"
            print(f"  tier-{i}-v{j}.mp3 …")
            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "edge_tts",
                    "--voice",
                    VOICE,
                    f"--rate={RATE}",
                    f"--pitch={PITCH}",
                    f"--volume={VOLUME}",
                    "--text",
                    msg,
                    "--write-media",
                    str(out),
                ],
                check=True,
            )

    print(f"Done: {OUT_DIR}/tier-<tier>-v<variant>.mp3 ({clip_total} files)")


if __name__ == "__main__":
    main()
