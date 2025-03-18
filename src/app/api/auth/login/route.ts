import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    console.log('登录 API 被调用');
    
    const { email, password } = await request.json();
    console.log('收到登录请求:', { email });
    
    // 先清理现有会话
    await supabase.auth.signOut();
    console.log('已清理现有会话');
    
    // 使用 Supabase 进行身份验证
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (error) {
      console.error('登录失败:', error.message);
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    if (!user) {
      console.log('未找到用户');
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 400 }
      );
    }

    // 检查用户是否已验证邮箱
    if (!user.email_confirmed_at && user.confirmation_sent_at) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { message: '请先验证您的邮箱后再登录' },
        { status: 400 }
      );
    }

    console.log('用户验证成功:', user.email);

    // 获取用户的详细信息
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('获取用户资料失败:', profileError.message);
      return NextResponse.json(
        { message: '获取用户资料失败' },
        { status: 500 }
      );
    }

    // 设置会话 Cookie
    const { data: { session }, error: _ } = await supabase.auth.getSession();
    
    if (session) {
      console.log('设置会话 Cookie');
      await cookies().set({
        name: 'sb-session',
        value: session.access_token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }
    
    return NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        name: profile?.name || user.email?.split('@')[0],
        email: user.email,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('登录时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 