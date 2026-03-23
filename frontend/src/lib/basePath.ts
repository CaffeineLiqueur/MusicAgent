// 获取应用的 base path，用于 GitHub Pages 等部署环境
export function getBasePath(): string {
  // 从 import.meta.env.BASE_URL 获取 Vite 配置的 base
  return import.meta.env.BASE_URL || "/";
}

// 拼接资源路径
export function assetPath(path: string): string {
  const base = getBasePath();
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // 确保 base 以 / 结尾
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${normalizedPath.slice(1)}`;
}
