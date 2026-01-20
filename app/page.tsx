import { getVersions, getConfig } from '@/lib/data';
import { ChangelogClient } from '@/components/ChangelogClient';
import type { ProductType } from '@/types/changelog';

export default async function HomePage() {
  // 并行获取配置和版本数据
  const [config, versions] = await Promise.all([
    getConfig(),
    getVersions(),
  ]);

  // 从配置中获取启用的产品列表
  const enabledProducts = config.products
    .filter((p) => p.enabled)
    .sort((a, b) => a.order - b.order)
    .map((p) => p.name as ProductType);

  return <ChangelogClient
    initialVersions={versions}
    config={config}
    availableProducts={enabledProducts}
  />;
}
