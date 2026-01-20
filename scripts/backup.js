const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CHANGELOG_FILE = path.join(DATA_DIR, 'changelog.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

async function backup() {
  try {
    console.log('📦 开始备份数据...\n');

    // 确保备份目录存在
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // 生成备份文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);

    // 读取当前数据
    console.log('📖 读取数据文件...');
    const data = await fs.readFile(CHANGELOG_FILE, 'utf-8');
    const parsedData = JSON.parse(data);

    // 写入备份文件
    console.log('💾 创建备份文件...');
    await fs.writeFile(backupFile, JSON.stringify(parsedData, null, 2), 'utf-8');

    console.log(`✅ 备份完成！`);
    console.log(`   备份文件: ${backupFile}`);
    console.log(`   版本数量: ${parsedData.versions.length}`);

    // 清理旧备份（保留最近 30 个）
    await cleanOldBackups();

  } catch (error) {
    console.error('❌ 备份失败:', error.message);
    process.exit(1);
  }
}

async function cleanOldBackups() {
  try {
    console.log('\n🧹 清理旧备份...');

    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: parseInt(f.match(/backup-(.+)\.json/)[1]),
      }))
      .sort((a, b) => b.time - a.time);

    // 保留最近 30 个备份
    const keepCount = 30;
    if (backupFiles.length > keepCount) {
      const toDelete = backupFiles.slice(keepCount);

      for (const file of toDelete) {
        await fs.unlink(file.path);
        console.log(`   已删除: ${file.name}`);
      }

      console.log(`✅ 已清理 ${toDelete.length} 个旧备份，保留最近 ${keepCount} 个`);
    } else {
      console.log(`✅ 当前有 ${backupFiles.length} 个备份，无需清理`);
    }

  } catch (error) {
    console.warn('⚠️ 清理旧备份时出错:', error.message);
  }
}

backup();
