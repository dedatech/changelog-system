# CLAUDE.md - Changelog 系统开发指南

本文档为 Claude Code (claude.ai/code) 提供项目开发指导。

> **项目状态**：一期工程已完成 ✅
> **最后更新**：2026-01-20

---

## 🌟 重要提示

**请使用中文与用户交流**。用户的母语是中文，使用中文沟通可以更清晰地理解需求和解决问题。

---

## 📋 项目概述

这是一个基于 **Next.js 14** 的**静态化 Changelog 发布系统**，专为产品更新日志管理设计。

### 核心特点

- **混合架构**：本地管理后台（端口 3001）+ 静态前台（纯 HTML）
- **静态站点生成**：生产环境使用 `output: 'export'` 生成纯静态文件
- **文件存储**：所有数据存储在 JSON 文件中，无需数据库
- **分离部署**：后台在本地运行，前台部署为静态文件到 Nginx
- **响应式设计**：移动端和桌面端分别优化

### 一期已完成功能 ✅

- ✅ 前台展示（产品切换、版本列表、图片灯箱）
- ✅ 后台管理（版本 CRUD、草稿/发布切换）
- ✅ 用户认证（Cookie 会话管理）
- ✅ 图片管理（上传、选择器、预览）
- ✅ Markdown 编辑器（支持列表和图片）
- ✅ 系统配置（产品管理、站点设置）
- ✅ 自动版本号递增（新建时自动 +1）
- ✅ 双端预览（PC/移动端切换）
- ✅ SSH 自动部署

---

## 🚀 核心开发命令

```bash
# 主要开发命令 - 在端口 3001 同时运行前台和管理后台
npm run dev:backend
# 访问：http://localhost:3001/ (前台), http://localhost:3001/admin (后台)

# 构建生产版本（在 out/ 目录生成静态 HTML）
npm run build

# 一键构建并部署到生产服务器
npm run deploy:full

# 备份数据文件
npm run backup
```

**重要提示**：开发时务必使用 `npm run dev:backend`。开发服务器运行在 3001 端口，同时提供前台展示和管理后台界面，支持热重载。

---

## 📁 项目结构

```
changelogs/
├── app/                     # Next.js App Router
│   ├── admin/              # 后台管理页面
│   │   ├── config/         # 系统配置页面
│   │   ├── edit/[id]/      # 编辑版本页面
│   │   ├── login/          # 登录页面
│   │   ├── new/            # 新建版本页面
│   │   └── page.tsx        # 版本列表页面
│   ├── api/                # API 路由
│   │   ├── auth/           # 认证检查
│   │   ├── config/         # 配置管理
│   │   ├── login/          # 登录接口
│   │   ├── logout/         # 登出接口
│   │   ├── upload/         # 文件上传
│   │   ├── uploads/        # 图片列表
│   │   └── versions/       # 版本 CRUD
│   │       └── latest/     # 获取最新版本号
│   ├── page.tsx            # 前台首页
│   └── layout.tsx          # 根布局
├── components/             # React 组件
│   ├── ChangelogClient.tsx # 前台展示组件
│   ├── ImageLightbox.tsx   # 图片灯箱
│   ├── ImagePicker.tsx     # 图片选择器
│   └── VersionEditor.tsx   # 版本编辑器（含双端预览）
├── lib/                    # 核心逻辑
│   ├── markdown.ts         # Markdown 解析器
│   └── utils.ts            # 工具函数
├── types/                  # TypeScript 类型
│   └── changelog.ts        # 类型定义
├── data/                   # 数据存储
│   ├── changelog.json      # 版本数据
│   └── config.json         # 系统配置
├── public/                 # 静态资源
│   └── uploads/            # 用户上传的图片
├── docs/                   # 文档目录
│   ├── CLAUDE.md           # 本文档
│   ├── DESIGN_SYSTEM.md    # 设计系统规范
│   ├── README.md           # 项目主文档
│   └── ...                 # 其他文档
├── scripts/                # 构建脚本
├── deploy/                 # 部署配置
└── middleware.ts           # Next.js 中间件（登录保护）
```

---

## 🔐 用户认证系统

### 默认账号

- **用户名**：`admin`
- **密码**：`admin123`
- **修改方式**：编辑 `data/config.json` 或在后台配置页面修改

### 认证机制

- 使用 httpOnly Cookie 存储会话（有效期 7 天）
- 所有 `/admin` 路由受中间件保护
- 登录 API：`POST /api/login`
- 登出 API：`POST /api/logout`
- 认证检查：`GET /api/auth/check`

### 中间件保护

