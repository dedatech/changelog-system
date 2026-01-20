'use client';

import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import type { Version, ProductType } from '@/types/changelog';
import type { Config } from '@/lib/data';
import ThemeToggle from './ThemeToggle';

// 动态导入图片灯箱组件，减少初始加载体积
const ImageLightbox = lazy(() =>
  import('./ImageLightbox').then((module) => ({
    default: module.ImageLightbox,
  }))
);

type ChangelogClientProps = {
  initialVersions: Version[];
  config: Config;
  availableProducts: ProductType[];
};

export function ChangelogClient({ initialVersions, config, availableProducts }: ChangelogClientProps) {
  const [allVersions] = useState<Version[]>(initialVersions);
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(availableProducts[0] || 'JetBrains');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 客户端筛选
  const filteredVersions = useMemo(() => {
    return allVersions.filter((v) => v.product === selectedProduct);
  }, [allVersions, selectedProduct]);

  // 加载骨架屏组件
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center gap-4">
              <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-8 lg:mb-10">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="w-40 flex-shrink-0 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />

      {/* Header */}
      <header className="border-b border-purple-100/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pr-24">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Logo + Title + Slogan */}
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md w-10 h-10">
                <span className="text-white text-xl">📋</span>
              </span>
              <h1 className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-xl">
                {config.site.title}
              </h1>
            </div>

            {/* Slogan */}
            <span className="text-gray-500 dark:text-gray-400 text-sm hidden sm:inline">
              {config.site.description}
            </span>

            {/* Product Tabs - 紧凑模式 */}
            {availableProducts.length > 1 && (
              <div className="flex items-center gap-2">
                {availableProducts.map((product) => (
                  <button
                    key={product}
                    onClick={() => setSelectedProduct(product)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedProduct === product
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600 hover:text-purple-600 border border-gray-200/50 dark:border-gray-600/50 hover:border-purple-300 dark:hover:border-purple-500 backdrop-blur-sm'
                    }`}
                  >
                    {product}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {filteredVersions.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">暂无更新记录</p>
          </div>
        ) : (
          <div className="space-y-8 lg:space-y-10">
            {filteredVersions.map((version, index) => (
              <VersionCard
                key={version.id}
                version={version}
                index={index}
                onImageClick={(src, alt) => setLightboxImage({ src, alt })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} · {config.site.title}</p>
        </div>
      </footer>

      {/* 图片灯箱 - 使用代码分割和 Suspense 优化加载 */}
      {lightboxImage && (
        <Suspense fallback={null}>
          <ImageLightbox
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            onClose={() => setLightboxImage(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

type VersionCardProps = {
  version: Version;
  index: number;
  onImageClick: (src: string, alt: string) => void;
};

function VersionCard({ version, index, onImageClick }: VersionCardProps) {
  return (
    <article className="group flex flex-col lg:flex-row gap-4 lg:gap-8 animate-fade-in hover:bg-purple-50/30 dark:hover:bg-gray-800/30 -mx-4 px-4 sm:mx-0 sm:px-0 rounded-xl transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
      {/* 移动端：标题在前 */}
      <div className="lg:hidden flex-1 mb-4">
        {/* 版本:标题 */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          <span className="text-purple-600 dark:text-purple-400">v{version.version}</span>
          <span className="text-gray-400 mx-1">:</span>
          {version.title}
        </h2>
        {/* 发布日期 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatDate(version.publishDate)}
        </div>
      </div>

      {/* 左侧：日期和版本（仅桌面端） */}
      <aside className="hidden lg:block w-40 flex-shrink-0 pt-2">
        <div className="lg:sticky lg:top-24">
          {/* 日期 */}
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {formatDate(version.publishDate)}
          </div>
          {/* 版本号 - 使用产品标签样式 */}
          <div className="text-base lg:text-lg font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 inline-block px-3 lg:px-4 py-1 rounded-lg">
            v{version.version}
          </div>
        </div>
      </aside>

      {/* 右侧：发布内容 */}
      <div className={`${version.title ? 'lg:flex-1' : 'flex-1'} pb-6 lg:pb-8 border-b border-gray-200 dark:border-gray-700 last:border-0`}>
        {/* 桌面端：标题 */}
        {version.title && (
          <h2 className="hidden lg:block text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-6">
            {version.title}
          </h2>
        )}

        {/* 更新内容列表 */}
        {version.updates.map((update) => (
          <div key={update.id} className="mb-5 lg:mb-6 last:mb-0">
            {/* ### 分类标题 */}
            <h3 className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 mb-3 lg:mb-4">
              {getCategoryLabel(update.category)}
            </h3>

            {/* 列表内容 */}
            <ul className="space-y-2">
              {update.items.map((item) => (
                <ListItem key={item.id} item={item} onImageClick={onImageClick} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

// 递归渲染列表项（支持嵌套）
type ListItemProps = {
  item: {
    id: string;
    text: string;
    children?: Array<{
      id: string;
      text: string;
    }>;
  };
  onImageClick: (src: string, alt: string) => void;
};

// 渲染支持图片的 Markdown 文本
function renderMarkdownText(text: string, onImageClick: (src: string, alt: string) => void) {
  if (!text) return null;

  // 匹配图片语法 ![alt](url)
  const parts: Array<{ type: 'text' | 'image'; content: string; src?: string }> = [];
  let lastIndex = 0;
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  let match;
  while ((match = imageRegex.exec(text)) !== null) {
    // 添加图片前的文本
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // 添加图片
    parts.push({
      type: 'image',
      content: match[1], // alt text
      src: match[2], // url
    });

    lastIndex = match.index + match[0].length;
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  // 如果没有匹配到图片，返回纯文本
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
              className="max-w-full h-auto rounded-lg my-2 inline-block cursor-pointer hover:opacity-90 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ maxHeight: '400px' }}
              loading="lazy"
              onClick={() => onImageClick(part.src!, part.content)}
            />
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}

function ListItem({ item, onImageClick }: ListItemProps) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className="group/item">
      <div className="flex items-start gap-2">
        {/* 实心圆点 */}
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 flex-shrink-0 transition-all duration-300 group-hover/item:scale-125 group-hover/item:shadow-md"></span>
        <span className="text-base text-gray-700 dark:text-gray-300 flex-1 leading-relaxed group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100 transition-colors duration-300">
          {renderMarkdownText(item.text, onImageClick)}
        </span>
      </div>

      {/* 二级列表 */}
      {hasChildren && (
        <ul className="ml-5 mt-2 space-y-1.5">
          {item.children!.map((child) => (
            <li key={child.id}>
              <div className="flex items-start gap-2">
                {/* 空心圆点 */}
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full border-2 border-purple-400 dark:border-purple-500 flex-shrink-0"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                  {renderMarkdownText(child.text, onImageClick)}
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    feature: '特性',
    improvement: '优化',
    fix: '修复',
  };
  return labels[category] || category;
}
