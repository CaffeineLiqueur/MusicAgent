# SelahFlow 部署与 Gateway Nginx 重构说明

本文档记录本次在服务器上完成的部署与网关重构，目标是让两个项目通过同一个入口进行域名分流：

- `livenagain.com` / `www.livenagain.com` -> 人生模拟器
- `selahflow.livenagain.com` -> SelahFlow（本仓库）

---

## 1. 背景与目标

服务器原先处于多容器多端口状态，外部请求与容器端口之间关系不清晰。  
本次改造采用 **统一 Gateway Nginx** 的方式，做到：

1. 对外入口统一（80 端口）
2. 按域名（Host）分流到不同上游服务
3. 保持主站可用，同时新增 SelahFlow 子域名
4. 降低后续接入 HTTPS 和运维复杂度

---

## 2. 最终架构

```text
Internet (HTTP :80)
        |
        v
gateway-nginx (host:80 -> container:80)
   |                                   |
   | Host: livenagain.com              | Host: selahflow.livenagain.com
   v                                   v
host.docker.internal:5173              host.docker.internal:18081
(人生模拟器 web)                        (selahflow-web 容器映射端口)
```

说明：

- `gateway-nginx` 是唯一对外 HTTP 入口。
- `selahflow-web` 仅负责静态文件服务，不直接承担外部域名分流。
- 主站保留原上游（`5173`），通过 gateway 继续访问。

---

## 3. 前端构建与产物上传

在本地仓库执行：

```bash
cd frontend
pnpm install
pnpm build
```

产物位于 `frontend/dist`。上传到服务器：

```bash
scp -i ~/.ssh/tencent-hk-server.pem -r frontend/dist/* lvg@101.33.118.75:~/deploy/selahflow/dist/
```

服务器检查：

```bash
ls -la ~/deploy/selahflow/dist
```

应包含 `index.html`、`assets/`、`icons/`、`sw.js`、`manifest.webmanifest` 等文件。

---

## 4. SelahFlow 容器（静态站）启动

```bash
docker rm -f selahflow-web >/dev/null 2>&1 || true

docker run -d \
  --name selahflow-web \
  -p 18081:80 \
  -v /home/lvg/deploy/selahflow/dist:/usr/share/nginx/html:ro \
  nginx:alpine
```

验证：

```bash
curl -I http://127.0.0.1:18081
```

---

## 5. Gateway Nginx 配置（统一入口）

配置文件路径（服务器）：

- `/home/lvg/gateway-nginx/conf.d/default.conf`

示例配置：

```nginx
server {
    listen 80;
    server_name livenagain.com www.livenagain.com;

    location / {
        proxy_pass http://host.docker.internal:5173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name selahflow.livenagain.com;

    location / {
        proxy_pass http://host.docker.internal:18081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启动 gateway：

```bash
docker rm -f gateway-nginx >/dev/null 2>&1 || true

docker run -d \
  --name gateway-nginx \
  --add-host=host.docker.internal:host-gateway \
  -p 80:80 \
  -v /home/lvg/gateway-nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

---

## 6. 验证清单

### 6.1 容器与端口

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

至少应看到：

- `gateway-nginx`：`0.0.0.0:80->80/tcp`
- `selahflow-web`：`0.0.0.0:18081->80/tcp`

### 6.2 网关配置语法

```bash
docker exec gateway-nginx nginx -t
```

### 6.3 按 Host 验证分流

```bash
curl -s -H "Host: livenagain.com" http://127.0.0.1 | grep -i "<title>"
curl -s -H "Host: selahflow.livenagain.com" http://127.0.0.1 | grep -i "<title>"
```

预期：

- 主站返回人生模拟器标题
- 子域返回 `SelahFlow`

---

## 7. 常见问题与排查

### 问题 1：`/etc/nginx/conf.d` 不存在

原因：宿主机未安装 Nginx，Nginx 运行在 Docker 容器内。  
处理：改容器配置或使用专门的 `gateway-nginx` 容器。

### 问题 2：外部访问子域仍是主站内容

原因：公网请求没有经过新 gateway，或 gateway 未按 Host 分流。  
排查：

```bash
curl -I http://selahflow.livenagain.com
docker logs --tail=100 gateway-nginx
```

### 问题 3：`bind: address already in use`

原因：80 端口被其他进程占用。  
排查：

```bash
sudo ss -tlnp | grep ':80 '
```

---

## 8. 回滚方案

若发布后异常，可快速回滚：

```bash
docker rm -f gateway-nginx
```

如果此前有旧入口（宿主机 nginx 或其他网关），恢复旧服务即可：

```bash
sudo systemctl start nginx 2>/dev/null || true
```

---

## 9. 后续建议

1. 将 80 入口升级为 443（HTTPS），提升安全性与 PWA 兼容性。
2. 将 gateway 与上游容器编排写入 `docker-compose.yml`，避免手工命令漂移。
3. 配置健康检查与日志轮转，便于长期运维。
4. 在 CI/CD 中加入构建、上传、重启网关的自动化流程。

---

## 10. 本次改造结论

本次部署已经完成以下核心目标：

- SelahFlow 成功上传并可被网关访问
- 两个项目统一由 `gateway-nginx` 进行域名分流
- 主站与 SelahFlow 可并存且互不影响

后续只需在统一网关层扩展新子域，即可持续接入更多项目。
