import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 只保护 admin 路由（除了登录页面）
  const { pathname } = request.nextUrl;

  // 如果是登录页面，直接放行
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 如果是 admin 下的其他页面，需要验证登录
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');

    if (!session || session.value !== 'authenticated') {
      // 未登录，重定向到登录页
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
