#!/usr/bin/env bash
set -euo pipefail

# Use DOMAIN from .env
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  source ./.env
  set +a
else
  echo ".env not found. Please create it with DOMAIN."
  exit 1
fi

if [ -z "${DOMAIN:-}" ]; then
  echo "DOMAIN is not set in .env"
  exit 1
fi

sudo mkdir -p /var/www/certbot
sudo certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -d "www.$DOMAIN"

docker exec nginx_proxy nginx -s reload || true
echo "[cert] done for $DOMAIN"


