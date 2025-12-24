# MusicAgent 工作台

一个面向钢琴伴奏/和声练习的轻量工作台，当前聚焦“和弦工作台”：查询和弦、展示 61 键高亮、即时钢琴采样试听（齐奏/分解）、随机和弦探索。

## 功能概览
- 和弦解析：支持常见三和弦/七和弦/扩展与部分挂留、add、减半等；返回音名、公式、罗马数字（可选 key）。
- 键盘可视化：61 键（C2–C7）SVG 键盘，高亮和弦音，支持点击任意键播放。
- 试听：真实钢琴采样（Tone.js + Salamander），齐奏/分解两种模式。
- 随机和弦：一键生成随机和弦并解析。

## 技术栈
- 前端：Vite + React + TypeScript（pnpm 管理），Tone.js 播放器。
- 后端：FastAPI（uv 管理）。

## 快速启动
1) 安装依赖  
   - 后端：`cd backend && uv sync`  
   - 前端：`cd frontend && pnpm install`
2) 一键启动（Windows PowerShell）：在项目根运行  
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\dev.ps1
   ```
   - 后端默认 http://localhost:8000  
   - 前端默认 http://localhost:5173 （如需自定义，编辑 `dev.ps1` 端口或设置 `VITE_API_BASE`）

若单独启动：  
- 后端：`cd backend && uv run uvicorn app.main:app --reload --port 8000`  
- 前端：`cd frontend && pnpm dev --host --port 5173`

## 目录结构（主要）
- `backend/`：FastAPI 应用（`app/routes/chord.py`，`app/services/chord.py`）。
- `frontend/`：React 前端（`src/App.tsx`、`src/components/` 键盘与选择器，`src/lib/` API & 播放器）。
- `dev.ps1`：一键拉起前后端。

## 后续规划（建议）
- 页面扩展：新增“练习模式”“伴奏型库”“简谱编辑/导出”等页面，可放 `src/pages/` 并加路由。
- 和弦能力：补充更多扩展/替代和弦、转调策略、分布式声部选择（voicing）选项。
- 练习/评分：节拍器、节奏准确度与和弦命中率评分，回放与导出。
- 文件导入/导出：支持 MIDI/ChordPro/MusicXML 导入解析；导出高亮方案或 MIDI 片段。
- 收藏与历史：常用和弦/进行的收藏、最近查询记录。
- 国际化与主题：中/英语言切换，暗色与更多配色方案。

## 环境变量
- `VITE_API_BASE`：前端调用的后端地址（默认 `http://localhost:8000`）。

## 注意
- 数据库迁移、表结构等未涉及；若后续加入存储，请遵守现有规范，避免直接修改迁移文件（按团队约定执行）。

