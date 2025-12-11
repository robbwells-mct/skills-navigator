#!/bin/sh
echo "Starting Skills Navigator static server..."
cd /home/site/wwwroot
pm2 serve . 8080 --spa --no-daemon
