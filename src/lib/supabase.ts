import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端 - 确保使用相同的配置
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 检查用户是否已登录
export async function isAuthenticated() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!session;
  } catch (error) {
    console.error('认证检查失败:', error);
    return false;
  }
}

// 获取当前用户
export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
}

// Google 登录辅助函数
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback'
    }
  });
}

// 登出
export async function signOut() {
  return supabase.auth.signOut();
} 