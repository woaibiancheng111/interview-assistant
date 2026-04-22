import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/interview-assistant",
  assetPrefix: '/interview-assistant/',
  // 可选：禁用图片优化（静态导出必须关）
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
