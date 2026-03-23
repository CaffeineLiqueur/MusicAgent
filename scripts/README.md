# 采样文件下载脚本使用说明

## 快速开始

### Windows 用户（推荐）

在 PowerShell 中运行：

```powershell
cd scripts
powershell -ExecutionPolicy Bypass -File .\download-samples.ps1
```

### Linux/macOS/Git Bash 用户

```bash
cd scripts
./download-samples.sh
```

## 脚本功能

- 自动下载 33 个 Salamander 钢琴采样文件
- 支持断点续传（跳过已下载的文件）
- 显示下载进度和文件大小
- 自动创建目标目录 `frontend/public/samples/salamander/`

## 下载完成后

1. 在 `frontend/` 目录下创建 `.env` 文件：
   ```env
   VITE_PIANO_SAMPLE_SOURCE=self-hosted
   ```

2. 重启开发服务器或重新构建项目

## 自定义选项

### 修改输出目录

**PowerShell:**
```powershell
.\download-samples.ps1 -OutputDir "C:\your\custom\path"
```

**Bash:**
```bash
./download-samples.sh --output-dir "/your/custom/path"
```

### 使用镜像源

如果官方源下载慢，可以修改脚本中的 `BaseUrl` 为其他镜像地址。
