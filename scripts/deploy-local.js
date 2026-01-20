const fs = require('fs-extra');
const path = require('path');

// 本地部署配置
const config = {
  source: path.resolve(__dirname, '../out'),
  target: path.resolve(__dirname, '../dist-local'),
};

async function deployLocal() {
  console.log('🚀 本地部署模式\n');

  try {
    // 确保源目录存在
    if (!fs.existsSync(config.source)) {
      throw new Error(`构建目录不存在: ${config.source}\n请先运行: npm run build`);
    }

    console.log('📂 开始复制文件...');
    console.log(`   源: ${config.source}`);
    console.log(`   目标: ${config.target}\n`);

    // 清空目标目录
    if (fs.existsSync(config.target)) {
      await fs.remove(config.target);
      console.log('🗑️ 已清空目标目录');
    }

    // 复制文件
    await fs.copy(config.source, config.target);

    console.log('✅ 部署成功！\n');
    console.log('🌐 本地预览方式：');
    console.log('   1. 使用任意静态服务器，例如：');
    console.log(`      npx serve ${config.target}`);
    console.log('   2. 或配置 Nginx 指向该目录\n');
    console.log(`📁 部署目录: ${config.target}`);

  } catch (err) {
    console.error('❌ 部署失败:', err.message);
    process.exit(1);
  }
}

deployLocal();
