module.exports = {
  // 服务器连接信息
  server: {
    host: process.env.DEPLOY_HOST || 'your-server.com',
    port: parseInt(process.env.DEPLOY_PORT) || 22,
    username: process.env.DEPLOY_USER || 'username',
    password: process.env.DEPLOY_PASSWORD,
    // 或使用私钥认证（推荐）：
    // privateKey: require('fs').readFileSync(process.env.DEPLOY_KEY_PATH || '/path/to/private/key'),
    // passphrase: process.env.DEPLOY_KEY_PASSPHRASE, // 如果私钥有密码
  },

  // 路径配置
  path: {
    local: './out',              // 本地构建目录
    remote: '/var/www/changelog', // 服务器目标目录
  },

  // 部署选项
  options: {
    // 清空远程目录后再上传（可选）
    cleanRemote: false,

    // 排除的文件/目录
    exclude: [],

    // 上传前执行的命令（服务器端）
    beforeUpload: [
      'mkdir -p /var/www/changelog',
      'chmod -R 755 /var/www/changelog',
    ],

    // 上传后执行的命令（服务器端）
    afterUpload: [
      'chmod -R 755 /var/www/changelog',
      'chown -R www-data:www-data /var/www/changelog',
      // 如果需要重启 Nginx（通常不需要）：
      // 'systemctl reload nginx',
    ],
  },
};
