import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 创建服务角色客户端
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false }
  }
);

export async function POST(request: Request) {
  try {
    console.log('=== 注册 API 被调用 ===');
    
    const { name, email, password } = await request.json();
    console.log('收到注册请求:', { name, email });
    
    // 标准化邮箱地址（转小写）
    const normalizedEmail = email.toLowerCase();
    
    // 验证输入
    if (!name || !normalizedEmail || !password) {
      return NextResponse.json(
        { message: '请提供所有必填字段' },
        { status: 400 }
      );
    }

    // 使用服务角色直接创建用户并自动确认邮箱
    const { data, error } = await serviceClient.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      user_metadata: { name: name },
      email_confirm: true  // 自动确认邮箱
    });

    if (error) {
      console.error('注册失败:', error);
      return NextResponse.json(
        { message: '注册失败: ' + error.message },
        { status: 400 }
      );
    }

    // 创建用户资料
    await serviceClient
      .from('users')
      .insert({
        id: data.user.id,
        name: name,
        email: normalizedEmail,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      message: '注册成功，您现在可以登录',
      email: normalizedEmail
    });

  } catch (error: any) {
    console.error('注册时出错:', error);
    return NextResponse.json(
      { message: error.message || '服务器错误' },
      { status: 500 }
    );
  }
} 