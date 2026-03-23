## SelahFlow PWA 部署指南

### 路线 A：公网 HTTPS 域名部署（推荐）
1. 获取 HTTPS 域名与证书（正式用可信证书；过渡可自签 + Cloudflare Tunnel）。
2. 构建前端：`cd frontend && pnpm build`，产物在 `frontend/dist`。
3. 部署静态文件到任意 CDN/静态站（均可）：Cloudflare Pages、Netlify、S3+CloudFront、静态主机等。
4. **重要**：确保托管服务支持 SPA 路由（所有路径回退到 index.html）。
5. 用户安装
   - iOS：用 Safari 打开你的域名 → 分享 → "添加到主屏幕" → 从图标启动。
   - Android：用 Chrome 打开域名，地址栏/菜单出现"安装"或"添加到主屏幕"；安装后全屏独立图标。
   - 桌面端：Chrome/Edge 地址栏右侧会出现安装图标。
6. 更新：重新构建+部署即可，PWA 会 autoUpdate；如遇旧缓存，可提示刷新或卸载重装。

### 路线 B：无公网，临时/内网分享
1. 本地构建：`cd frontend && pnpm build`。
2. 启动静态 HTTPS 服务器（需证书，PWA 要求 HTTPS）：
   ```bash
   pnpm dlx http-server dist -S -C "C:/path/cert.pem" -K "C:/path/key.pem" -a 0.0.0.0 -p 4173
   ```
   - 若只需 http 内网测试（无 PWA 安装）：`pnpm preview --host --port 4173`。
   - 可用 ngrok / Cloudflare Tunnel 暴露本地 4173，获得临时公网 https 链接。
3. 用户安装
   - 手机同一 Wi‑Fi 访问 `https://<你的IP或隧道域>:4173`，在线加载一次后"添加到主屏幕/安装"。
4. 说明：隧道地址变动会视为新来源；适合临时分享，不适合长期分发。

### 钢琴采样部署选项

默认使用 Tone.js 官方采样源。如需自托管：

1. 运行采样下载脚本（见 [scripts/README.md](scripts/README.md)）
2. 在构建前设置环境变量：
   ```env
   VITE_PIANO_SAMPLE_SOURCE=self-hosted
   ```
3. 采样文件会包含在 `dist/samples/salamander/` 中

或使用自定义 CDN：
```env
VITE_PIANO_SAMPLE_SOURCE=custom
VITE_PIANO_SAMPLES_URL=https://your-cdn.com/samples/salamander/
```

### 离线能力说明
- 和弦解析已前端化，无需后端。
- PWA 缓存页面壳；钢琴采样按需缓存，首次播放后离线可播放已下载的音符。
- 首次访问必须在线以安装缓存；更新后如看不到新界面，清理站点数据或卸载旧 PWA 再安装。
