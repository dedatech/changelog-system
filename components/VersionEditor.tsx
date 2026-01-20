'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import { parseMarkdown, toMarkdown } from '@/lib/markdown';
import type { Version, ProductType, UpdateGroup } from '@/types/changelog';
import { ImagePicker } from './ImagePicker';

type VersionEditorProps = {
  versionId?: string;
  initialData?: Version;
};

export function VersionEditor({ versionId, initialData }: VersionEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    version: string;
    product: ProductType;
    title: string;
  }>({
    version: '',
    product: 'JetBrains',
    title: '',
  });

  const [markdown, setMarkdown] = useState('');

  // 初始化数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        version: initialData.version,
        product: initialData.product,
        title: initialData.title,
      });
      setMarkdown(toMarkdown(initialData.updates));
    } else {
      // 默认模板
      setMarkdown(`## 特性
- 新功能示例
  - 子项详情

## 优化
- 性能优化点

## 修复
- 修复的问题`);
    }
  }, [initialData]);

  // 新建模式下，监听产品变化，自动获取最新版本号
  useEffect(() => {
    if (!versionId && formData.product) {
      // 新建模式，获取该产品的最新版本号
      fetch(getApiUrl(`/api/versions/latest?product=${encodeURIComponent(formData.product)}`))
        .then(res => res.json())
        .then(data => {
          if (data.success && data.suggestedVersion) {
            setFormData(prev => ({
              ...prev,
              version: data.suggestedVersion
            }));
          }
        })
        .catch(err => {
          console.error('Error fetching latest version:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.product, versionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = versionId ? `/api/versions?id=${versionId}` : '/api/versions';
      const method = versionId ? 'PUT' : 'POST';

      // 解析Markdown为结构化数据
      const updates = parseMarkdown(markdown);

      const submitData = {
        ...formData,
        status: 'draft' as const,
        updates,
      };

      const response = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        alert(versionId ? '保存成功！' : '创建成功！');
        router.push('/admin');
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving version:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // 在 Markdown 中插入图片/视频链接
        const isImage = data.type.startsWith('image/');
        const markdownLink = isImage
          ? `![${file.name}](${data.url})`
          : `[视频: ${file.name}](${data.url})`;

        // 在光标位置插入
        const textarea = document.querySelector('textarea[name="markdown"]') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;

          // 智能检测当前行，如果在列表项中，直接插入；否则创建新列表项
          const lines = text.split('\n');
          let currentLineIndex = 0;
          let charCount = 0;

          // 找到光标所在的行
          for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1; // +1 for newline
            if (charCount > start) {
              currentLineIndex = i;
              break;
            }
          }

          const currentLine = lines[currentLineIndex] || '';
          const isListItem = /^\s*[-*]\s/.test(currentLine);

          let newText: string;
          if (isListItem) {
            // 在列表项中，直接插入图片
            newText = text.substring(0, start) + ' ' + markdownLink + text.substring(end);
          } else {
            // 不在列表项中，创建新的列表项
            const prefix = start > 0 && text[start - 1] === '\n' ? '' : '\n';
            newText = text.substring(0, start) + prefix + `- ` + markdownLink + '\n' + text.substring(end);
          }

          setMarkdown(newText);

          // 设置光标位置
          setTimeout(() => {
            textarea.focus();
          }, 0);
        }

        alert('上传成功！图片已插入');
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('上传失败');
    } finally {
      setUploading(false);
      // 清空 input，允许重复上传同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleSelectImage(imageUrl: string, altText: string) {
    const markdownLink = `![${altText}](${imageUrl})`;

    // 在光标位置插入
    const textarea = document.querySelector('textarea[name="markdown"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      // 智能检测当前行，如果在列表项中，直接插入；否则创建新列表项
      const lines = text.split('\n');
      let currentLineIndex = 0;
      let charCount = 0;

      // 找到光标所在的行
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 for newline
        if (charCount > start) {
          currentLineIndex = i;
          break;
        }
      }

      const currentLine = lines[currentLineIndex] || '';
      const isListItem = /^\s*[-*]\s/.test(currentLine);

      let newText: string;
      if (isListItem) {
        // 在列表项中，直接插入图片
        newText = text.substring(0, start) + ' ' + markdownLink + text.substring(end);
      } else {
        // 不在列表项中，创建新的列表项
        const prefix = start > 0 && text[start - 1] === '\n' ? '' : '\n';
        newText = text.substring(0, start) + prefix + `- ` + markdownLink + '\n' + text.substring(end);
      }

      setMarkdown(newText);

      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }

  // 实时预览数据
  const previewData: Version = {
    id: 'preview',
    version: formData.version || '1.0.0',
    product: formData.product,
    publishDate: new Date().toISOString(),
    status: 'draft',
    title: formData.title || '未命名版本',
    updates: parseMarkdown(markdown),
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {versionId ? '编辑版本' : '新建版本'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {versionId ? '编辑版本信息' : '创建新的更新日志'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：预览区 */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">预览</h2>
                {/* 设备切换 */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                      previewMode === 'desktop'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    💻 PC
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                      previewMode === 'mobile'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📱 移动
                  </button>
                </div>
              </div>
              {/* 移动端预览用容器限制宽度 */}
              {previewMode === 'mobile' ? (
                <div className="flex justify-center py-4">
                  {/* 手机边框 */}
                  <div className="relative mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[2.5rem] h-[750px] w-[375px] shadow-2xl flex flex-col">
                    {/* 听筒/刘海 */}
                    <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -right-[17px] top-[190px] rounded-r-lg"></div>
                    {/* 摄像头 */}
                    <div className="h-[6px] w-[100px] bg-gray-800 absolute top-[12px] left-1/2 transform -translate-x-1/2 rounded-full"></div>

                    {/* 屏幕区域 */}
                    <div className="flex-1 rounded-[2rem] overflow-hidden bg-white">
                      {/* 状态栏模拟 */}
                      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4 py-2 flex justify-between items-center text-xs">
                        <span className="font-medium">9:41</span>
                        <div className="flex items-center gap-1">
                          <span>📶</span>
                          <span>🔋</span>
                        </div>
                      </div>

                      {/* 预览内容区域 */}
                      <div className="h-[calc(100%-40px)] overflow-y-auto bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4 py-4">
                        <VersionPreview data={previewData} mode="mobile" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <VersionPreview data={previewData} mode="desktop" />
              )}
            </div>
          </div>

          {/* 右侧：编辑区 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                基本信息
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    产品 *
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        product: e.target.value as ProductType,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="IDE">IDE</option>
                    <option value="JetBrains">JetBrains</option>
                    <option value="CLI">CLI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    版本号 *
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="例如：新增数据库关联和指令能力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Markdown编辑器 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  更新内容 (Markdown)
                </h2>
                <div className="text-xs text-gray-500">
                  使用 ## 标题，- 列表，支持缩进子项
                </div>
              </div>

              {/* 工具栏 */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleUploadFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      上传中...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      上传新图片
                    </>
                  )}
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  图片库
                </button>

                <span className="text-xs text-gray-400 ml-2">
                  支持 JPEG、PNG、GIF、WebP、MP4、WebM（最大 10MB）
                </span>
              </div>

              <textarea
                name="markdown"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onKeyDown={(e) => {
                  // 回车时自动添加列表符号
                  if (e.key === 'Enter') {
                    const textarea = e.target as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const text = textarea.value;

                    // 找到当前行
                    const lines = text.split('\n');
                    let currentLineIndex = 0;
                    let charCount = 0;

                    for (let i = 0; i < lines.length; i++) {
                      charCount += lines[i].length + 1; // +1 for newline
                      if (charCount > start) {
                        currentLineIndex = i;
                        break;
                      }
                    }

                    const currentLine = lines[currentLineIndex] || '';

                    // 检查当前行是否是列表项
                    const listMatch = currentLine.match(/^(\s*)([-*])\s/);

                    if (listMatch) {
                      e.preventDefault();

                      const indent = listMatch[1]; // 缩进
                      const bullet = listMatch[2]; // 列表符号 - 或 *

                      // 如果当前行只有列表符号和空格，不添加新列表（清空该行）
                      if (currentLine.trim() === bullet) {
                        const newText = text.substring(0, start - currentLine.length) + '\n' + text.substring(start);
                        setMarkdown(newText);
                        setTimeout(() => {
                          textarea.selectionStart = textarea.selectionEnd = start - currentLine.length + 1;
                        }, 0);
                        return;
                      }

                      // 添加新列表行
                      const newText = text.substring(0, start) + '\n' + indent + bullet + ' ' + text.substring(start);
                      setMarkdown(newText);

                      // 设置光标位置
                      setTimeout(() => {
                        const newCursorPos = start + 1 + indent.length + bullet.length + 1;
                        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
                      }, 0);
                    }
                  }
                }}
                placeholder={`## 特性
- 新功能描述
  - 子项详情（缩进2个空格）

## 优化
- 性能优化点

## 修复
- 修复的问题`}
                className="w-full h-96 px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                spellCheck={false}
              />

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Markdown格式说明：</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 使用 <code className="px-1 py-0.5 bg-gray-200 rounded">## 特性</code> 或 <code className="px-1 py-0.5 bg-gray-200 rounded">## feature</code> 表示分类</li>
                  <li>• 使用 <code className="px-1 py-0.5 bg-gray-200 rounded">- 内容</code> 表示一级列表项</li>
                  <li>• 使用 <code className="px-1 py-0.5 bg-gray-200 rounded">  - 子内容</code>（2空格缩进）表示二级列表项</li>
                  <li>• 支持的分类：特性/优化/修复 或 feature/improvement/fix</li>
                  <li>• 图片：<code className="px-1 py-0.5 bg-gray-200 rounded">- 描述 ![图片说明](/uploads/xxx.jpg)</code></li>
                  <li className="text-yellow-600">⚠️ 图片必须放在列表项中，如：<code>- 文字 ![图片](url)</code></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 图片库选择器 */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleSelectImage}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </form>
  );
}

function VersionPreview({ data, mode }: { data: Version; mode: 'desktop' | 'mobile' }) {
  if (mode === 'mobile') {
    // 移动端布局
    return (
      <article className="flex flex-col">
        {/* 移动端：标题在前 */}
        <div className="mb-4">
          {/* 版本:标题 */}
          <h2 className="text-xl font-bold text-gray-900">
            <span className="text-purple-600">v{data.version}</span>
            <span className="text-gray-400 mx-1">:</span>
            {data.title}
          </h2>
          {/* 发布日期 */}
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(data.publishDate)}
          </div>
        </div>

        {/* 更新内容 */}
        <div>
          {data.updates.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">暂无更新内容</p>
          ) : (
            data.updates.map((update) => (
              <div key={update.id} className="mb-5 lg:mb-6 last:mb-0">
                <h3 className="text-sm lg:text-base text-gray-800 mb-3 lg:mb-4">
                  {getCategoryLabel(update.category)}
                </h3>

                {update.items.length === 0 ? (
                  <p className="text-gray-400 text-xs">暂无条目</p>
                ) : (
                  <ul className="space-y-2">
                    {update.items.map((item) => (
                      <ListItem key={item.id} item={item} />
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </article>
    );
  }

  // 桌面端布局
  return (
    <article className="flex gap-4 lg:gap-8">
      {/* 左侧：日期和版本 */}
      <aside className="w-40 flex-shrink-0 pt-2">
        {/* 日期 */}
        <div className="text-sm font-semibold text-gray-700 mb-2">
          {formatDate(data.publishDate)}
        </div>
        {/* 版本号 - 使用产品标签样式 */}
        <div className="text-base lg:text-lg font-bold text-purple-600 bg-purple-50 inline-block px-3 lg:px-4 py-1 rounded-lg">
          v{data.version}
        </div>
      </aside>

      {/* 右侧：发布内容 */}
      <div className={`${data.title ? 'flex-1' : 'flex-1'}`}>
        {data.title && (
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">
            {data.title}
          </h2>
        )}

        {data.updates.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">暂无更新内容</p>
        ) : (
          data.updates.map((update) => (
            <div key={update.id} className="mb-5 lg:mb-6 last:mb-0">
              <h3 className="text-lg lg:text-xl text-gray-800 mb-3 lg:mb-4">
                {getCategoryLabel(update.category)}
              </h3>

              {update.items.length === 0 ? (
                <p className="text-gray-400 text-xs">暂无条目</p>
              ) : (
                <ul className="space-y-2">
                  {update.items.map((item) => (
                    <ListItem key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function ListItem({ item }: { item: { id: string; text: string; children?: Array<{ id: string; text: string }> } }) {
  const hasChildren = item.children && item.children.length > 0;

  // 渲染支持图片的文本
  const renderText = (text: string) => {
    if (!text) return null;

    // 匹配图片语法 ![alt](url)
    const parts: Array<{ type: 'text' | 'image'; content: string; src?: string }> = [];
    let lastIndex = 0;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

    let match;
    while ((match = imageRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: 'image',
        content: match[1],
        src: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    if (parts.length === 0) {
      return <span>{text}</span>;
    }

    return (
      <span className="inline">
        {parts.map((part, index) => {
          if (part.type === 'image') {
            return (
              <img
                key={index}
                src={part.src}
                alt={part.content}
                className="max-w-full h-auto rounded-lg my-1 inline-block"
                style={{ maxHeight: '200px' }}
              />
            );
          }
          return <span key={index}>{part.content}</span>;
        })}
      </span>
    );
  };

  return (
    <li>
      <div className="flex items-start gap-2">
        {/* 实心圆点 */}
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></span>
        <span className="text-base text-gray-700 flex-1 leading-relaxed">
          {renderText(item.text || '未命名内容')}
        </span>
      </div>

      {/* 二级列表 */}
      {hasChildren && (
        <ul className="ml-5 mt-2 space-y-1.5">
          {item.children!.map((child) => (
            <li key={child.id}>
              <div className="flex items-start gap-2">
                {/* 空心圆点 */}
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full border-2 border-purple-400 flex-shrink-0"></span>
                <span className="text-sm text-gray-600 flex-1 leading-relaxed">
                  {renderText(child.text || '未命名子内容')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    feature: '特性',
    improvement: '优化',
    fix: '修复',
  };
  return labels[category] || category;
}
