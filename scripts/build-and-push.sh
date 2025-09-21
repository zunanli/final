#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Load .env
if [ -f .env ]; then
  set -a
  source ./.env
  set +a
else
  echo ".env not found. Please create it with IMAGE, TAG, DOMAIN."
  exit 1
fi

echo "[build] IMAGE=$IMAGE TAG=$TAG"

docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" -f Dockerfile .
docker push "$IMAGE:$TAG"
docker push "$IMAGE:latest"

echo "[build] done"


