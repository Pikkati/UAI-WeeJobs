#!/usr/bin/env bash
set -euo pipefail

AVD_NAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ADB="$(command -v adb || true)"
if [ -z "$ADB" ]; then
  if [ -n "${ANDROID_SDK_ROOT:-}" ] && [ -x "${ANDROID_SDK_ROOT}/platform-tools/adb" ]; then
    ADB="${ANDROID_SDK_ROOT}/platform-tools/adb"
  elif [ -n "${ANDROID_HOME:-}" ] && [ -x "${ANDROID_HOME}/platform-tools/adb" ]; then
    ADB="${ANDROID_HOME}/platform-tools/adb"
  fi
fi

if [ -z "$ADB" ]; then
  echo "adb not found; install Android SDK platform-tools or add adb to PATH" >&2
  exit 1
fi

if ! "$ADB" devices | grep -E '\bdevice\b' >/dev/null 2>&1; then
  echo "No devices connected; launching AVD..."
  "$REPO_ROOT/scripts/launch_avd.sh" "$AVD_NAME"
  echo "Waiting for emulator..."
  "$ADB" wait-for-device
  sleep 2
fi

pushd "$REPO_ROOT/android" >/dev/null
echo "Building and installing debug APK..."
./gradlew installDebug
popd >/dev/null

echo "Starting app activity..."
"$ADB" shell am force-stop com.weejobs.app || true
"$ADB" shell am start -n com.weejobs.app/.MainActivity || true

sleep 4

echo "=== expo-router-native logs ==="
"$ADB" logcat -d | grep "expo-router-native" || true
echo "=== expo-router logs ==="
"$ADB" logcat -d | grep "expo-router" || true
echo "=== index logs ==="
"$ADB" logcat -d | grep "\[index\]" || true

echo "=== /sdcard/Download/routes_manifest_seen.txt ==="
"$ADB" shell ls -l /sdcard/Download/routes_manifest_seen.txt 2>/dev/null || true
"$ADB" shell cat /sdcard/Download/routes_manifest_seen.txt 2>/dev/null || true

echo "=== app files ==="
"$ADB" shell run-as com.weejobs.app ls -l /data/data/com.weejobs.app/files 2>/dev/null || true
"$ADB" exec-out run-as com.weejobs.app cat /data/data/com.weejobs.app/files/routes_manifest_seen.txt 2>/dev/null || true

echo "Verification complete."

