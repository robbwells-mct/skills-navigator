#!/bin/sh
set -e

echo "Starting Skills Navigator..."

ROOT_DIR="/home/site/wwwroot"
PORT_VALUE="${PORT:-8080}"
export PORT="$PORT_VALUE"

echo "PORT=$PORT"
echo "Root directory contents ($ROOT_DIR):"
ls -la "$ROOT_DIR" || true

if [ -f "$ROOT_DIR/dist/server.js" ]; then
	echo "Found dist server. Starting: $ROOT_DIR/dist/server.js"
	cd "$ROOT_DIR/dist"
	exec node server.js
fi

if [ -f "$ROOT_DIR/server.js" ]; then
	echo "Found root server. Starting: $ROOT_DIR/server.js"
	cd "$ROOT_DIR"
	exec node server.js
fi

echo "No server.js found in $ROOT_DIR or $ROOT_DIR/dist"
exit 1
