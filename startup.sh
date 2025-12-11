#!/bin/sh
set -e

echo "Starting Skills Navigator static server..."

ROOT_DIR="/home/site/wwwroot"
SERVE_DIR="$ROOT_DIR"

# Some deploy methods place the built output under /home/site/wwwroot/dist
if [ -f "$ROOT_DIR/dist/index.html" ]; then
	SERVE_DIR="$ROOT_DIR/dist"
fi

echo "Root directory contents ($ROOT_DIR):"
ls -la "$ROOT_DIR" || true

echo "Serving directory: $SERVE_DIR"
ls -la "$SERVE_DIR" || true

cd "$SERVE_DIR"
echo "Current directory: $(pwd)"

echo "Starting pm2 static server on port 8080..."
npx pm2 serve . 8080 --spa --no-daemon
