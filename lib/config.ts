// API 配置（仅用于管理后台）
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 获取完整的 API URL
export function getApiUrl(path: string): string {
  const baseUrl = API_BASE_URL.replace(/\/$/, ''); // 移除末尾斜杠
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
}
