#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

NODE_BIN="/Users/anshil/.gemini/antigravity-ide/bin/node"
if ! command -v "$NODE_BIN" &> /dev/null; then
  NODE_BIN="node"
fi

echo "=================================================="
echo "    Starting SnackStock Full-Stack Local Demo     "
echo "=================================================="

# 1. Start the SnackStock API Server on port 8080
echo "Starting Backend API on http://localhost:8080/api ..."
"$NODE_BIN" backend/demo-server.mjs &
API_PID=$!

# Trap exit to cleanup background processes
cleanup() {
  echo ""
  echo "Shutting down SnackStock demo servers..."
  kill $API_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 2. Start the Vite Frontend on port 5173
echo "Starting Frontend UI on http://localhost:5173 ..."
cd frontend
"$NODE_BIN" ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173

