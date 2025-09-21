#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "[deploy] pulling images"
docker compose pull

echo "[deploy] starting containers"
docker compose up -d

echo "[deploy] pruning old images"
docker image prune -f || true

echo "[deploy] done"


