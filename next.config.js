/** @type {import('next').NextConfig} */
const nextConfig = {
  // 只在构建时使用静态导出，开发模式下禁用
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // 图片优化配置
  images: {
    unoptimized: true, // 静态导出时禁用图片优化
  },

  // 环境变量
  env: {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },

  // 清除 console（生产环境）
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

module.exports = nextConfig;
