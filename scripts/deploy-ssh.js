const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
const config = require('../deploy/deploy.config');

async function deploy() {
  const sftp = new SftpClient();

  try {
    console.log('🔗 连接到服务器...');
    console.log(`   主机: ${config.server.host}`);
    console.log(`   用户: ${config.server.username}`);
    console.log(`   端口: ${config.server.port}`);

    await sftp.connect(config.server);
    console.log('✅ 连接成功！\n');

    // 执行上传前的命令
    if (config.options.beforeUpload && config.options.beforeUpload.length > 0) {
      console.log('⚙️ 执行上传前命令...');
      for (const cmd of config.options.beforeUpload) {
        console.log(`   $ ${cmd}`);
        await sftp.exec(cmd);
      }
      console.log('✅ 上传前命令执行完成\n');
    }

    // 清空远程目录（可选）
    if (config.options.cleanRemote) {
      console.log('🗑️ 清空远程目录...');
      try {
        await sftp.rmdir(config.path.remote, true);
        console.log('✅ 远程目录已清空\n');
      } catch (err) {
        console.log('⚠️ 目录不存在或无法清空，将直接上传\n');
      }
    }

    // 上传文件
    const localDir = path.resolve(config.path.local);

    // 检查本地目录是否存在
    if (!fs.existsSync(localDir)) {
      throw new Error(`本地目录不存在: ${localDir}`);
    }

    console.log('📤 开始上传文件...');
    console.log(`   本地: ${localDir}`);
    console.log(`   远程: ${config.path.remote}`);
    console.log();

    await sftp.uploadDir(localDir, config.path.remote, {
      recursive: true,
      validate: true,
      exclude: config.options.exclude || [],
    });

    console.log('✅ 文件上传完成！\n');

    // 执行上传后的命令
    if (config.options.afterUpload && config.options.afterUpload.length > 0) {
      console.log('⚙️ 执行上传后命令...');
      for (const cmd of config.options.afterUpload) {
        console.log(`   $ ${cmd}`);
        await sftp.exec(cmd);
      }
      console.log('✅ 上传后命令执行完成\n');
    }

    console.log('🎉 部署成功！');
    console.log(`🌐 访问: http://${config.server.host}`);

  } catch (err) {
    console.error('❌ 部署失败:', err.message);
    if (err.code === 'ENOTFOUND') {
      console.error('   无法解析服务器地址，请检查 DEPLOY_HOST 配置');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   连接被拒绝，请检查 SSH 服务是否运行');
    } else if (err.code === 'EAUTH') {
      console.error('   认证失败，请检查用户名和密码');
    }
    process.exit(1);
  } finally {
    await sftp.end();
  }
}

// 检查环境变量
if (!process.env.DEPLOY_HOST && config.server.host === 'your-server.com') {
  console.error('❌ 错误: 请先配置环境变量');
  console.error('');
  console.error('请创建 .env.local 文件并配置以下变量：');
  console.error('  DEPLOY_HOST=your-server.com');
  console.error('  DEPLOY_USER=username');
  console.error('  DEPLOY_PASSWORD=your-password');
  console.error('');
  console.error('或者使用 SSH 密钥：');
  console.error('  DEPLOY_HOST=your-server.com');
  console.error('  DEPLOY_USER=username');
  console.error('  DEPLOY_KEY_PATH=/path/to/private/key');
  process.exit(1);
}

deploy();
