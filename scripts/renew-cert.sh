#!/usr/bin/env bash
set -euo pipefail

LOG_FILE=${LOG_FILE:-/var/log/certbot-renew.log}
NGINX_CONTAINER="nginx_proxy"

echo "[renew-hook] $(date '+%F %T') starting renewal check" >> "$LOG_FILE" 2>&1 || true

# 使用 --deploy-hook，仅在成功续期后才执行 reload 命令
certbot renew --quiet \
    --deploy-hook "docker exec ${NGINX_CONTAINER} nginx -s reload" >> "$LOG_FILE" 2>&1 || true

echo "[renew-hook] $(date '+%F %T') renewal check done" >> "$LOG_FILE" 2>&1 || true
