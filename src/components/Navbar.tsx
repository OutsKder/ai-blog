'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  // 检查登录状态并获取用户信息
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setIsLoggedIn(true);
          setUserEmail(session.user.email || '');
          setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户');
        } else {
          setIsLoggedIn(false);
          setUserEmail('');
          setUserName('');
        }
      } catch (error) {
        console.error('认证检查失败:', error);
        setIsLoggedIn(false);
      }
    }
    
    checkAuth();
    
    // 订阅身份验证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth 状态变更:', event);
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUserEmail('');
        setUserName('');
        router.push('/');
      } else if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
        setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户');
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);
  
  // 处理登出 - 使用完整的登出流程
  const handleLogout = async () => {
    try {
      console.log('开始登出流程...');
      
      // 清除所有缓存
      await supabase.auth.signOut({ scope: 'global' });
      console.log('已登出 Supabase');
      
      // 手动重置状态
      setIsLoggedIn(false);
      setUserEmail('');
      setUserName('');
      
      // 强制刷新页面，确保所有状态都重置
      window.location.href = '/';
    } catch (error) {
      console.error('登出错误:', error);
      alert('登出时发生错误，请重试');
    }
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl">
                DeepSeek 博客
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                首页
              </Link>
              <Link href="/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                仪表板
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* 显示用户邮箱 */}
                <span className="text-sm text-gray-700">
                  {userEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  退出登录
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  登录
                </Link>
                <Link href="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 