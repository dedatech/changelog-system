# Changelog 发布系统架构设计（基于 Next.js）

## 一、系统概述

一个基于 **Next.js** 的轻量级 Changelog 发布系统，采用**纯静态部署**架构。后台管理系统在本地运行，编辑完成后生成纯静态 HTML 文件，通过 SSH 自动部署到 Nginx 服务器。

### 核心特点
- ✅ **纯静态部署**: 生产环境只需 Nginx，零服务器依赖
- ✅ **本地管理**: 后台管理在本地运行，安全且无需服务器端
- ✅ **一键构建部署**: Next.js SSG + SSH 自动部署
- ✅ **完美响应式**: 移动优先设计，支持所有设备
- ✅ **现代化技术栈**: Next.js 14 + React + TypeScript

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端框架** | Next.js 14 | React 框架，支持 SSG |
| **开发语言** | TypeScript | 类型安全 |
| **样式方案** | Tailwind CSS | 实用优先的 CSS 框架 |
| **富文本编辑** | TipTap | 基于 ProseMirror 的现代编辑器 |
| **数据存储** | JSON 文件 | 本地文件存储 |
| **部署方式** | SSH/SFTP | 自动部署到 Nginx |
| **生产环境** | Nginx | 纯静态文件托管 |

### 2.2 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     开发环境（本地电脑）                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Next.js 开发服务器 (npm run dev)                 │    │
│  │  - 后台管理页面 (/admin)                                 │    │
│  │  - API Routes (/api/*)                                   │    │
│  │  - 富文本编辑器                                          │    │
│  │  - 文件上传                                              │    │
│  └────────────────────┬────────────────────────────────────┘    │
│                       │                                         │
│                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              数据存储 (本地文件)                         │    │
│  │  - data/changelog.json (版本数据)                        │    │
│  │  - data/config.json (系统配置)                           │    │
│  │  - data/assets/ (图片、视频等资源)                       │    │
│  └────────────────────┬────────────────────────────────────┘    │
│                       │                                         │
│                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Next.js 构建系统 (npm run build)                 │    │
│  │  - 读取 JSON 数据                                        │    │
│  │  - 生成静态 HTML (SSG)                                   │    │
│  │  - 优化资源 (图片、CSS、JS)                              │    │
│  │  - 输出到 out/ 目录                                      │    │
│  └────────────────────┬────────────────────────────────────┘    │
│                       │                                         │
│                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │      SSH 部署系统 (npm run deploy)                       │    │
│  │  - 连接到远程服务器                                      │    │
│  │  - 上传 out/ 目录到 Nginx                                │    │
│  │  - 执行部署后命令                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ SSH 上传
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   生产环境（Nginx 服务器）                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Nginx 静态文件托管                          │    │
│  │  /var/www/changelog/                                    │    │
│  │  ├── index.html              ← 版本列表页                │    │
│  │  ├── version/                ← 版本详情页                │    │
│  │  │   ├── v1.2.0.html                                    │    │
│  │  │   └── ...                                            │    │
│  │  ├── _next/                  ← Next.js 生成的资源        │    │
│  │  ├── assets/                 ← 图片、视频等资源          │    │
│  │  └── ...                                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                       △                                         │
│                       │                                         │
│              ┌─────────────────┐                               │
│              │   用户访问       │                               │
│              └─────────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、项目目录结构

```
changelog-system/
├── app/                       # Next.js App Router
│   ├── admin/                 # 后台管理界面
│   │   ├── page.tsx           # 后台首页
│   │   ├── new/               # 新建版本
│   │   ├── edit/              # 编辑版本
│   │   │   └── [id]/page.tsx
│   │   └── layout.tsx         # 后台布局
│   ├── api/                   # API Routes
│   │   ├── versions/          # 版本管理 API
│   │   │   ├── route.ts       # GET, POST
│   │   │   └── [id]/          # GET, PUT, DELETE
│   │   ├── upload/            # 文件上传 API
│   │   │   └── route.ts
│   │   └── build/             # 构建触发 API
│   │       └── route.ts
│   ├── version/               # 版本详情页（前台）
│   │   └── [id]/page.tsx
│   ├── page.tsx               # 首页（版本列表）
│   ├── layout.tsx             # 根布局
│   └── globals.css            # 全局样式
│
├── components/                # React 组件
│   ├── admin/                 # 后台组件
│   │   ├── VersionList.tsx    # 版本列表
│   │   ├── VersionEditor.tsx  # 版本编辑器
│   │   ├── RichTextEditor.tsx # 富文本编辑器
│   │   ├── FileUpload.tsx     # 文件上传
│   │   └── AssetManager.tsx   # 资源管理
│   ├── frontend/              # 前台组件
│   │   ├── VersionCard.tsx    # 版本卡片
│   │   ├── FilterBar.tsx      # 筛选栏
│   │   ├── SearchBox.tsx      # 搜索框
│   │   └── Pagination.tsx     # 分页组件
│   └── ui/                    # 通用 UI 组件
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
│
├── lib/                       # 核心逻辑
│   ├── data.ts                # 数据管理（JSON 读写）
│   ├── builder.ts             # 静态页面构建
│   ├── assets.ts              # 资源管理
│   ├── search.ts              # 搜索索引
│   └── utils.ts               # 工具函数
│
├── data/                      # 数据存储
│   ├── changelog.json         # 版本数据
│   ├── config.json            # 系统配置
│   └── assets/                # 上传的资源
│       ├── images/
│       └── videos/
│
├── public/                    # 静态资源
│   ├── logo.png
│   └── favicon.ico
│
├── styles/                    # 样式文件
│   └── globals.css
│
├── deploy/                    # 部署相关
│   ├── deploy.config.js       # 部署配置
│   └── nginx.conf             # Nginx 配置示例
│
├── scripts/                   # 构建脚本
│   ├── deploy-ssh.js          # SSH 部署脚本
│   └── backup.js              # 备份脚本
│
├── types/                     # TypeScript 类型
│   ├── changelog.ts           # 版本数据类型
│   └── config.ts              # 配置类型
│
├── .env.local                 # 环境变量（不提交）
├── next.config.js             # Next.js 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
├── package.json               # 项目配置
├── docs/
│   ├── ARCHITECTURE.md            # 架构设计文档
│   ├── DEVELOPMENT_PLAN.md        # 开发规划文档
│   └── README.md                  # 项目说明
```

---

## 四、数据结构设计

### 4.1 changelog.json 数据结构

```json
{
  "versions": [
    {
      "id": "v1.2.0",
      "version": "1.2.0",
      "type": "feature",
      "title": "新增用户管理模块",
      "description": "本次更新新增了完整的用户管理功能...",
      "content": "<div>富文本内容...</div>",
      "author": "张三",
      "publishDate": "2026-01-19T10:00:00+08:00",
      "status": "published",
      "tags": ["feature", "admin", "user"],
      "attachments": [
        {
          "type": "image",
          "url": "/assets/images/screenshot.png",
          "thumbnail": "/assets/images/screenshot-thumb.png",
          "size": 245600
        }
      ],
      "metadata": {
        "seoTitle": "",
        "seoDescription": "",
        "featured": false
      },
      "stats": {
        "views": 128,
        "likes": 5
      }
    }
  ],
  "pagination": {
    "total": 10,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 4.2 config.json 配置结构

```json
{
  "site": {
    "title": "Changelog 发布系统",
    "description": "产品更新日志",
    "domain": "https://changelog.yourdomain.com",
    "logo": "/logo.png"
  },
  "editor": {
    "toolbar": ["bold", "italic", "heading", "bulletList", "image", "video"],
    "uploadPath": "/data/assets/",
    "maxFileSize": 10485760
  },
  "build": {
    "outputDir": "./out",
    "generateRSS": true,
    "minify": true
  },
  "display": {
    "itemsPerPage": 10,
    "dateFormat": "YYYY-MM-DD",
    "enableSearch": true,
    "enableTags": true
  }
}
```

---

## 五、Next.js 配置

### 5.1 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 输出为纯静态 HTML
  output: 'export',

  // 图片优化配置
  images: {
    unoptimized: true, // 静态导出时禁用图片优化
  },

  // 构建输出目录
  distDir: 'out',

  // 环境变量
  env: {
    SITE_URL: process.env.SITE_URL,
  },
};

module.exports = nextConfig;
```

### 5.2 TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolve": {
      "alias": {
        "@": "."
      }
    },
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## 六、SSH 部署配置

### 6.1 部署配置文件

**`deploy/deploy.config.js`**:

```javascript
module.exports = {
  server: {
    host: process.env.DEPLOY_HOST,
    port: parseInt(process.env.DEPLOY_PORT) || 22,
    username: process.env.DEPLOY_USER,
    password: process.env.DEPLOY_PASSWORD,
    // 或使用私钥：
    // privateKey: require('fs').readFileSync(process.env.DEPLOY_KEY_PATH),
  },
  path: {
    local: './out',
    remote: '/var/www/changelog',
  },
  options: {
    cleanRemote: true,
    beforeUpload: [
      'mkdir -p /var/www/changelog',
    ],
    afterUpload: [
      'chmod -R 755 /var/www/changelog',
      'chown -R www-data:www-data /var/www/changelog',
    ],
  },
};
```

### 6.2 环境变量

**`.env.local`** (不提交到 Git):

```bash
DEPLOY_HOST=your-server.com
DEPLOY_PORT=22
DEPLOY_USER=username
DEPLOY_PASSWORD=your-password
```

### 6.3 Nginx 配置

**服务器端 `/etc/nginx/sites-available/changelog`**:

```nginx
server {
    listen 80;
    server_name changelog.yourdomain.com;
    root /var/www/changelog;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript;
}
```

---

## 七、响应式设计

### 7.1 断点系统

| 断点 | 屏幕宽度 | 设备类型 |
|------|----------|----------|
| `sm` | 640px+ | 手机横屏 |
| `md` | 768px+ | 平板 |
| `lg` | 1024px+ | 桌面 |
| `xl` | 1280px+ | 大屏 |

### 7.2 移动端优化

- 触摸优化（按钮最小 44x44px）
- 图片懒加载
- 响应式图片（自动选择合适尺寸）
- 手势支持（滑动、缩放）
- 代码块横向滚动

---

## 八、工作流程

### 8.1 开发流程

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问后台管理
http://localhost:3000/admin
```

### 8.2 构建流程

```bash
# 1. 构建静态页面
npm run build

# 2. 预览构建结果
npm run start

# 构建输出：
# - out/index.html
# - out/version/*.html
# - out/_next/static/
# - out/assets/
```

### 8.3 部署流程

```bash
# 一键构建并部署
npm run deploy:full

# 或分步执行
npm run build    # 构建
npm run deploy   # 部署
```

---

## 九、技术优势

### Next.js 优势

| 特性 | 优势 |
|------|------|
| **SSG** | 生成纯静态 HTML，SEO 友好 |
| **App Router** | 文件路由自动生成，开发效率高 |
| **Image 组件** | 自动图片优化，响应式图片 |
| **TypeScript** | 类型安全，减少错误 |
| **组件化** | 代码复用，易于维护 |
| **生态完善** | 丰富的组件库和工具 |

### 部署优势

| 特性 | 说明 |
|------|------|
| **纯静态** | 生产环境只需 Nginx |
| **SSH 自动部署** | 一键上传，无需手动操作 |
| **零服务器依赖** | 无需 Node.js、PHP 等运行时 |
| **CDN 友好** | 可部署到任何静态托管 |

---

## 十、安全性

1. **后台本地运行** - 不暴露到公网
2. **SSH 密钥认证** - 比密码更安全
3. **环境变量** - 敏感信息不提交到代码
4. **XSS 防护** - 富文本内容过滤
5. **文件类型限制** - 只允许安全的文件类型

---

## 十一、性能优化

1. **静态页面** - 极快的加载速度
2. **图片优化** - 自动压缩和格式转换
3. **代码分割** - 自动分割 JS 代码
4. **Gzip 压缩** - Nginx 自动压缩
5. **浏览器缓存** - 静态资源长期缓存

---

**总结**: 基于 Next.js 的纯静态部署方案，结合 SSH 自动部署，提供了开发效率、性能和安全的最佳平衡。
