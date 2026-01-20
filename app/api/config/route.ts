import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

// GET - 读取配置
export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    const fileContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read config' },
      { status: 500 }
    );
  }
}

// PUT - 保存配置
export async function PUT(request: NextRequest) {
  try {
    const newConfig = await request.json();

    // 验证必需字段
    if (!newConfig.site || !newConfig.products || !newConfig.display) {
      return NextResponse.json(
        { success: false, error: 'Invalid config structure' },
        { status: 400 }
      );
    }

    // 保存到文件
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    await writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: '配置已保存',
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save config' },
      { status: 500 }
    );
  }
}
