import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // 创建 Supabase 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // 登出用户
    await supabase.auth.signOut();
    
    // 清除 Cookie - 修复：完全使用异步方式
    const cookieStore = await cookies();
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    
    return NextResponse.json({ 
      success: true, 
      message: '已成功登出' 
    });
  } catch (error) {
    console.error('登出时出错:', error);
    return NextResponse.json({ 
      success: false, 
      message: '登出失败' 
    }, { status: 500 });
  }
} 