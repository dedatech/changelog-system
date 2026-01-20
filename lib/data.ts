import fs from 'fs/promises';
import path from 'path';
import { Version, ChangelogData } from '@/types/changelog';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHANGELOG_FILE = path.join(DATA_DIR, 'changelog.json');

/**
 * 读取所有版本数据
 */
export async function getVersions(product?: string): Promise<Version[]> {
  try {
    const data = await readFile<ChangelogData>(CHANGELOG_FILE);
    let versions = data.versions;

    // 只返回已发布的版本
    versions = versions.filter((v) => v.status === 'published');

    // 按产品类型筛选
    if (product) {
      versions = versions.filter((v) => v.product === product);
    }

    // 按发布日期降序排列
    return versions.sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  } catch (error) {
    console.error('Error reading versions:', error);
    return [];
  }
}

/**
 * 获取单个版本
 */
export async function getVersion(id: string): Promise<Version | null> {
  try {
    const data = await readFile<ChangelogData>(CHANGELOG_FILE);
    return data.versions.find((v) => v.id === id) || null;
  } catch (error) {
    console.error('Error reading version:', error);
    return null;
  }
}

/**
 * 获取所有版本（包括草稿）
 */
export async function getAllVersions(): Promise<Version[]> {
  try {
    const data = await readFile<ChangelogData>(CHANGELOG_FILE);
    return data.versions.sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  } catch (error) {
    console.error('Error reading all versions:', error);
    return [];
  }
}

/**
 * 创建新版本
 */
export async function createVersion(versionData: Omit<Version, 'id' | 'publishDate'>): Promise<Version> {
  const data = await readFile<ChangelogData>(CHANGELOG_FILE);

  const newVersion: Version = {
    ...versionData,
    id: `v${versionData.version}`,
    publishDate: new Date().toISOString(),
  };

  data.versions.unshift(newVersion);
  await writeFile(CHANGELOG_FILE, data);
  return newVersion;
}

/**
 * 更新版本
 */
export async function updateVersion(id: string, updates: Partial<Version>): Promise<Version | null> {
  const data = await readFile<ChangelogData>(CHANGELOG_FILE);
  const index = data.versions.findIndex((v) => v.id === id);

  if (index === -1) {
    return null;
  }

  data.versions[index] = {
    ...data.versions[index],
    ...updates,
  };

  await writeFile(CHANGELOG_FILE, data);
  return data.versions[index];
}

/**
 * 删除版本
 */
export async function deleteVersion(id: string): Promise<boolean> {
  const data = await readFile<ChangelogData>(CHANGELOG_FILE);
  const index = data.versions.findIndex((v) => v.id === id);

  if (index === -1) {
    return false;
  }

  data.versions.splice(index, 1);
  await writeFile(CHANGELOG_FILE, data);
  return true;
}

/**
 * 通用读取文件函数
 */
async function readFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 通用写入文件函数
 */
async function writeFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 备份数据
 */
export async function backupData(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(DATA_DIR, 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  await fs.mkdir(backupDir, { recursive: true });
  const data = await readFile<ChangelogData>(CHANGELOG_FILE);
  await writeFile(backupFile, data);

  return backupFile;
}

/**
 * 获取所有产品类型
 */
export async function getProducts(): Promise<string[]> {
  const versions = await getAllVersions();
  const products = new Set(versions.map((v) => v.product));
  return Array.from(products);
}

/**
 * 获取系统配置
 */
export async function getConfig() {
  const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
  try {
    return await readFile<Config>(CONFIG_FILE);
  } catch (error) {
    console.error('Error reading config:', error);
    // 返回默认配置
    return {
      site: {
        title: 'Changelog',
        description: '持续改进，不断进化',
        domain: '',
        logo: '/logo.png',
      },
      products: [],
      display: {
        itemsPerPage: 10,
        dateFormat: 'YYYY-MM-DD',
      },
    };
  }
}

/**
 * 保存系统配置
 */
export async function saveConfig(config: Config): Promise<void> {
  const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
  await writeFile(CONFIG_FILE, config);
}

// 配置类型定义
export type Config = {
  site: {
    title: string;
    description: string;
    domain: string;
    logo: string;
  };
  products: Array<{
    id: string;
    name: string;
    label: string;
    enabled: boolean;
    icon?: string;
    order: number;
  }>;
  display: {
    itemsPerPage: number;
    dateFormat: string;
  };
};
