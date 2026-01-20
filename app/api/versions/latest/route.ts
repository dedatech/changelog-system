import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const product = searchParams.get('product');

    if (!product) {
      return NextResponse.json({ success: false, error: '缺少产品参数' }, { status: 400 });
    }

    // 读取所有版本数据
    const dataPath = path.join(process.cwd(), 'data', 'changelog.json');
    const fileContent = await readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    // 过滤该产品的所有版本
    const productVersions = data.versions.filter((v: any) => v.product === product);

    if (productVersions.length === 0) {
      // 该产品还没有版本，返回初始版本
      return NextResponse.json({
        success: true,
        latestVersion: null,
        suggestedVersion: '1.0.0'
      });
    }

    // 按版本号排序（找到最新的）
    const sortedVersions = productVersions.sort((a: any, b: any) => {
      const aParts = a.version.split('.').map(Number);
      const bParts = b.version.split('.').map(Number);

      for (let i = 0; i < 3; i++) {
        if (aParts[i] !== bParts[i]) {
          return (bParts[i] || 0) - (aParts[i] || 0);
        }
      }
      return 0;
    });

    const latestVersion = sortedVersions[0].version;

    // 解析版本号并递增
    const versionParts = latestVersion.split('.').map(Number);
    versionParts[2] = (versionParts[2] || 0) + 1;
    const suggestedVersion = versionParts.join('.');

    return NextResponse.json({
      success: true,
      latestVersion,
      suggestedVersion
    });
  } catch (error) {
    console.error('Error getting latest version:', error);
    return NextResponse.json({ success: false, error: '获取版本失败' }, { status: 500 });
  }
}
