#!/usr/bin/env bash
set -euo pipefail

# Simple cron-friendly renew script
# - Renews certs if needed
# - Reloads nginx container to pick up new certs

LOG_FILE=${LOG_FILE:-/var/log/certbot-renew.log}

echo "[renew] $(date '+%F %T') starting" >> "$LOG_FILE" 2>&1 || true

certbot renew --quiet >> "$LOG_FILE" 2>&1 || true

# Reload nginx container if running; ignore errors so cron doesn't spam
docker exec nginx_proxy nginx -s reload >> "$LOG_FILE" 2>&1 || true

echo "[renew] $(date '+%F %T') done" >> "$LOG_FILE" 2>&1 || true


