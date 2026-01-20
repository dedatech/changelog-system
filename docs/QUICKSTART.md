# Changelog 发布系统 - 快速开始指南

## 一、系统特点

这是一款**纯静态部署**的 Changelog 发布系统：
- 📱 **完美支持移动端** - 响应式设计，手机、平板、电脑都能完美浏览
- 🚀 **纯静态部署** - 生产环境只需 Nginx，零服务器依赖
- 💻 **本地管理** - 后台管理在本地运行，安全高效
- 🎨 **富文本编辑** - 支持图文、视频、代码高亮等多种格式
- ⚡ **一键构建** - 自动生成所有静态页面和资源

## 二、部署架构对比

### 传统方案 vs 本方案

| 对比项 | 传统方案 | 本方案 |
|--------|---------|--------|
| **生产环境** | Nginx + Node.js + PHP/Python | 仅需 Nginx ✅ |
| **服务器配置** | 需要 Node.js 运行时 | 不需要任何运行时 ✅ |
| **后台管理** | 在线管理，暴露到公网 | 本地管理，更安全 ✅ |
| **部署成本** | 需要云服务器 | 可用静态托管 ✅ |
| **性能** | 需要服务器处理 | 纯静态，极速访问 ✅ |
| **移动端** | 需额外适配 | 原生响应式 ✅ |

## 三、使用流程

### 1. 本地开发环境

```bash
# 安装依赖
npm install

# 启动本地后台管理系统
npm run dev

# 浏览器访问后台
http://localhost:3000/admin
```

### 2. 编辑和发布内容

1. 登录后台管理系统
2. 点击"新建版本"
3. 填写版本信息（版本号、标题、类型）
4. 使用富文本编辑器编写内容
   - 插入图片
   - 插入视频
   - 插入代码块
   - 格式化文本
5. 上传相关资源文件
6. 预览效果
7. 保存/发布

### 3. 构建静态页面

```bash
# 一键构建所有静态页面
npm run build

# 构建完成后，dist/ 目录包含：
# - index.html (首页)
# - version/*.html (所有版本详情页)
# - page/*.html (分页页面)
# - assets/ (所有静态资源)
# - css/ (样式文件)
# - js/ (前端脚本)
```

### 4. 部署到 Nginx

#### 方式 A: FTP/SFTP 自动部署

```bash
# 配置 deploy/deploy.config.js
module.exports = {
  host: 'your-server.com',
  port: 21,
  user: 'username',
  password: 'password',
  remotePath: '/var/www/changelog'
};

# 执行部署
npm run deploy:ftp
```

#### 方式 B: Git 推送部署

```bash
# 初始化 Git 仓库
git init
git add dist/
git commit -m "Deploy changelog"

# 推送到服务器
git push origin main
```

#### 方式 C: 手动部署

```bash
# 将 dist/ 目录上传到服务器
scp -r dist/* user@server:/var/www/changelog/
```

## 四、Nginx 配置

### 基础配置

