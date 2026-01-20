// 版本类型
export type ProductType = 'IDE' | 'JetBrains' | 'CLI';

// 版本状态
export type VersionStatus = 'draft' | 'published';

// 列表项类型
export interface ListItem {
  id: string;
  text: string; // 列表项文本
  children?: ListItem[]; // 子列表项（二级内容）
}

// 更新分组
export interface UpdateGroup {
  id: string;
  category: 'feature' | 'improvement' | 'fix'; // 特性、优化、修复
  items: ListItem[]; // 列表项（支持嵌套）
}

// 版本数据结构
export interface Version {
  id: string;
  version: string;
  product: ProductType;
  publishDate: string; // ISO 8601 格式
  status: VersionStatus;

  // 主标题（H2级别）
  title: string;

  // 更新分组（每个分组是一个 H3 子标题）
  updates: UpdateGroup[];
}

// Changelog 数据结构
export interface ChangelogData {
  versions: Version[];
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
