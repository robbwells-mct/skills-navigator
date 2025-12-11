#!/bin/bash

# Build the application
echo "Building the application..."
npm install
npm run build

# The build output is in the 'dist' directory
echo "Build complete. Output is in the 'dist' directory."
