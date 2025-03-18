// @ts-ignore next-line
// 使用 Supabase 客户端
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ApiError } from '@/types/global';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RouteSegmentProps {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteSegmentProps
) {
  try {
    // 获取请求中的认证头
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证 token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '无效的认证凭据' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    // 从 Supabase 获取博客
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: ApiError) {
    return NextResponse.json(
      { error: error.message || '未知错误' },
      { status: 500 }
    );
  }
}

// 更新其他方法的签名
export async function PUT(
  _request: NextRequest,
  { params }: RouteSegmentProps
) {
  // 使用 params
  return NextResponse.json({ message: `暂不支持更新ID为 ${params.id} 的博客` }, { status: 501 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteSegmentProps
) {
  // 使用 params
  return NextResponse.json({ message: `暂不支持删除ID为 ${params.id} 的博客` }, { status: 501 });
} 