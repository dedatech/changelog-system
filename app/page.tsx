import { getVersions } from '@/lib/data';
import { ChangelogClient } from '@/components/ChangelogClient';

export default async function HomePage() {
  // 服务端只获取版本数据（配置由客户端动态获取）
  const versions = await getVersions();

  return <ChangelogClient initialVersions={versions} />;
}
