import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('admin_session');

    if (session?.value === 'authenticated') {
      return NextResponse.json({
        success: true,
        authenticated: true,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: false,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: '验证失败' },
      { status: 500 }
    );
  }
}
