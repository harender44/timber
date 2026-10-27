#!/bin/sh
set -e
cd /workspace 2>/dev/null || cd "$(dirname "$0")"

# Find python/uvicorn command (prefer local venv if available)
if [ -x "./venv/bin/uvicorn" ]; then
  UVICORN_CMD="./venv/bin/uvicorn"
elif [ -x "./.venv/bin/uvicorn" ]; then
  UVICORN_CMD="./.venv/bin/uvicorn"
elif command -v python3.10 >/dev/null 2>&1; then
  UVICORN_CMD="python3.10 -m uvicorn"
elif command -v python3.12 >/dev/null 2>&1; then
  UVICORN_CMD="python3.12 -m uvicorn"
else
  UVICORN_CMD="python3 -m uvicorn"
fi

if ! curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8090/timber-api/health; then
  $UVICORN_CMD backend.main:app --host 127.0.0.1 --port 8090 > /tmp/timber-api.log 2>&1 &
fi

if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi

npm run dev > /tmp/vite-dev.log 2>&1 &
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
    exit 0
  fi
  sleep 0.5
done
exit 1