`middleware.ts` 自动拦截未登录用户访问 `/admin` 路由，重定向到 `/admin/login`。

---

## 🎨 设计系统规范

### 字体层级系统

| 元素 | Tailwind 类名 | 移动端 | 桌面端 | 字重 |
|------|--------------|--------|--------|------|
| 版本标题 | `text-lg lg:text-xl` | 18px | 20px | `font-bold` |
| 分类标题（特性/优化/修复） | `text-lg lg:text-xl` | 18px | 20px | Normal |
| 一级列表项 | `text-base` | 16px | 16px | Normal |
| 二级列表项 | `text-sm` | 14px | 14px | Normal |

**关键点**：
- 分类标题与版本标题**字号相同**，但**不加粗**
- 前台和后台预览**完全一致**

### 颜色系统

- **主渐变**：`from-purple-600 to-blue-600`
- **标签背景**：`bg-purple-50` + `text-purple-600`
- **文本色**：`text-gray-900`（标题）、`text-gray-700`（正文）

### 布局规范

#### 桌面端（≥1024px）

```
┌─────────────────────────────────────────────┐
│  左侧边栏 (w-40, 160px)    右侧内容         │
│  ┌──────────────┐          ┌──────────────┐ │
│  │ 日期 (粗体)  │          │ 版本标题     │ │
│  │ 版本号 (标签)│          │              │ │
│  └──────────────┘          │ 分类标题     │ │
│                            │ • 一级列表   │ │
│                            │   二级列表   │ │
│                            └──────────────┘ │
└─────────────────────────────────────────────┘
```

#### 移动端（<1024px）

```
┌─────────────────────────────────────────────┐
│  v1.0.2: 添加图片功能                       │
│  2026年01月19日                             │
│                                             │
│  分类标题                                   │
│  • 一级列表                                 │
│    二级列表                                 │
└─────────────────────────────────────────────┘
```

