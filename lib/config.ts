// 获取完整的 API URL（动态使用当前页面的域名）
export function getApiUrl(path: string): string {
  // 在浏览器环境中，使用当前页面的协议、域名和端口
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const apiPath = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${apiPath}`;
  }

  // 服务端渲染时，使用环境变量
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
}
