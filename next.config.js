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

  // 生产环境优化
  ...(process.env.NODE_ENV === 'production' && {
    // 启用 React 严格模式
    reactStrictMode: true,
    // 压缩代码
    compress: true,
    // 生成静态文件时使用 production 模式
    generateBuildId: () => 'build',
  }),

  // CORS 配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
