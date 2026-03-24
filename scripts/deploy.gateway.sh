#!/usr/bin/env bash
set -euo pipefail

# =========================
# SelahFlow 一键构建 + 部署（仅 SelahFlow 服务）
# =========================
# 用法：
#   bash scripts/deploy.gateway.sh
#
# 可通过环境变量覆盖默认值，例如：
#   REMOTE_HOST=1.2.3.4 REMOTE_USER=lvg bash scripts/deploy.gateway.sh

# ---------- 本地配置 ----------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist"

# ---------- 远程连接配置 ----------
REMOTE_USER="${REMOTE_USER:-lvg}"
REMOTE_HOST="${REMOTE_HOST:-101.33.118.75}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/tencent-hk-server.pem}"

# ---------- 远程部署路径 ----------
REMOTE_DEPLOY_DIR="${REMOTE_DEPLOY_DIR:-/home/lvg/deploy/selahflow/dist}"

# ---------- 容器/域名配置 ----------
SELAHFLOW_CONTAINER_NAME="${SELAHFLOW_CONTAINER_NAME:-selahflow-web}"
SELAHFLOW_UPSTREAM_PORT="${SELAHFLOW_UPSTREAM_PORT:-18081}"
SELAHFLOW_DOMAIN="${SELAHFLOW_DOMAIN:-selahflow.livenagain.com}"
VERIFY_GATEWAY_PORT="${VERIFY_GATEWAY_PORT:-80}"

# ---------- 其他 ----------
TIMESTAMP="$(date '+%Y%m%d%H%M%S')"
TMP_TAR="/tmp/selahflow_dist_${TIMESTAMP}.tar.gz"

SSH_OPTS=(-i "${SSH_KEY}" -p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new)
SCP_OPTS=(-i "${SSH_KEY}" -P "${SSH_PORT}" -o StrictHostKeyChecking=accept-new)
REMOTE="${REMOTE_USER}@${REMOTE_HOST}"

echo "==> [1/5] 本地构建 frontend"
cd "${FRONTEND_DIR}"
# 确保部署到 selahflow.livenagain.com 根路径，清除 VITE_DEPLOY_BASE
unset VITE_DEPLOY_BASE
export VITE_DEPLOY_BASE=""
pnpm install
pnpm build

if [[ ! -d "${DIST_DIR}" ]]; then
  echo "ERROR: dist 目录不存在：${DIST_DIR}"
  exit 1
fi

echo "==> [2/5] 打包 dist"
tar -C "${DIST_DIR}" -czf "${TMP_TAR}" .

echo "==> [3/5] 上传产物到服务器"
scp "${SCP_OPTS[@]}" "${TMP_TAR}" "${REMOTE}:/tmp/"

echo "==> [4/5] 远程解压到部署目录"
ssh "${SSH_OPTS[@]}" "${REMOTE}" "mkdir -p '${REMOTE_DEPLOY_DIR}' && tar -xzf '/tmp/$(basename "${TMP_TAR}")' -C '${REMOTE_DEPLOY_DIR}' && rm -f '/tmp/$(basename "${TMP_TAR}")'"

echo "==> [5/5] 启动/重建 SelahFlow 静态容器"
ssh "${SSH_OPTS[@]}" "${REMOTE}" "docker rm -f '${SELAHFLOW_CONTAINER_NAME}' >/dev/null 2>&1 || true && docker run -d --name '${SELAHFLOW_CONTAINER_NAME}' -p '${SELAHFLOW_UPSTREAM_PORT}:80' -v '${REMOTE_DEPLOY_DIR}:/usr/share/nginx/html:ro' nginx:alpine >/dev/null"

echo
echo "部署完成（仅 SelahFlow 服务）。建议执行以下验证："
echo "  ssh -i '${SSH_KEY}' -p ${SSH_PORT} ${REMOTE} \"docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'\""
echo "  ssh -i '${SSH_KEY}' -p ${SSH_PORT} ${REMOTE} \"curl -I http://127.0.0.1:${SELAHFLOW_UPSTREAM_PORT}\""
echo "  ssh -i '${SSH_KEY}' -p ${SSH_PORT} ${REMOTE} \"curl -s -H 'Host: ${SELAHFLOW_DOMAIN}' http://127.0.0.1:${VERIFY_GATEWAY_PORT} | grep -i '<title>'\""

