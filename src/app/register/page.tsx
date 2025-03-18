'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { FcGoogle } from 'react-icons/fc';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitingVerification, setWaitingVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 调用注册 API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 检查是否是频率限制错误
        if (response.status === 429 || data.rateLimit) {
          setError('您的邮箱最近收到了太多验证邮件，请稍后再试或使用其他邮箱地址。');
        } else {
          throw new Error(data.message || '注册失败');
        }
        setIsLoading(false);
        return;
      }

      if (data.requireVerification) {
        // 显示等待验证状态
        setWaitingVerification(true);
        setIsLoading(false);
      } else {
        // 显示成功消息
        alert(data.message || '注册成功，请登录');
        // 重定向到登录页面
        router.push('/login');
      }
    } catch (error: any) {
      console.error('注册时出错:', error);
      setError(error.message || '注册过程中发生错误，请稍后再试');
      setIsLoading(false);
    }
  };

  // 添加 Google 登录处理函数
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // 打印 URL 用于调试
      console.log("生成的 OAuth URL:", data.url);
      
      // 重定向到 Google 登录页面
      window.location.href = data.url;
    } catch (error) {
      console.error('Google 登录错误:', error);
      setError('Google 登录失败，请稍后再试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">注册</h1>
          <p className="mt-2 text-gray-600">创建您的 DeepSeek 博客账户</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        {waitingVerification ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 text-blue-700 text-center">
            <h3 className="text-xl font-semibold mb-2">等待验证</h3>
            <p className="mb-4">我们已向您的邮箱发送了验证链接。</p>
            <p className="mb-4">请打开您的邮箱，点击验证链接完成注册。</p>
            <div className="animate-pulse text-center mt-6">
              <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-blue-600">等待验证中...</p>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">姓名</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">密码</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isLoading ? '注册中...' : '注册账户'}
                </button>
              </div>
            </form>
            
            {/* 添加分隔线 */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或者</span>
              </div>
            </div>
            
            {/* 添加 Google 登录按钮 */}
            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                <span>使用 Google 账号注册/登录</span>
              </button>
            </div>
          </>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            已有账户？{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 