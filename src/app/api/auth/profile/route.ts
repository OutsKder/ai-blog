import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // 获取请求体
    const { userId, email, name } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }
    
    // 创建服务角色客户端
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // 检查用户是否已有资料
    const { data: existingProfile, error: checkError } = await serviceClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('检查用户资料时出错:', checkError);
      return NextResponse.json({ error: '检查用户资料失败' }, { status: 500 });
    }
    
    // 如果已有资料，直接返回成功
    if (existingProfile) {
      return NextResponse.json({ success: true, created: false });
    }
    
    // 没有资料，创建新资料
    const { error: insertError } = await serviceClient
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: name || email?.split('@')[0] || '用户',
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('创建用户资料时出错:', insertError);
      return NextResponse.json({ error: '创建用户资料失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, created: true });
  } catch (error) {
    console.error('处理用户资料时出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 