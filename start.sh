#!/usr/bin/env bash
# ==============================================================================
# Berea One-Click Startup Script
# Automatically launches the app, starts background services, and opens the browser.
# ==============================================================================

cd "$(dirname "$0")"

# Include local node/ollama paths if present
export PATH="${HOME}/.local/bin:/usr/local/bin:/opt/homebrew/bin:${PATH}"

echo ""
echo "============================================================"
echo "          📖 Launching Berea Theological Workspace         "
echo "============================================================"
echo ""

# Check if node is installed; if not, suggest running install.sh
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "⚠️  Prerequisites not detected. Running installation first..."
  ./install.sh
fi

# Check if node_modules exists; if not, run npm install
if [ ! -d "node_modules" ]; then
  echo "📦 First-time run detected. Installing dependencies..."
  npm install
fi

# Launch browser automatically once server starts
(
  URL="http://localhost:5173"
  echo "⏳ Waiting for Berea to start..."
  for i in $(seq 1 30); do
    sleep 1
    if curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null | grep -q "200\|304"; then
      echo ""
      echo "🚀 Berea is ready! Opening in your browser: $URL"
      if command -v open >/dev/null 2>&1; then
        open "$URL"
      elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL"
      fi
      break
    fi
  done
) &

# Run Berea
npm run dev
