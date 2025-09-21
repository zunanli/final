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

# Prefer multi-arch build to avoid arch mismatch (e.g., arm64 laptop -> amd64 server)
if docker buildx version >/dev/null 2>&1; then
  echo "[build] using docker buildx for multi-arch (linux/amd64,linux/arm64)"
  # Ensure a builder exists
  if ! docker buildx inspect >/dev/null 2>&1; then
    docker buildx create --use >/dev/null
  fi
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t "$IMAGE:$TAG" \
    -t "$IMAGE:latest" \
    -f Dockerfile \
    --push \
    .
else
  echo "[build] buildx not available, building single-arch image"
  docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" -f Dockerfile .
  docker push "$IMAGE:$TAG"
  docker push "$IMAGE:latest"
fi

echo "[build] done"


