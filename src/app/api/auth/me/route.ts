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
    
    // 从 users 表获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (userError) {
      console.error('获取用户数据时出错:', userError);
      return NextResponse.json(
        { message: '获取用户信息失败' },
        { status: 500 }
      );
    }
    
    // 返回用户信息
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: userData?.name || session.user.email?.split('@')[0] || '用户',
        avatar: userData?.avatar_url,
        createdAt: userData?.created_at || session.user.created_at
      }
    });
  } catch (error) {
    console.error('获取用户信息时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 