import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // 读取配置
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    const configContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    return NextResponse.json({
      success: true,
      message: '系统正常运行',
      config: {
        hasAdmin: !!config.admin,
        adminUsername: config.admin?.username,
        // 不返回密码
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
}
