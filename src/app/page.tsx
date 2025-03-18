'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 检查用户是否已登录
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('登录状态检查失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">DeepSeek 博客生成器</h1>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-8">AI 驱动的博客创作平台</h2>
            <p className="text-xl mb-12">使用 DeepSeek 人工智能快速生成高质量、个性化的博客文章</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors shadow-lg">
                开始创作
              </Link>
              
              {/* 只有在未登录时才显示登录按钮 */}
              {!isLoading && !isLoggedIn && (
                <Link href="/login" className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 transition-colors shadow">
                  登录账户
                </Link>
              )}
            </div>
          </div>
        </header>
        
        {/* 功能介绍卡片 */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-3">AI 内容生成</h3>
            <p className="text-gray-700">基于 DeepSeek 模型，根据您的主题、风格和关键词生成高质量博客内容</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="text-purple-600 text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-3">个性化定制</h3>
            <p className="text-gray-700">调整生成参数，创建符合您独特风格和需求的博客文章</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="text-green-600 text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">一键发布</h3>
            <p className="text-gray-700">轻松管理、编辑和发布您的博客文章，实现创作全流程自动化</p>
          </div>
        </section>
        
        {/* 波浪装饰 */}
        <div className="w-full h-24 mt-16 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
                  className="fill-gray-50"></path>
          </svg>
        </div>
        
        {/* 底部信息 */}
        <section className="bg-gray-50 p-8 rounded-lg mt-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">开始您的 AI 创作之旅</h3>
            <p className="text-gray-700 mb-6">DeepSeek 博客生成器让您的创作更加高效、专业和个性化</p>
            
            <Link href="/create" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
              立即体验
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