完整设计规范见：[docs/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## 📝 Markdown 编辑器规范

### 支持的语法

```markdown
## 特性
- 新功能描述
  - 子项详情（缩进2个空格）

## 优化
- 性能优化点

## 修复
- 修复的问题
```

### 关键限制

`parseMarkdown()` 函数**只解析列表项**（以 `-` 或 `*` 开头的行）。

**图片必须在列表项内**：
```markdown
- ✅ 正确：功能描述 ![图片](/uploads/file.jpg)
- ❌ 错误：功能描述（图片在列表外）
```

### 自动列表延续

在编辑器中按 **Enter** 键时：
- 如果光标在列表项中，自动添加下一行的 `-` 符号
- 如果当前行只有 `-`，按 Enter 清除该行（退出列表）

---

## 🔄 数据流转

### 发布流程

1. **创建版本** → 保存为 `status: 'draft'`
2. **编辑内容** → 实时预览（PC/移动切换）
3. **点击发布** → 更新为 `status: 'published'`
4. **前台显示** → 只展示 `status: 'published'` 的版本
5. **构建部署** → `npm run build && npm run deploy`

### 产品配置

在 `data/config.json` 中配置：

```json
{
  "products": [
    {
      "id": "ide",
      "name": "IDE",
      "label": "IDE",
      "enabled": true,
      "icon": "💻",
      "order": 1
    }
  ]
}
```

- **单产品模式**：只有一个 `enabled: true` 的产品时，前台不显示产品标签
- **多产品模式**：多个产品时，前台显示产品切换标签

---

## 🔧 关键功能实现

### 自动版本号递增

**新建版本时**：
1. 先选择产品
2. 自动调用 `GET /api/versions/latest?product=IDE`
3. 返回该产品最新版本号 +1
4. 填充到版本号输入框
5. 用户可手动修改

**示例**：
- IDE 最新版本：1.0.1 → 新建时默认：1.0.2
- 无历史版本 → 默认：1.0.0

### 双端预览

后台编辑器支持 PC/移动端切换：
- **PC 模式**：左右布局，左侧日期+版本，右侧内容
- **移动模式**：垂直布局，显示在手机边框内（375px × 750px）

切换按钮位于预览区域右上角。

### 图片管理

1. **上传**：`POST /api/upload` → 保存到 `public/uploads/`
2. **选择**：点击"📷 选择图片"按钮 → 打开图片选择器
3. **插入**：自动在光标位置插入 `![alt](url)`
4. **预览**：前台点击图片可放大查看

---

## 🌐 API 路由

### 版本管理

- `GET /api/versions?id={id}` - 获取单个版本
- `GET /api/versions?includeDrafts=true` - 获取所有版本（后台用）
- `POST /api/versions` - 创建版本
- `PUT /api/versions?id={id}` - 更新版本（支持部分更新）
- `DELETE /api/versions?id={id}` - 删除版本
- `GET /api/versions/latest?product={name}` - 获取最新版本号

### 认证

- `POST /api/login` - 登录
- `POST /api/logout` - 登出
- `GET /api/auth/check` - 检查登录状态

### 文件管理

- `POST /api/upload` - 上传图片/视频
- `GET /api/uploads` - 获取已上传图片列表

### 配置

- `GET /api/config` - 获取系统配置
- `PUT /api/config` - 更新系统配置

**部分更新**：更新状态时只发送 `{status: 'published'}`，不发送完整对象。

---

## ⚙️ 配置管理

### 系统配置

`data/config.json` 包含：
- **站点信息**：title, description, domain, logo
- **产品配置**：products 数组
- **显示设置**：itemsPerPage, dateFormat
- **管理员账号**：username, password

### 环境变量

`.env.local` 文件（不提交到 Git）：
```bash
DEPLOY_HOST=your-server.com
DEPLOY_USER=username
DEPLOY_PASSWORD=your-password
```

### Next.js 配置

`next.config.js` 关键配置：
```javascript
{
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: { unoptimized: true }
}
```

---

## 🐛 常见问题

### 开发问题

1. **图片无法保存** → 图片必须在列表项中（`- 文字 ![img](url)`）
2. **前台看不到更改** → 前台只显示 `status: 'published'` 的版本
3. **产品类型不匹配** → 版本的 `product` 字段必须匹配配置产品的 `name`（不是 `id` 或 `label`）
4. **草稿丢失** → 后台使用 `/api/versions?includeDrafts=true`

### 部署问题

1. **静态导出限制** → 生产环境无 API 路由，禁用图片优化
2. **Cookie 不工作** → 静态导出模式下无法使用 Cookie（开发环境正常）
3. **构建失败** → 检查 Node.js 版本（推荐 18+）

---

## 📦 数据类型

核心类型定义在 `types/changelog.ts`：

```typescript
type ProductType = 'IDE' | 'JetBrains' | 'CLI';
type VersionStatus = 'draft' | 'published';

interface Version {
  id: string;
  version: string;          // 如 "1.0.2"
  product: ProductType;
  title: string;
  status: VersionStatus;
  publishDate: string;      // ISO 8601 格式
  updates: UpdateGroup[];
}

interface UpdateGroup {
  id: string;
  category: 'feature' | 'improvement' | 'fix';
  items: ListItem[];
}

interface ListItem {
  id: string;
  text: string;             // 支持 Markdown 图片语法
  children?: ListItem[];    // 嵌套子项
}
```

---

## 🎯 开发规范

### 组件开发

- **前台组件**：`ChangelogClient.tsx`（客户端组件）
- **后台组件**：`VersionEditor.tsx`（客户端组件）
- **布局一致**：前台和后台预览使用相同的设计规范

### 样式规范

- 使用 Tailwind CSS 工具类
- 响应式断点：`sm` (640px)、`lg` (1024px)
- 颜色使用语义化类名（如 `text-gray-900`）
- 圆角统一：`rounded-lg` (8px)、`rounded-2xl` (16px)

### 代码规范

- 使用 TypeScript 类型注解
- 组件使用函数式 + Hooks
- API 路由使用异步函数
- 错误处理使用 try-catch

---

## 📚 相关文档

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - 完整设计系统规范
- **[README.md](./README.md)** - 项目主文档
- **[QUICKSTART.md](./QUICKSTART.md)** - 快速开始指南
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 部署指南
- **[ADMIN_DESIGN.md](./ADMIN_DESIGN.md)** - 后台设计文档

---

## 🔄 后续迭代建议

### 二期功能规划

- [ ] 版本搜索和过滤
- [ ] RSS 订阅支持
- [ ] 版本对比功能
- [ ] 导出 PDF/Markdown
- [ ] 多语言支持（i18n）
- [ ] 评论系统
- [ ] 版本标签（如 "重要更新"、"Bug 修复"）
- [ ] 版本归档功能
- [ ] 统计分析（访问量、下载量）

### 技术优化

- [ ] 单元测试覆盖
- [ ] E2E 测试（Playwright）
- [ ] 性能优化（图片懒加载、代码分割）
- [ ] SEO 优化（结构化数据、sitemap）
- [ ] CI/CD 自动化

---

## 📝 更新日志

- **2026-01-20**: 一期工程完成
  - 完成所有核心功能
  - 整理设计系统规范
  - 优化双端预览
  - 实现自动版本号递增
  - 清理冗余代码和文档
