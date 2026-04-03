#!/usr/bin/env bash
set -euo pipefail

AVD_NAME="${1:-}"

if [ -n "${ANDROID_SDK_ROOT:-}" ]; then
  EMULATOR="$ANDROID_SDK_ROOT/emulator/emulator"
elif [ -n "${ANDROID_HOME:-}" ]; then
  EMULATOR="$ANDROID_HOME/emulator/emulator"
else
  EMULATOR="$(command -v emulator || true)"
fi

if [ -z "$AVD_NAME" ]; then
  if [ -x "$EMULATOR" ]; then
    AVD_NAME="$($EMULATOR -list-avds | head -n1)"
    echo "No AVD specified. Using first available AVD: $AVD_NAME"
  else
    echo "Emulator not found. Set ANDROID_SDK_ROOT or ANDROID_HOME, or install the emulator." >&2
    exit 1
  fi
fi

echo "Launching AVD: $AVD_NAME via emulator: $EMULATOR"
"$EMULATOR" -avd "$AVD_NAME" &
