'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { FcGoogle } from 'react-icons/fc';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 使用 Suspense 包装的搜索参数组件
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  
  // 检查是否已登录，但增加延迟防止闪退
  useEffect(() => {
    let isMounted = true;
    
    async function checkAuth() {
      try {
        // 故意添加延迟，确保页面有时间渲染
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!isMounted) return;
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          console.log('用户已登录，准备重定向...');
          setIsRedirecting(true);
          
          // 延迟重定向，让用户知道发生了什么
          setTimeout(() => {
            if (isMounted) {
              router.push(callbackUrl);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('认证检查失败:', error);
        if (isMounted) {
          setError('检查登录状态时出错');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [router, callbackUrl]);
  
  // 处理账号密码登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) throw error;
      
      // 登录成功
      router.push(callbackUrl);
    } catch (error) {
      console.error('登录失败:', error);
      setError('邮箱或密码不正确，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理 Google 登录
  const handleGoogleLogin = async () => {
    try {
      setError('');
      
      // 构建完整的回调 URL
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`
        : `/auth/callback?next=${encodeURIComponent(callbackUrl)}`;
      
      console.log('重定向 URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      // 重定向到 Google 登录
      window.location.href = data.url;
    } catch (error) {
      console.error('Google 登录失败:', error);
      setError('Google 登录失败，请重试');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">正在检查登录状态...</p>
      </div>
    );
  }
  
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">您已经登录</p>
        <p className="text-gray-600">正在跳转到应用...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">登录到 DeepSeek 博客</h1>
          <p className="mt-2 text-gray-600">使用您的账号登录并开始创作</p>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {/* 邮箱密码登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入您的邮箱"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入密码"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? '登录中...' : '登录'}
          </button>
        </form>
        
        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或者</span>
          </div>
        </div>
        
        {/* Google 登录按钮 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-2 space-x-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <FcGoogle size={24} />
          <span>使用 Google 账号登录</span>
        </button>
        
        {/* 注册链接 */}
        <div className="flex items-center justify-center">
          <span className="text-sm text-gray-500">没有账号？</span>
          <Link href="/register" className="ml-1 text-sm text-blue-600 hover:underline">
            注册
          </Link>
        </div>
      </div>
    </div>
  );
}

// 主页面组件，用 Suspense 包装
export default function Login() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <LoginContent />
    </Suspense>
  );
} 