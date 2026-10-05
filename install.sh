#!/usr/bin/env bash
# ==============================================================================
# Berea One-Click Setup & Installer
# Works out-of-the-box on macOS and Linux even without Node.js or npm installed.
# ==============================================================================

set -e

# Change directory to the root of the project
cd "$(dirname "$0")"

echo ""
echo "============================================================"
echo "          📖 Berea — One-Click Automatic Installer         "
echo "============================================================"
echo ""

# 1. Detect and install Node.js / npm if missing
install_node() {
  echo "🔍 Checking for Node.js and npm..."
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    echo "✅ Node.js $(node -v) and npm $(npm -v) found."
    return 0
  fi

  echo "⚠️  Node.js not detected. Installing Node.js automatically..."

  OS="$(uname -s)"
  if [ "$OS" = "Darwin" ]; then
    # macOS
    if command -v brew >/dev/null 2>&1; then
      echo "📦 Installing Node.js via Homebrew..."
      brew install node
    else
      echo "📦 Homebrew not found. Installing standalone Node.js LTS for macOS..."
      ARCH="$(uname -m)"
      NODE_VER="v20.18.0"
      if [ "$ARCH" = "arm64" ]; then
        NODE_TAR="node-${NODE_VER}-darwin-arm64.tar.gz"
      else
        NODE_TAR="node-${NODE_VER}-darwin-x64.tar.gz"
      fi
      TMP_DIR="$(mktemp -d)"
      curl -fsSL --retry 3 "https://nodejs.org/dist/${NODE_VER}/${NODE_TAR}" -o "${TMP_DIR}/${NODE_TAR}"
      mkdir -p "${HOME}/.local"
      tar -xzf "${TMP_DIR}/${NODE_TAR}" -C "${HOME}/.local" --strip-components=1
      rm -rf "${TMP_DIR}"
      export PATH="${HOME}/.local/bin:${PATH}"
    fi
  elif [ "$OS" = "Linux" ]; then
    # Linux
    if command -v apt-get >/dev/null 2>&1; then
      echo "📦 Installing Node.js via NodeSource on Debian/Ubuntu..."
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    elif command -v dnf >/dev/null 2>&1; then
      echo "📦 Installing Node.js via dnf..."
      sudo dnf install -y nodejs
    elif command -v pacman >/dev/null 2>&1; then
      echo "📦 Installing Node.js via pacman..."
      sudo pacman -S --noconfirm nodejs npm
    else
      echo "📦 Downloading standalone Node.js binary..."
      ARCH="$(uname -m)"
      NODE_VER="v20.18.0"
      NODE_TAR="node-${NODE_VER}-linux-x64.tar.gz"
      TMP_DIR="$(mktemp -d)"
      curl -fsSL --retry 3 "https://nodejs.org/dist/${NODE_VER}/${NODE_TAR}" -o "${TMP_DIR}/${NODE_TAR}"
      mkdir -p "${HOME}/.local"
      tar -xzf "${TMP_DIR}/${NODE_TAR}" -C "${HOME}/.local" --strip-components=1
      rm -rf "${TMP_DIR}"
      export PATH="${HOME}/.local/bin:${PATH}"
    fi
  else
    echo "❌ Unsupported operating system: $OS"
    exit 1
  fi

  # Final verification of node
  if ! command -v node >/dev/null 2>&1; then
    if [ -x "${HOME}/.local/bin/node" ]; then
      export PATH="${HOME}/.local/bin:${PATH}"
    else
      echo "❌ Node.js installation could not be completed automatically."
      echo "Please install Node.js manually from https://nodejs.org/"
      exit 1
    fi
  fi
  echo "✅ Node.js $(node -v) is ready."
}

install_node

# Ensure PATH has .local/bin if user installed locally
if [ -d "${HOME}/.local/bin" ]; then
  case ":$PATH:" in
    *":${HOME}/.local/bin:"*) ;;
    *) export PATH="${HOME}/.local/bin:${PATH}" ;;
  esac
fi

# 2. Install Project Dependencies
echo ""
echo "📦 Installing project dependencies..."
npm install

# 3. Ensure Ollama & Llama 3.1 AI Model are ready
echo ""
echo "🤖 Setting up local AI engine (Ollama & Llama 3.1)..."
node scripts/ensure-ollama.mjs

echo ""
echo "============================================================"
echo "🎉 Berea has been successfully installed and configured!"
echo "👉 You can now run ./start.sh (or double-click it) anytime."
echo "============================================================"
echo ""
