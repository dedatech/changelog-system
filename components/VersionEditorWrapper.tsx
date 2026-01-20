'use client';

import { VersionEditor } from '@/components/VersionEditor';
import type { Version } from '@/types/changelog';

type VersionEditorWrapperProps = {
  versionId?: string;
  initialData?: Version;
};

export function VersionEditorWrapper({ versionId, initialData }: VersionEditorWrapperProps) {
  return <VersionEditor versionId={versionId} initialData={initialData} />;
}
