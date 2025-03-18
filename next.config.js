const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': path.resolve(__dirname, 'lib'),
    };
    return config;
  },
  // 添加 TypeScript 配置
  typescript: {
    // 暂时忽略类型错误
    ignoreBuildErrors: true,
  },
  // 禁用 ESLint 检查
  eslint: {
    // 暂时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 使用支持的配置选项
  output: 'standalone',  // 优化输出
  poweredByHeader: false, // 移除 X-Powered-By 头
  reactStrictMode: true,  // 使用严格模式
};

module.exports = nextConfig; 