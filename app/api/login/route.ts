import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt for username:', username);

    // 读取配置文件中的账号密码
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    const configContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    console.log('Config admin:', config.admin);

    // 验证账号密码
    if (username === config.admin?.username && password === config.admin?.password) {
      // 设置 cookie
      const cookieStore = cookies();
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: false, // 开发环境设为 false
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: '/',
      });

      console.log('Login successful, cookie set');

      return NextResponse.json({
        success: true,
        message: '登录成功',
      });
    }

    console.log('Login failed: invalid credentials');

    return NextResponse.json(
      {
        success: false,
        error: '用户名或密码错误',
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '登录失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
