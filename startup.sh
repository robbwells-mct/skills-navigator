#!/bin/sh
echo "Starting Skills Navigator static server..."
echo "Listing files in /home/site/wwwroot:"
ls -la /home/site/wwwroot
cd /home/site/wwwroot
echo "Current directory: $(pwd)"
echo "Starting pm2 on port 8080..."
npx pm2 serve . 8080 --spa --no-daemon
