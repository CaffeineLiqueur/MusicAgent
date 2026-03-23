#!/bin/bash
# 钢琴采样文件下载脚本 (Bash - Linux/macOS/Git Bash)
# 下载 Salamander 钢琴采样文件到 frontend/public/samples/salamander/

set -e

# 默认配置
OUTPUT_DIR="../frontend/public/samples/salamander"
BASE_URL="https://tonejs.github.io/audio/salamander"

# 需要下载的文件列表
files=(
    "A0.mp3"
    "C1.mp3" "Ds1.mp3" "Fs1.mp3" "A1.mp3"
    "C2.mp3" "Ds2.mp3" "Fs2.mp3" "A2.mp3"
    "C3.mp3" "Ds3.mp3" "Fs3.mp3" "A3.mp3"
    "C4.mp3" "Ds4.mp3" "Fs4.mp3" "A4.mp3"
    "C5.mp3" "Ds5.mp3" "Fs5.mp3" "A5.mp3"
    "C6.mp3" "Ds6.mp3" "Fs6.mp3" "A6.mp3"
    "C7.mp3" "Ds7.mp3" "Fs7.mp3" "A7.mp3"
    "C8.mp3"
)

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 创建输出目录
FULL_OUTPUT_DIR="$SCRIPT_DIR/$OUTPUT_DIR"
mkdir -p "$FULL_OUTPUT_DIR"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Salamander 钢琴采样文件下载工具${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${GRAY}  源: $BASE_URL${NC}"
echo -e "${GRAY}  目标: $FULL_OUTPUT_DIR${NC}"
echo -e "${GRAY}  文件数量: ${#files[@]}${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

success_count=0
skip_count=0
fail_count=0

for file in "${files[@]}"; do
    url="$BASE_URL/$file"
    dest="$FULL_OUTPUT_DIR/$file"

    if [ -f "$dest" ]; then
        filesize=$(du -k "$dest" | cut -f1)
        echo -e "${YELLOW}[跳过]${NC} $file 已存在 (${filesize} KB)"
        skip_count=$((skip_count + 1))
        continue
    fi

    echo -ne "[下载] $file..."

    if command -v curl &> /dev/null; then
        # 使用 curl
        if curl -L -s -f -o "$dest" "$url" 2>/dev/null; then
            filesize=$(du -k "$dest" | cut -f1 2>/dev/null || echo "?")
            echo -e " ${GREEN}完成 (${filesize} KB)${NC}"
            success_count=$((success_count + 1))
        else
            echo -e " ${RED}失败${NC}"
            fail_count=$((fail_count + 1))
            rm -f "$dest" 2>/dev/null
        fi
    elif command -v wget &> /dev/null; then
        # 使用 wget
        if wget -q -O "$dest" "$url" 2>/dev/null; then
            filesize=$(du -k "$dest" | cut -f1 2>/dev/null || echo "?")
            echo -e " ${GREEN}完成 (${filesize} KB)${NC}"
            success_count=$((success_count + 1))
        else
            echo -e " ${RED}失败${NC}"
            fail_count=$((fail_count + 1))
            rm -f "$dest" 2>/dev/null
        fi
    else
        echo -e " ${RED}错误: 需要 curl 或 wget${NC}"
        exit 1
    fi
done

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  下载完成${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}  成功: $success_count${NC}"
echo -e "${YELLOW}  跳过: $skip_count${NC}"
if [ $fail_count -gt 0 ]; then
    echo -e "${RED}  失败: $fail_count${NC}"
else
    echo -e "${GRAY}  失败: $fail_count${NC}"
fi
echo -e "${CYAN}========================================${NC}"

if [ $fail_count -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}部分文件下载失败，请重新运行脚本继续下载。${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}下一步: 在 .env 文件中设置 VITE_PIANO_SAMPLE_SOURCE=self-hosted${NC}"
