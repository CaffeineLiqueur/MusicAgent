import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <text x="50%" y="58%" text-anchor="middle" font-size="220" fill="#ffffff" font-family="Segoe UI, sans-serif">M</text>
</svg>
`.trim();
const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString("base64")}`;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useHttps = env.VITE_DEV_HTTPS === "1" || env.VITE_DEV_HTTPS?.toLowerCase() === "true";
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000";

  let https: boolean | { key: Buffer; cert: Buffer } | undefined;
  if (useHttps) {
    const keyPath = env.VITE_SSL_KEY;
    const certPath = env.VITE_SSL_CERT;
    if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
    } else {
      https = true; // 自签或自动证书；若要指定文件请提供 VITE_SSL_KEY/VITE_SSL_CERT
    }
  }

  // 生产默认根路径：子域名 selahflow.livenagain.com
  // 子路径/GitHub Pages：构建前设置 VITE_DEPLOY_BASE=/selahflow/ 或 /MusicAgent/
  const normalizeBase = (p: string) => {
    const withSlash = p.startsWith("/") ? p : `/${p}`;
    return withSlash.endsWith("/") ? withSlash : `${withSlash}/`;
  };
  const base =
    mode === "development"
      ? "/"
      : env.VITE_DEPLOY_BASE
        ? normalizeBase(env.VITE_DEPLOY_BASE)
        : "/";

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [],
        manifest: {
          name: "SelahFlow",
          short_name: "SelahFlow",
          start_url: base,
          scope: base,
          display: "standalone",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          icons: [
            {
              src: svgDataUrl,
              sizes: "192x192",
              type: "image/svg+xml"
            },
            {
              src: svgDataUrl,
              sizes: "512x512",
              type: "image/svg+xml"
            },
            {
              src: svgDataUrl,
              sizes: "180x180",
              type: "image/svg+xml",
              purpose: "any"
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.destination === "image" && url.origin === self.location.origin,
              handler: "CacheFirst",
              options: {
                cacheName: "app-images",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            },
            {
              urlPattern: /^https:\/\/tonejs\.github\.io\/audio\/salamander\/.*\.(mp3|wav)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "instrument-samples",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: ({ request, url }) =>
                request.destination === "audio" && url.pathname.includes("/samples/"),
              handler: "CacheFirst",
              options: {
                cacheName: "instrument-samples",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            }
          ]
        }
      })
    ],
    server: {
      port: 5173,
      host: "0.0.0.0",
      https,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});

