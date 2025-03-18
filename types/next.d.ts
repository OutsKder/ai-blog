import { NextRequest, NextResponse } from 'next/server';

declare module 'next/server' {
  // 扩展路由处理器类型
  interface RouteHandlerContext {
    params: Record<string, string>;
  }
  
  // 定义 GET 处理器
  export type GetRouteHandler = (
    request: NextRequest,
    context: RouteHandlerContext
  ) => Promise<NextResponse> | NextResponse;
} 