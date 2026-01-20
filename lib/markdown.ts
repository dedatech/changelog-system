import type { UpdateGroup, ListItem } from '@/types/changelog';

/**
 * 解析Markdown文本为结构化的更新数据
 *
 * 支持的Markdown格式：
 * ## 特性 / ## 优化 / ## 修复 (或 ## feature / ## improvement / ## fix)
 * - 一级列表项
 *   - 二级列表项（缩进2个空格）
 */
export function parseMarkdown(markdown: string): UpdateGroup[] {
  const lines = markdown.split('\n');
  const updates: UpdateGroup[] = [];
  let currentCategory: UpdateGroup | null = null;
  let currentItem: ListItem | null = null;

  for (let line of lines) {
    const trimmedLine = line.trimEnd();

    // 匹配分类标题 ## 特性 或 ## feature
    const categoryMatch = trimmedLine.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      // 保存当前分类（如果存在）
      if (currentCategory && currentCategory.items.length > 0) {
        updates.push(currentCategory);
      }

      // 解析分类
      const categoryText = categoryMatch[1].trim().toLowerCase();
      const category = parseCategory(categoryText);

      currentCategory = {
        id: Date.now().toString() + Math.random(),
        category,
        items: [],
      };
      currentItem = null;
      continue;
    }

    // 匹配一级列表项 - 开头，无缩进或缩进少于2个空格
    const topLevelMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (topLevelMatch && line.split(/^[-*]/)[0]?.length !== undefined) {
      const indentLevel = line.split(/^[-*]/)[0]?.length || 0;

      if (indentLevel < 2) {
        // 一级列表项
        if (currentCategory) {
          currentItem = {
            id: Date.now().toString() + Math.random(),
            text: topLevelMatch[1].trim(),
            children: [],
          };
          currentCategory.items.push(currentItem);
        }
        continue;
      }
    }

    // 匹配二级列表项 - 缩进2个空格
    const nestedMatch = trimmedLine.match(/^\s{2,}[-*]\s+(.+)$/);
    if (nestedMatch && currentItem) {
      currentItem.children = currentItem.children || [];
      currentItem.children.push({
        id: Date.now().toString() + Math.random(),
        text: nestedMatch[1].trim(),
      });
      continue;
    }
  }

  // 保存最后一个分类
  if (currentCategory && currentCategory.items.length > 0) {
    updates.push(currentCategory);
  }

  return updates.length > 0 ? updates : [{
    id: Date.now().toString(),
    category: 'feature',
    items: [{ id: Date.now().toString() + '-1', text: '' }],
  }];
}

/**
 * 解析分类文本为标准分类
 */
function parseCategory(text: string): 'feature' | 'improvement' | 'fix' {
  const categoryMap: Record<string, 'feature' | 'improvement' | 'fix'> = {
    '特性': 'feature',
    'feature': 'feature',
    '优化': 'improvement',
    'improvement': 'improvement',
    '修复': 'fix',
    'fix': 'fix',
  };

  return categoryMap[text.toLowerCase()] || 'feature';
}

/**
 * 将结构化的更新数据转换为Markdown文本
 */
export function toMarkdown(updates: UpdateGroup[]): string {
  const lines: string[] = [];

  for (const update of updates) {
    if (update.items.length === 0) continue;

    // 添加分类标题
    lines.push(`## ${getCategoryLabel(update.category)}`);
    lines.push('');

    // 添加列表项
    for (const item of update.items) {
      lines.push(`- ${item.text || ''}`);

      // 添加子项
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          lines.push(`  - ${child.text || ''}`);
        }
      }
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}

/**
 * 获取分类标签
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    feature: '特性',
    improvement: '优化',
    fix: '修复',
  };
  return labels[category] || category;
}
