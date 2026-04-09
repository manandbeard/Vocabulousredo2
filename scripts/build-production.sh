#!/bin/sh
set -e

echo "Building frontend (srs-app)..."
PORT=8080 BASE_PATH=/ pnpm --filter @workspace/srs-app run build

echo "Building API server..."
pnpm --filter @workspace/api-server run build

echo "Production build complete."
