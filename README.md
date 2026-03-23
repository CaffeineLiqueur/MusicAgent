# SelahFlow (MusicAgent)

一个面向钢琴伴奏/和声练习的轻量工作台，当前聚焦"和弦工作台"：查询和弦、展示 61 键高亮、即时钢琴采样试听（齐奏/分解）、随机和弦探索。

## 功能概览
- 和弦解析：支持常见三和弦/七和弦/扩展与部分挂留、add、减半等；返回音名、公式、罗马数字（可选 key）。
- 键盘可视化：61 键（C2–C7）SVG 键盘，高亮和弦音，支持点击任意键播放。
- 试听：真实钢琴采样（Tone.js + Salamander），齐奏/分解两种模式，支持钢琴/吉他切换。
- 随机和弦：一键生成随机和弦并解析。
- 节拍器：内置节拍器工具。
- PWA：支持离线使用，可安装到主屏幕。

## 技术栈
- 前端：Vite + React + TypeScript（pnpm 管理），Tone.js 播放器。
- 后端：FastAPI（uv 管理）- 可选，当前和弦解析已前端化。

## 快速启动

### 前置准备
1. 安装依赖
   - 后端：`cd backend && uv sync`
   - 前端：`cd frontend && pnpm install`

2. （可选）下载钢琴采样文件到本地（推荐用于离线使用）
   ```powershell
   # Windows
   cd scripts
   powershell -ExecutionPolicy Bypass -File .\download-samples.ps1

   # Linux/macOS
   cd scripts
   ./download-samples.sh
   ```
   下载完成后，在 `frontend/.env` 中设置：
   ```env
   VITE_PIANO_SAMPLE_SOURCE=self-hosted
   ```

### 启动开发
一键启动（Windows PowerShell）：在项目根运行
```powershell
powershell -ExecutionPolicy Bypass -File .\dev.ps1
```
- 后端默认 http://localhost:8000
- 前端默认 http://localhost:5173

若单独启动：
- 后端：`cd backend && uv run uvicorn app.main:app --reload --port 8000`
- 前端：`cd frontend && pnpm dev --host --port 5173`

## 目录结构（主要）
- `backend/`：FastAPI 应用（`app/routes/chord.py`，`app/services/chord.py`）。
- `frontend/`：React 前端
  - `src/App.tsx`：主应用
  - `src/components/`：键盘与 UI 组件
  - `src/lib/`：和弦解析、播放器逻辑
  - `public/samples/salamander/`：自托管钢琴采样（可选）
- `scripts/`：采样文件下载脚本
- `docs/`：额外文档
- `dev.ps1`：一键拉起前后端。

## 钢琴采样配置

项目支持三种采样源配置（通过 `frontend/.env` 设置）：

- `official`：使用 Tone.js 官方源（默认，无需下载）
- `self-hosted`：使用本地自托管采样（需运行下载脚本）
- `custom`：使用自定义 CDN 源

详见 [docs/samples-download-guide.md](docs/samples-download-guide.md) 和 [scripts/README.md](scripts/README.md)。

## 部署

支持 GitHub Pages、Vercel、Netlify 等多种部署方式。详见 [DEPLOY.md](DEPLOY.md)。

## 后续规划（建议）
- 页面扩展：新增"练习模式""伴奏型库""简谱编辑/导出"等页面，可放 `src/pages/` 并加路由。
- 和弦能力：补充更多扩展/替代和弦、转调策略、分布式声部选择（voicing）选项。
- 练习/评分：节拍器、节奏准确度与和弦命中率评分，回放与导出。
- 文件导入/导出：支持 MIDI/ChordPro/MusicXML 导入解析；导出高亮方案或 MIDI 片段。
- 收藏与历史：常用和弦/进行的收藏、最近查询记录。
- 国际化与主题：中/英语言切换，暗色与更多配色方案。

## 环境变量
- `VITE_API_BASE`：前端调用的后端地址（默认 `http://localhost:8000`）。
- `VITE_PIANO_SAMPLE_SOURCE`：钢琴采样源（official/self-hosted/custom）。
- `VITE_PIANO_SAMPLES_URL`：自定义采样源 URL。
- `VITE_DEV_HTTPS`：启用 HTTPS 开发服务器（1 启用）。
- `VITE_SSL_KEY` / `VITE_SSL_CERT`：SSL 证书路径。

## 注意
- 和弦解析已前端化（`frontend/src/lib/chordLocal.ts`），后端可选。
- 数据库迁移、表结构等未涉及；若后续加入存储，请遵守现有规范，避免直接修改迁移文件（按团队约定执行）。

## PWA 与移动端调试
- 前端已接入 PWA（service worker + manifest）；iOS 音频会在用户首次点击播放时自动解锁。
- 移动端需横屏使用以获得完整体验。
- 本地手机调试需 https：可在 `frontend/.env.local` 中设置 `VITE_DEV_HTTPS=1`，并提供 `VITE_SSL_CERT`/`VITE_SSL_KEY`（自签证书）。Vite dev server 已监听 `0.0.0.0`，手机同局域网访问 `https://<电脑IP>:5173`。
- 采样文件采用 runtime cache，首次播放会下载并缓存；缓存上限默认 14 天、最多 200 项。
