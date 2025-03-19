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
    const { email, otp, name, password } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { message: '邮箱和验证码不能为空' },
        { status: 400 }
      );
    }

    // 验证 OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    if (error) {
      console.error('验证码验证失败:', error);
      return NextResponse.json(
        { message: '验证码不正确或已过期' },
        { status: 400 }
      );
    }

    if (data?.user) {
      // 验证通过，创建用户资料
      const { error: profileError } = await serviceClient
        .from('users')
        .insert({
          id: data.user.id,
          name: name || data.user.user_metadata?.name,
          email: email,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('创建用户资料失败:', profileError);
      }

      return NextResponse.json({
        message: '验证成功，注册完成！',
        user: {
          id: data.user.id,
          email: email,
          name: name || data.user.user_metadata?.name
        }
      });
    }

    return NextResponse.json(
      { message: '验证失败，请重试' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('验证过程出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}