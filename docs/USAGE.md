# 使用说明

## 系统架构

本系统采用**前后台分离**的架构：

- **前台（访客页面）**：纯静态 HTML，数据在构建时嵌入，无需 API
- **后台（管理页面）**：动态服务，包含管理界面和 API

---

## 正确的启动方式

### 方式一：一键启动（推荐）

```bash
npm run dev:both
```

这会自动启动：
- 后台服务（3001端口）：管理界面 + API
- 前台服务（3000端口）：静态文件展示

---

### 方式二：分别启动

需要**两个终端窗口**：

**终端1 - 启动后台：**
```bash
npm run dev:backend
```
- ✅ Next.js 开发服务器（端口3001）
- ✅ 管理界面：http://localhost:3001/admin
- ✅ API 路由：http://localhost:3001/api/*

**终端2 - 启动前台：**
```bash
# 先构建（仅第一次或修改数据后）
npm run build

# 启动前台
npm run dev:frontend
```
- ✅ 静态文件服务（端口3000）
- ✅ 展示页面：http://localhost:3000

---

## 重要说明

### ✅ 前台是纯静态的

- **不需要 API**：数据在构建时直接嵌入 HTML
- **无需后台运行**：前台可以独立部署到任何静态服务器
- **无 CORS 问题**：所有数据都在页面中

### ⚠️ 每次修改数据需重新构建

```bash
# 1. 在后台编辑并保存版本
# 访问 http://localhost:3001/admin

# 2. 重新构建前台
npm run build

# 3. 前台自动更新（如果正在运行）
```

---

## 开发流程

### 1. 编辑内容

```bash
# 启动后台
npm run dev:backend

# 访问管理界面
# http://localhost:3001/admin

# 创建/编辑版本并保存
```

### 2. 重新构建

```bash
# 每次修改数据后都需要重新构建
npm run build
```

### 3. 预览效果

```bash
# 启动前台（如果还没启动）
npm run dev:frontend

# 访问
# http://localhost:3000
```

### 4. 本地部署

```bash
# 完整的构建 + 部署流程
npm run deploy:local:full

# 预览部署结果
npm run preview
```

---

## 常见问题

### ❌ 保存失败/无法创建版本

**原因：使用了错误的前台启动命令**

错误方式：
```bash
npm run dev:frontend  # ❌ 这只是静态文件，没有API！
```

正确方式：
```bash
npm run dev:backend   # ✅ 这才是完整的服务器！
```

**或者使用一键启动：**
```bash
npm run dev:both      # ✅ 自动启动前后台
```

### ❌ 前台显示目录列表

**原因：没有先构建静态文件**

解决方式：
```bash
npm run build          # 构建静态文件到 out/
npm run dev:frontend   # 然后启动前台服务
```

### ❌ 前台数据不是最新的

**原因：修改数据后没有重新构建**

解决方式：
```bash
npm run build          # 重新构建（嵌入最新数据）
```

---

## API 测试

后台 API 仅用于管理界面，测试方法：

```bash
# 1. 启动后台
npm run dev:backend

# 2. 运行测试
npm run test:api
```

这会测试：GET、POST、PUT、DELETE 操作

---

## 端口说明

| 端口 | 服务 | 说明 | API |
|------|------|------|-----|
| 3000 | 前台 | 静态展示页面（访客访问）| ❌ 不需要 |
| 3001 | 后台 | 管理界面 + API（编辑使用）| ✅ 有 |

---

## 环境变量配置

`.env.local` 文件：

```bash
# API 地址（仅管理后台需要）
NEXT_PUBLIC_API_URL=http://localhost:3001

# 前台不需要此配置（数据已嵌入）
```

---

## 快速开始

```bash
# 1. 一键启动（最简单）
npm run dev:both

# 2. 访问后台管理
# http://localhost:3001/admin

# 3. 编辑并保存版本

# 4. 重新构建
npm run build

# 5. 前台自动更新
# http://localhost:3000
```

---

## 部署到生产

```bash
# 1. 编辑完所有版本

# 2. 构建静态文件
npm run build

# 3. 部署到服务器
npm run deploy

# 或本地部署
npm run deploy:local
```

---

## 目录结构

```
changelogs/
├── app/
│   ├── page.tsx          # 前台展示页（服务端组件，数据嵌入）
│   ├── admin/            # 后台管理页（客户端组件，调用API）
│   └── api/              # API 路由（仅后台使用）
├── components/
│   └── ChangelogClient.tsx  # 前台客户端组件
├── data/
│   └── changelog.json    # 数据存储
├── out/                  # 构建输出（纯静态HTML）
└── dist-local/           # 本地部署输出
```
