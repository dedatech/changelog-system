import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // 检查上传目录是否存在
    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        success: true,
        files: [],
      });
    }

    // 读取目录中的所有文件
    const allFiles = await readdir(uploadDir);

    // 过滤只保留图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = allFiles
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map((file) => ({
        filename: file,
        url: `/uploads/${file}`,
        // 按文件名中的时间戳排序（最新的在前）
        timestamp: parseInt(file.split('-')[0]) || 0,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      files: imageFiles,
    });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read uploads directory' },
      { status: 500 }
    );
  }
}
