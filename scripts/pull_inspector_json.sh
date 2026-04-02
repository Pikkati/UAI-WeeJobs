#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: pull_inspector_json.sh [-s SERIAL] [-o OUT]

Attempts to pull `expo-router-inspect-all.json` from a connected Android device.
Tries these locations (in order):
  /sdcard/Download/expo-router-inspect-all.json
  /storage/emulated/0/Android/data/com.weejobs.app/files/expo-router-inspect-all.json

If those fail, attempts `run-as com.weejobs.app cat files/expo-router-inspect-all.json` (requires debuggable app).

Examples:
  ./scripts/pull_inspector_json.sh
  ./scripts/pull_inspector_json.sh -s RFCT71GH14H -o ../expo-router-inspect-all-from-device.json
EOF
}

ADB="$(command -v adb || true)"
if [ -z "$ADB" ]; then
  if [ -n "$ANDROID_HOME" ] && [ -x "$ANDROID_HOME/platform-tools/adb" ]; then
    ADB="$ANDROID_HOME/platform-tools/adb"
  elif [ -n "$LOCALAPPDATA" ] && [ -x "$LOCALAPPDATA/Android/Sdk/platform-tools/adb" ]; then
    ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb"
  fi
fi

if [ -z "$ADB" ]; then
  echo "adb not found in PATH or common SDK locations" >&2
  exit 2
fi

SERIAL=""
OUT=""

while getopts ":s:o:h" opt; do
  case "$opt" in
    s) SERIAL="$OPTARG" ;;
    o) OUT="$OPTARG" ;;
    h) usage; exit 0 ;;
    :) echo "Missing arg for -$OPTARG" >&2; usage; exit 1 ;;
    \?) echo "Invalid option: -$OPTARG" >&2; usage; exit 1 ;;
  esac
done

if [ -z "$OUT" ]; then
  OUT="$(dirname "$(realpath "$0")")/../expo-router-inspect-all-from-device.json"
fi

if [ -z "$SERIAL" ]; then
  raw="$($ADB devices -l)"
  # parse serial ids; prefer physical device
  device_line=$(printf "%s" "$raw" | awk '/device/ && $1 !~ /emulator/ {print $1; exit}');
  if [ -z "$device_line" ]; then
    device_line=$(printf "%s" "$raw" | awk '/device/ {print $1; exit}')
  fi
  if [ -z "$device_line" ]; then
    echo "No connected devices found" >&2
    exit 3
  fi
  SERIAL="$device_line"
fi

echo "Using adb: $ADB"
echo "Target device: $SERIAL"

candidates=( "/sdcard/Download/expo-router-inspect-all.json" "/storage/emulated/0/Android/data/com.weejobs.app/files/expo-router-inspect-all.json" )
found=0
for p in "${candidates[@]}"; do
  echo "Trying pull $p ..."
  if "$ADB" -s "$SERIAL" pull "$p" "$OUT" >/dev/null 2>&1; then
    echo "Pulled $p -> $OUT"
    found=1
    break
  else
    echo "pull failed for $p"
  fi
done

if [ "$found" -eq 0 ]; then
  echo "Attempting run-as fallback (requires debuggable app)..."
  if "$ADB" -s "$SERIAL" shell "run-as com.weejobs.app cat files/expo-router-inspect-all.json" > "$OUT" 2>/dev/null; then
    echo "Wrote via run-as -> $OUT"
    found=1
  else
    echo "run-as fallback failed"
  fi
fi

if [ "$found" -eq 1 ]; then
  if command -v jq >/dev/null 2>&1; then
    if jq . "$OUT" >/dev/null 2>&1; then
      jq . "$OUT" > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
      echo "JSON valid and pretty-printed -> $OUT"
      exit 0
    else
      echo "Pulled file is not valid JSON" >&2
      exit 4
    fi
  else
    echo "Pulled file saved at $OUT (jq not available for validation)"
    exit 0
  fi
else
  echo "Could not retrieve inspector JSON from device" >&2
  exit 5
fi
