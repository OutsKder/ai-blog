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
    console.log('=== 注册 API 被调用 ===');
    
    const { name, email, password } = await request.json();
    console.log('收到注册请求:', { name, email: email?.substring(0, 3) + '***' });
    
    // 标准化邮箱地址（转小写）
    const normalizedEmail = email.toLowerCase();
    console.log('标准化邮箱:', normalizedEmail.substring(0, 3) + '***');
    
    // 验证输入
    if (!name || !normalizedEmail || !password) {
      return NextResponse.json(
        { message: '请提供所有必填字段' },
        { status: 400 }
      );
    }
    
    try {
      // 使用 Supabase 创建新用户
      console.log('准备创建用户:', { email: normalizedEmail.substring(0, 3) + '***' });

      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            name: name
          },
          // 开发环境下禁用邮箱确认
          emailRedirectTo: process.env.NODE_ENV === 'production' 
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : undefined
        }
      });

      console.log('用户创建结果:', { 
        success: !!user, 
        userId: user?.id,
        error: signUpError?.message,
        emailSent: !!user?.confirmation_sent_at
      });

      if (signUpError) {
        // 处理邮件频率限制错误
        if (signUpError.message.includes('rate limit exceeded')) {
          console.error('邮件发送频率超出限制:', signUpError.message);
          return NextResponse.json(
            { 
              message: '您的邮箱最近收到了太多验证邮件，请稍后再试或使用其他邮箱地址。',
              rateLimit: true 
            },
            { status: 429 } // 使用适当的状态码 429 Too Many Requests
          );
        } else if (signUpError.message.includes('sending confirmation email')) {
          console.warn('邮件发送失败，但将继续创建用户');
        } else {
          console.error('注册失败:', signUpError.message);
          return NextResponse.json(
            { message: signUpError.message },
            { status: 400 }
          );
        }
      }

      if (!user) {
        return NextResponse.json(
          { message: '用户创建失败' },
          { status: 400 }
        );
      }

      // 如果是开发环境，手动确认用户
      if (user && process.env.NODE_ENV !== 'production') {
        try {
          // 使用服务角色客户端
          const serviceClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              auth: {
                persistSession: false
              }
            }
          );
          
          // 手动确认用户邮箱
          await serviceClient.auth.admin.updateUserById(
            user.id,
            { email_confirmed: true }
          );
          
          console.log('用户邮箱已手动确认');
          
          // 可选：创建会话，让用户自动登录
          const { data: sessionData } = await serviceClient.auth.admin.createSession({
            user_id: user.id
          });
          
          if (sessionData?.session) {
            // 设置 cookie
            const cookieStore = cookies();
            cookieStore.set('sb-access-token', sessionData.session.access_token, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
            cookieStore.set('sb-refresh-token', sessionData.session.refresh_token, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
            
            console.log('用户会话已创建');
          }
        } catch (confirmError) {
          console.error('手动确认用户邮箱失败:', confirmError);
        }
      }

      // 在 users 表中创建用户记录
      try {
        const timestamp = new Date().toISOString();
        
        // 使用 service_role 客户端绕过 RLS
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!, // 注意：使用正确的环境变量名
          {
            auth: {
              persistSession: false
            }
          }
        );
        
        console.log('准备插入用户资料，用户ID:', user.id);
        
        // 使用服务端客户端插入用户资料
        const { error: profileError } = await serviceClient
          .from('users')
          .insert({
            id: user.id,
            email: normalizedEmail,
            name: name,
            created_at: timestamp
          });

        if (profileError) {
          console.error('创建用户资料失败:', profileError);
          console.error('错误详情:', profileError.message);
        } else {
          console.log('用户资料创建成功');
        }
      } catch (profileError: any) {
        console.error('创建用户资料时出错:', profileError);
        console.error('错误堆栈:', profileError.stack);
      }

      // 不要创建会话，因为用户需要先验证邮箱

      // 返回成功，并指示需要验证
      return NextResponse.json({
        message: '注册成功！请检查您的邮箱完成验证。',
        user: {
          id: user.id,
          name: name,
          email: normalizedEmail,
          createdAt: user.created_at
        },
        requireVerification: true
      });

    } catch (authError: any) {
      console.error('认证操作出错:', authError);
      
      // 如果是邮件发送错误，提供更友好的错误消息
      if (authError.message && authError.message.includes('sending')) {
        return NextResponse.json(
          { message: '无法发送验证邮件。请联系管理员或稍后再试。' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { message: authError.message || '认证失败，请稍后再试' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('注册时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 