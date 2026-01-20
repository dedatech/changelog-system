import { VersionEditorWrapper } from '@/components/VersionEditorWrapper';
import { getVersion } from '@/lib/data';
import { notFound } from 'next/navigation';

// 静态导出需要 generateStaticParams
// 返回现有的版本ID用于静态生成
export async function generateStaticParams() {
  try {
    const { getAllVersions } = await import('@/lib/data');
    const versions = await getAllVersions();
    return versions.map((v) => ({ id: v.id }));
  } catch {
    return [{ id: 'v1.0.0' }];
  }
}

export default async function EditVersionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const version = await getVersion(id);

  if (!version) {
    notFound();
  }

  return <VersionEditorWrapper versionId={version.id} initialData={version} />;
}
