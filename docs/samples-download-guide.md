# 钢琴采样文件下载与部署指南

## 下载采样文件

Salamander 钢琴采样文件可以从以下位置下载：

### 方法 1: 从 Tone.js 仓库下载（推荐）

```bash
# 克隆或下载 tonejs 音频仓库
git clone https://github.com/tonejs/audio.git
# 或者直接从 GitHub 下载 zip: https://github.com/tonejs/audio/archive/refs/heads/master.zip

# salamander 钢琴采样位于: audio/salamander/
```

### 方法 2: 从原始来源下载

访问 http://archive.org/details/SalamanderGrandPianoV3 下载完整的无损版本（WAV 格式，体积更大）。

## 需要的文件

从 salamander 目录中复制以下 33 个 mp3 文件：

```
A0.mp3
C1.mp3
Ds1.mp3  (或 D#1.mp3)
Fs1.mp3  (或 F#1.mp3)
A1.mp3
C2.mp3
Ds2.mp3
Fs2.mp3
A2.mp3
C3.mp3
Ds3.mp3
Fs3.mp3
A3.mp3
C4.mp3
Ds4.mp3
Fs4.mp3
A4.mp3
C5.mp3
Ds5.mp3
Fs5.mp3
A5.mp3
C6.mp3
Ds6.mp3
Fs6.mp3
A6.mp3
C7.mp3
Ds7.mp3
Fs7.mp3
A7.mp3
C8.mp3
```

**注意**: 如果文件名是 `D#1.mp3`，请重命名为 `Ds1.mp3`，`F#1.mp3` 重命名为 `Fs1.mp3`，以此类推。

## 部署到你的服务器

### 选项 A: 放在项目 public 目录（简单）

1. 在 `frontend/public/` 下创建目录:
   ```
   frontend/public/samples/salamander/
   ```

2. 将所有 mp3 文件复制到该目录

3. 在 `.env` 文件中设置:
   ```env
   VITE_PIANO_SAMPLE_SOURCE=self-hosted
   ```

### 选项 B: 单独部署到 CDN/对象存储（推荐用于生产）

1. 将所有 mp3 文件上传到你的 CDN 或对象存储（阿里云 OSS、七牛云等）

2. 确保 CORS 设置允许你的域名访问

3. 在 `.env` 文件中设置:
   ```env
   VITE_PIANO_SAMPLE_SOURCE=custom
   VITE_PIANO_SAMPLES_URL=https://your-cdn-domain.com/samples/salamander/
   ```

## 文件大小参考

- MP3 版本 (16-bit, 48kHz): ~150-200MB
- WAV 无损版本: ~1.5GB+

## 验证部署

部署完成后，打开浏览器开发者工具的 Network 面板，访问你的应用，播放一个和弦，确认采样文件是从你的服务器加载的。
