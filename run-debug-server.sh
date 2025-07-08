#!/bin/bash

echo "Building the project first..."
npm run build

echo "Building debug server..."
npx tsc src/server-debug.ts --outDir dist --module esnext --target es2022 --moduleResolution bundler

echo "Running debug server..."
node dist/server-debug.js

echo "Check mcp-debug.log for detailed logs"