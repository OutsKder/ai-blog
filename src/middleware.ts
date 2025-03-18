import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 这里可以添加全局中间件逻辑
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
}; 