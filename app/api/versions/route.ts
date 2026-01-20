import { NextRequest, NextResponse } from 'next/server';
import { getVersions, getAllVersions, createVersion, getVersion, updateVersion, deleteVersion } from '@/lib/data';
import type { Version, ProductType } from '@/types/changelog';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const product = searchParams.get('product') || undefined;
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const id = searchParams.get('id');

    // 获取单个版本
    if (id) {
      const version = await getVersion(id);
      if (!version) {
        return NextResponse.json(
          { success: false, error: 'Version not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, version });
    }

    // 获取版本列表
    const versions = includeDrafts ? await getAllVersions() : await getVersions(product);
    return NextResponse.json({ success: true, versions });
  } catch (error) {
    console.error('Error in GET /api/versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.version || !body.product || !body.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: version, product, title' },
        { status: 400 }
      );
    }

    // 验证产品类型
    const validProducts: ProductType[] = ['IDE', 'JetBrains', 'CLI'];
    if (!validProducts.includes(body.product)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product type. Must be IDE, JetBrains, or CLI' },
        { status: 400 }
      );
    }

    // 验证更新内容
    if (!body.updates || !Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: 'updates must be an array' },
        { status: 400 }
      );
    }

    // 构建版本数据
    const versionData: Omit<Version, 'id' | 'publishDate'> = {
      version: body.version,
      product: body.product as ProductType,
      title: body.title,
      status: body.status || 'draft',
      updates: body.updates.map((update: any) => ({
        id: update.id || Date.now().toString() + Math.random(),
        category: update.category,
        items: update.items || [],
      })),
    };

    const newVersion = await createVersion(versionData);

    return NextResponse.json({ success: true, version: newVersion });
  } catch (error) {
    console.error('Error in POST /api/versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 验证产品类型
    if (body.product !== undefined) {
      const validProducts: ProductType[] = ['IDE', 'JetBrains', 'CLI'];
      if (!validProducts.includes(body.product)) {
        return NextResponse.json(
          { success: false, error: 'Invalid product type. Must be IDE, JetBrains, or CLI' },
          { status: 400 }
        );
      }
    }

    // 验证更新内容
    if (body.updates !== undefined && !Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: 'updates must be an array' },
        { status: 400 }
      );
    }

    const updates: Partial<{
      version: string;
      product: ProductType;
      title: string;
      status: 'draft' | 'published';
      updates: Array<{
        id: string;
        category: 'feature' | 'improvement' | 'fix';
        items: Array<{
          id: string;
          text: string;
          children?: Array<{
            id: string;
            text: string;
          }>;
        }>;
      }>;
    }> = {};

    if (body.version !== undefined) updates.version = body.version;
    if (body.product !== undefined) updates.product = body.product;
    if (body.title !== undefined) updates.title = body.title;
    if (body.status !== undefined) updates.status = body.status;
    if (body.updates !== undefined) {
      updates.updates = body.updates.map((update: any) => ({
        id: update.id || Date.now().toString() + Math.random(),
        category: update.category,
        items: update.items || [],
      }));
    }

    const updatedVersion = await updateVersion(id, updates);

    if (!updatedVersion) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, version: updatedVersion });
  } catch (error) {
    console.error('Error in PUT /api/versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update version' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const deleted = await deleteVersion(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Version deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete version' },
      { status: 500 }
    );
  }
}
