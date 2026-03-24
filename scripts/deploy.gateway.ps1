# =========================
# SelahFlow 一键构建 + 部署（仅 SelahFlow 服务）- PowerShell 版本
# =========================
# 用法：
#   powershell -ExecutionPolicy Bypass -File scripts\deploy.gateway.ps1
#
# 可通过环境变量覆盖默认值，例如：
#   $env:REMOTE_HOST="1.2.3.4"; $env:REMOTE_USER="lvg"; .\scripts\deploy.gateway.ps1

# ---------- 本地配置 ----------
$REPO_ROOT = Split-Path -Parent $PSScriptRoot
$FRONTEND_DIR = Join-Path $REPO_ROOT "frontend"
$DIST_DIR = Join-Path $FRONTEND_DIR "dist"

# ---------- 远程连接配置 ----------
$REMOTE_USER = if ($env:REMOTE_USER) { $env:REMOTE_USER } else { "lvg" }
$REMOTE_HOST = if ($env:REMOTE_HOST) { $env:REMOTE_HOST } else { "101.33.118.75" }
$SSH_PORT = if ($env:SSH_PORT) { $env:SSH_PORT } else { "22" }
$SSH_KEY = if ($env:SSH_KEY) { $env:SSH_KEY } else { "$HOME\.ssh\tencent-hk-server.pem" }

# ---------- 远程部署路径 ----------
$REMOTE_DEPLOY_DIR = if ($env:REMOTE_DEPLOY_DIR) { $env:REMOTE_DEPLOY_DIR } else { "/home/lvg/deploy/selahflow/dist" }

# ---------- 容器/域名配置 ----------
$SELAHFLOW_CONTAINER_NAME = if ($env:SELAHFLOW_CONTAINER_NAME) { $env:SELAHFLOW_CONTAINER_NAME } else { "selahflow-web" }
$SELAHFLOW_UPSTREAM_PORT = if ($env:SELAHFLOW_UPSTREAM_PORT) { $env:SELAHFLOW_UPSTREAM_PORT } else { "18081" }
$SELAHFLOW_DOMAIN = if ($env:SELAHFLOW_DOMAIN) { $env:SELAHFLOW_DOMAIN } else { "selahflow.livenagain.com" }
$VERIFY_GATEWAY_PORT = if ($env:VERIFY_GATEWAY_PORT) { $env:VERIFY_GATEWAY_PORT } else { "80" }

# ---------- 其他 ----------
$TIMESTAMP = Get-Date -Format "yyyyMMddHHmmss"
$TMP_TAR = "/tmp/selahflow_dist_${TIMESTAMP}.tar.gz"
$TMP_TAR_WIN = Join-Path $env:TEMP "selahflow_dist_${TIMESTAMP}.tar.gz"

$SSH_OPTS = "-i `"${SSH_KEY}`" -p ${SSH_PORT} -o StrictHostKeyChecking=accept-new"
$REMOTE = "${REMOTE_USER}@${REMOTE_HOST}"

Write-Host "==> [1/5] 本地构建 frontend" -ForegroundColor Cyan
Set-Location $FRONTEND_DIR
# 确保部署到 selahflow.livenagain.com 根路径，清除 VITE_DEPLOY_BASE
$env:VITE_DEPLOY_BASE = ""
pnpm install
pnpm build

if (-not (Test-Path $DIST_DIR)) {
  Write-Host "ERROR: dist 目录不存在：${DIST_DIR}" -ForegroundColor Red
  exit 1
}

Write-Host "`n==> [2/5] 打包 dist" -ForegroundColor Cyan
# 使用 tar 打包（Windows 10+ 自带 tar）
Set-Location $DIST_DIR
tar -czf $TMP_TAR_WIN .

Write-Host "`n==> [3/5] 上传产物到服务器" -ForegroundColor Cyan
# 先上传到服务器 /tmp/ 目录
scp -i $SSH_KEY -P $SSH_PORT -o StrictHostKeyChecking=accept-new $TMP_TAR_WIN "${REMOTE}:/tmp/"

Write-Host "`n==> [4/5] 远程解压到部署目录" -ForegroundColor Cyan
$TAR_FILENAME = Split-Path $TMP_TAR_WIN -Leaf
ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=accept-new $REMOTE "mkdir -p '${REMOTE_DEPLOY_DIR}' && tar -xzf '/tmp/${TAR_FILENAME}' -C '${REMOTE_DEPLOY_DIR}' && rm -f '/tmp/${TAR_FILENAME}'"

Write-Host "`n==> [5/5] 启动/重建 SelahFlow 静态容器" -ForegroundColor Cyan
ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=accept-new $REMOTE "docker rm -f '${SELAHFLOW_CONTAINER_NAME}' >/dev/null 2>&1 || true && docker run -d --name '${SELAHFLOW_CONTAINER_NAME}' -p '${SELAHFLOW_UPSTREAM_PORT}:80' -v '${REMOTE_DEPLOY_DIR}:/usr/share/nginx/html:ro' nginx:alpine >/dev/null"

# 清理本地临时文件
Remove-Item $TMP_TAR_WIN -ErrorAction SilentlyContinue

Write-Host "`n部署完成（仅 SelahFlow 服务）。建议执行以下验证：" -ForegroundColor Green
Write-Host "  ssh -i '${SSH_KEY}' -p ${SSH_PORT} ${REMOTE} `"docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'`""
Write-Host "  ssh -i '${SSH_KEY}' -p ${SSH_PORT} ${REMOTE} `"curl -I http://127.0.0.1:${SELAHFLOW_UPSTREAM_PORT}`""
Write-Host "  ssh -i '${SSH_KEY}' -p ${SSH_PORT} ${REMOTE} `"curl -s -H 'Host: ${SELAHFLOW_DOMAIN}' http://127.0.0.1:${VERIFY_GATEWAY_PORT} | grep -i '<title>'`""
