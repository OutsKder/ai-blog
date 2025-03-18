import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 获取当前会话
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }
    
    // 获取用户的博客
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('author_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('获取用户博客时出错:', error);
      return NextResponse.json(
        { message: '获取博客失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ blogs: data });
  } catch (error) {
    console.error('获取用户博客时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 