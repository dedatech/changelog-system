'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import type { Version } from '@/types/changelog';

export default function AdminPage() {
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    fetchVersions();
  }, []);

  async function fetchVersions() {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/versions?includeDrafts=true'));
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个版本吗？')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/versions?id=${id}`), {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setVersions(versions.filter((v) => v.id !== id));
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      alert('删除失败');
    }
  }

  async function handleToggleStatus(id: string, currentStatus: 'draft' | 'published') {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    const actionText = newStatus === 'published' ? '发布' : '取消发布';

    if (!confirm(`确定要${actionText}这个版本吗？`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/versions?id=${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setVersions(versions.map((v) =>
          v.id === id ? { ...v, status: newStatus } : v
        ));
      } else {
        alert(`${actionText}失败: ` + data.error);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(`${actionText}失败`);
    }
  }

  async function handleLogout() {
    try {
      await fetch(getApiUrl('/api/logout'), { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const filteredVersions = versions.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">版本管理</h1>
              <p className="text-sm text-gray-600 mt-1">
                管理和发布更新日志
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/config"
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                ⚙️ 系统配置
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                登出
              </button>
              <Link
                href="/admin/new"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + 新建版本
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mt-6">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              全部 ({versions.length})
            </FilterButton>
            <FilterButton
              active={filter === 'published'}
              onClick={() => setFilter('published')}
            >
              已发布 ({versions.filter((v) => v.status === 'published').length})
            </FilterButton>
            <FilterButton
              active={filter === 'draft'}
              onClick={() => setFilter('draft')}
            >
              草稿 ({versions.filter((v) => v.status === 'draft').length})
            </FilterButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredVersions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              {filter === 'all' ? '暂无版本记录' : `暂无${filter === 'draft' ? '草稿' : '已发布'}版本`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVersions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-purple-100 text-purple-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function VersionCard({
  version,
  onDelete,
  onToggleStatus,
}: {
  version: Version;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'draft' | 'published') => void;
}) {
  const statusLabel = version.status === 'published' ? '已发布' : '草稿';
  const statusColor =
    version.status === 'published'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  const toggleButtonText = version.status === 'published' ? '取消发布' : '发布';
  const toggleButtonColor = version.status === 'published'
    ? 'text-gray-600 hover:bg-gray-50'
    : 'text-green-600 hover:bg-green-50';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {version.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {version.product} {version.version}
            </span>
            <span>•</span>
            <span>{formatDate(version.publishDate)}</span>
            <span>•</span>
            <span>
              {version.updates.length} 个分类
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Link
            href={`/admin/edit/${version.id}`}
            className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors"
          >
            编辑
          </Link>
          <button
            onClick={() => onToggleStatus(version.id, version.status)}
            className={`px-3 py-1.5 text-sm font-medium ${toggleButtonColor} rounded transition-colors`}
          >
            {toggleButtonText}
          </button>
          <button
            onClick={() => onDelete(version.id)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