```nginx
server {
    listen 80;
    server_name changelog.yourdomain.com;
    root /var/www/changelog;
    index index.html;

    # 纯静态文件托管
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### HTTPS 配置（推荐）

```nginx
server {
    listen 443 ssl http2;
    server_name changelog.yourdomain.com;

    # SSL 证书（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/changelog.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/changelog.yourdomain.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置同上...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name changelog.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 五、移动端访问

系统采用**移动优先**的响应式设计，自动适配所有设备：

### 设备支持

| 设备类型 | 分辨率 | 布局特点 |
|---------|--------|---------|
| 手机竖屏 | < 576px | 单列布局，汉堡菜单 |
| 手机横屏 | 576px - 767px | 优化的卡片布局 |
| 平板 | 768px - 991px | 两列布局，侧边栏 |
| 桌面 | > 992px | 多列布局，完整功能 |

### 移动端特性

- ✅ 触摸优化（按钮最小 44x44px）
- ✅ 图片懒加载（节省流量）
- ✅ 响应式图片（自动选择合适尺寸）
- ✅ 手势支持（滑动切换、图片缩放）
- ✅ 视频自适应（支持移动端播放）
- ✅ 代码块横向滚动

## 六、部署方案示例

### 方案 1: 传统 VPS + Nginx

**适用场景**: 有自己的服务器

**步骤**:
1. 购买 VPS（阿里云、腾讯云等）
2. 安装 Nginx: `apt install nginx`
3. 复制 dist/ 目录到 `/var/www/changelog`
4. 配置 Nginx（参考上面的配置）
5. 重启 Nginx: `systemctl restart nginx`

**成本**: 约 ¥50-200/年

---

### 方案 2: GitHub Pages

**适用场景**: 免费托管，无服务器需求

**步骤**:
1. 创建 GitHub 仓库
2. 推送 dist/ 目录到仓库
3. 在仓库设置中启用 GitHub Pages
4. 访问 `https://username.github.io/repo-name`

**成本**: 免费

**限制**: 无后台管理（需本地构建）

---

### 方案 3: Vercel / Netlify

**适用场景**: 免费托管，自动部署

**步骤**:
1. 连接 Git 仓库
2. 配置构建命令: `npm run build`
3. 配置输出目录: `dist`
4. 自动部署

**成本**: 免费（有限额）

---

### 方案 4: 对象存储 + CDN

**适用场景**: 高流量，需要 CDN 加速

**步骤**:
1. 上传 dist/ 到阿里云 OSS / 腾讯云 COS
2. 配置静态网站托管
3. 绑定自定义域名
4. 启用 CDN 加速

**成本**: 极低（按流量计费）

## 七、常见问题

### Q1: 后台管理系统必须一直运行吗？

**A**: 不需要。后台只在本地编辑内容时使用，编辑完成后构建静态文件即可关闭。

### Q2: 如何多人协作管理内容？

**A**:
- 方案 A: 共享 data/ 目录（使用 Git 或网盘）
- 方案 B: 使用 Git 管理 changelog.json
- 方案 C: 升级到在线编辑版本（需要服务器）

### Q3: 生产环境如何更新内容？

**A**:
1. 在本地编辑新内容
2. 运行 `npm run build` 构建静态页面
3. 运行 `npm run deploy` 部署到服务器
4. 完成！无需重启任何服务

### Q4: 备份数据有多简单？

**A**:
```bash
# 一键备份
npm run backup

# 备份文件保存在 data/backups/ 目录
# 只需备份 data/ 目录即可
```

### Q5: 可以迁移到其他平台吗？

**A**: 完全可以！
- 数据是纯 JSON 格式，易于迁移
- 静态 HTML 可以部署到任何支持静态托管的地方
- 没有数据库依赖，迁移非常简单

## 八、性能优化建议

### 1. 启用 Gzip 压缩
已经在 Nginx 配置中包含，可将文件大小减少 60-80%

### 2. 使用 CDN
推荐使用阿里云 CDN、腾讯云 CDN 或 Cloudflare

### 3. 图片优化
- 使用 WebP 格式（体积减少 25-35%）
- 实现响应式图片（自动选择合适尺寸）
- 启用懒加载（减少初始加载）

### 4. 浏览器缓存
已在 Nginx 配置中包含，静态资源缓存 1 年

### 5. 预期性能指标
- **首次加载**: < 2s (4G 网络)
- **页面切换**: < 500ms
- **Lighthouse 评分**: > 90 分

## 九、下一步

1. **安装依赖**: `npm install`
2. **启动开发**: `npm run dev`
3. **创建第一篇日志**: 访问 http://localhost:3000/admin
4. **构建部署**: `npm run build && npm run deploy`

---

**需要帮助?** 查看 `docs/DEVELOPMENT_PLAN.md` 了解详细的开发规划
