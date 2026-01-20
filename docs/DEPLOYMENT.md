# 生产环境部署说明

## 核心概念

### ✅ 正式环境 = 静态文件目录

```
生产服务器
├── /var/www/changelog/    ← 这就是"正式环境"
│   ├── index.html
│   ├── 404.html
│   ├── _next/             ← 静态资源（JS/CSS/图片）
│   └── admin.html         ← 可选：后台管理页面
└── Nginx/Apache/任意Web服务器配置指向这个目录
```

**就这么简单！** 不需要：
- ❌ Node.js 运行时
- ❌ 数据库
- ❌ 后端服务器
- ❌ API 接口

---

## 部署过程 = 文件替换

### 本地开发环境

```bash
changelogs/
├── data/changelog.json    ← 编辑这里
├── out/                   ← 构建生成
│   ├── index.html
│   ├── _next/
│   └── ...
└── scripts/
```

### 构建流程

```bash
npm run build
```

将 `data/changelog.json` 中的数据嵌入到 HTML，生成静态文件到 `out/`

### 部署流程

```bash
# 方式1：SSH上传
npm run deploy

# 方式2：手动复制
scp -r out/* user@server:/var/www/changelog/
```

**本质就是：** 用新的 `out/` 目录内容替换服务器上的旧文件

---

## Web服务器配置

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name changelog.yourdomain.com;
    root /var/www/changelog;

    # 首页
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

### Apache 配置示例

```apache
<VirtualHost *:80>
    ServerName changelog.yourdomain.com
    DocumentRoot /var/www/changelog

    <Directory /var/www/changelog>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]

        # 缓存静态资源
        <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico)$">
            Header set Cache-Control "max-age=31536000, public"
        </FilesMatch>
    </Directory>
</VirtualHost>
```

### 其他选择

- ✅ Caddy（自动HTTPS）
- ✅ Netlify（拖拽部署）
- ✅ Vercel
- ✅ GitHub Pages
- ✅ 任何支持静态文件的CDN
- ✅ 甚至对象存储（OSS/S3）+ 静态网站托管

---

## 部署方式对比

### 方式1：SSH自动部署（推荐）

```bash
# 配置 .env.local
DEPLOY_HOST=your-server.com
DEPLOY_USER=username
DEPLOY_PASSWORD=password

# 一键部署
npm run deploy:full
```

**优点：**
- 自动化
- 可重复
- 包含备份、清理等步骤

### 方式2：手动上传

```bash
# 构建
npm run build

# 上传（多种方式）
scp -r out/* user@server:/var/www/changelog/
# 或
rsync -avz out/ user@server:/var/www/changelog/
# 或
ftp/sftp 手动上传
```

**优点：**
- 简单直接
- 不需要配置SSH脚本
- 适合不熟悉命令行的用户

### 方式3：CI/CD 自动化

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run build
      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/changelog
```

**优点：**
- 推送代码自动部署
- 适合团队协作
- 可回滚

---

## 文件结构说明

### out/ 目录结构

```
out/
├── index.html              ← 首页（包含所有已发布版本的数据）
├── 404.html               ← 404页面
├── admin.html             ← 管理页面（可选，生产环境可删除）
├── _next/                 ← Next.js生成的静态资源
│   ├── static/            ← 不会变的资源（哈希命名）
│   │   ├── css/
│   │   ├── js/
│   │   └── chunks/
│   └── ...                ← 页面特定的资源
└── ...                    ← 其他HTML文件
```

**重要文件：**
- `index.html` - 这是主文件，包含所有数据！
- `_next/static/` - 静态资源，浏览器会缓存

---

## 部署策略

### 完整替换（最简单）

```bash
# 清空服务器目录
rm -rf /var/www/changelog/*

# 上传新文件
scp -r out/* user@server:/var/www/changelog/
```

**优点：**
- 简单
- 不会有旧文件残留

**缺点：**
- 瞬间清空，可能有短暂404

---

### 增量更新（推荐）

```bash
# 只覆盖变化的文件
rsync -avz --delete out/ user@server:/var/www/changelog/
```

**优点：**
- 更快
- 更平滑

**缺点：**
- 需要rsync工具

---

### 原子部署（最安全）

```bash
# 1. 上传到新目录
scp -r out/* user@server:/var/www/changelog-new/

# 2. 切换目录（瞬间完成）
ssh user@server "mv /var/www/changelog /var/www/changelog-old && mv /var/www/changelog-new /var/www/changelog"

# 3. 确认无误后删除旧目录
ssh user@server "rm -rf /var/www/changelog-old"
```

**优点：**
- 可以快速回滚
- 零停机时间

---

## 实际部署示例

### 示例1：个人博客部署

```bash
# 1. 本地编辑
npm run dev:backend
# 访问 http://localhost:3001/admin
# 编辑版本并保存

# 2. 构建
npm run build

# 3. 部署到VPS
npm run deploy:full

# 4. 完成！
# 访问 https://changelog.yourdomain.com
```

### 示例2：企业内部服务器

```bash
# 1. 构建
npm run build

# 2. 打包
cd out
tar -czf changelog.tar.gz *

# 3. 传给运维团队
# changelog.tar.gz → 运维 → 部署到内网服务器
```

### 示例3：Netlify/Vercel等平台

```bash
# 1. 构建
npm run build

# 2. 直接拖拽 out/ 目录到Netlify
# 或连接Git仓库自动部署
```

---

## 版本回滚

### 如果发现问题怎么办？

**方式1：保留旧版本**
```bash
# 部署前备份
ssh user@server "cp -r /var/www/changelog /var/www/changelog.backup"

# 出问题直接恢复
ssh user@server "rm -rf /var/www/changelog && mv /var/www/changelog.backup /var/www/changelog"
```

**方式2：使用Git**
```bash
# 每次部署打标签
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0

# 回滚到上个版本
git checkout v1.1.0
npm run build
npm run deploy
```

**方式3：本地保留历史**
```bash
# 本地保留每次构建的文件
mkdir -p releases
cp -r out/ releases/changelog-$(date +%Y%m%d-%H%M%S)/
```

---

## 性能优化

### 1. 启用Gzip压缩

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. 静态资源缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用CDN

将 `_next/static/` 目录上传到CDN，修改HTML中的资源路径

### 4. 预加载关键资源

在 `index.html` 的 `<head>` 中添加：
```html
<link rel="preload" href="/_next/static/css/main.css" as="style">
<link rel="preload" href="/_next/static/js/main.js" as="script">
```

---

## 安全建议

### 1. 删除后台页面（生产环境）

```bash
# 部署前删除
rm out/admin.html
rm out/admin/
```

### 2. 禁用目录浏览

```nginx
autoindex off;
```

### 3. 限制敏感文件访问

```nginx
location ~ /\.(git|env) {
    deny all;
}
```

### 4. 使用HTTPS

```bash
# Let's Encrypt 免费 SSL
certbot --nginx -d changelog.yourdomain.com
```

---

## 总结

### 核心理解

✅ **生产环境 = 静态HTML文件**
✅ **部署 = 文件替换/覆盖**
✅ **Web服务器 = Nginx/Apache/任意静态服务器**
✅ **无需运行时 = 不需要Node.js/数据库**

### 完整流程

```
本地编辑 → 构建 → 上传 → 替换文件 → 完成
data.json  → out/  → SCP  → /var/www → ✅
```

### 部署就是

```bash
# 新文件覆盖旧文件
rm -rf /var/www/changelog/*
cp -r out/* /var/www/changelog/
```

就这么简单！
