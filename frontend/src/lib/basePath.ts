// 获取应用的 base path，用于 GitHub Pages 等部署环境
export function getBasePath(): string {
  const base = import.meta.env.BASE_URL || "/";
  console.log(`[DEBUG] getBasePath() = "${base}" (import.meta.env.BASE_URL = "${import.meta.env.BASE_URL}")`);
  return base;
}

// 拼接资源路径
export function assetPath(path: string): string {
  const base = getBasePath();
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // 确保 base 以 / 结尾
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const result = `${normalizedBase}${normalizedPath.slice(1)}`;
  console.log(`[DEBUG] assetPath("${path}") = "${result}" (base="${base}")`);
  return result;
}

// 暴露到 window 用于调试
if (typeof window !== "undefined") {
  (window as any).assetPath = assetPath;
  (window as any).getBasePath = getBasePath;
}
