'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 检查用户是否已登录
  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          console.log('未登录，重定向到登录页面');
          router.push('/login?callbackUrl=/create');
          return;
        }
        
        // 用户已登录，可以继续
        console.log('用户已登录，可以访问创作页面');
      } catch (error) {
        console.error('检查登录状态出错:', error);
        router.push('/login?callbackUrl=/create');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
  // 生成博客内容
  const generateBlog = async () => {
    if (!topic) {
      alert('请输入博客主题');
      return;
    }
    
    setIsGenerating(true);
    try {
      // 这里将来可以接入实际的 DeepSeek API
      // 目前使用模拟数据
      setTimeout(() => {
        setTitle(`关于${topic}的深度分析`);
        setContent(`这是一篇关于${topic}的AI生成博客文章。

## ${topic}的基本概述

${topic}是一个非常有趣的领域，涉及到许多方面的知识和应用。

## 主要内容

1. ${topic}的发展历史
2. ${topic}的现状分析
3. ${topic}的未来趋势

## 结论

通过深入研究${topic}，我们可以发现这一领域有着巨大的潜力和发展空间。`);
        
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('生成博客失败:', error);
      setIsGenerating(false);
      alert('生成博客失败，请重试');
    }
  };
  
  // 保存博客
  const saveBlog = async () => {
    if (!title || !content) {
      alert('标题和内容不能为空');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('您需要登录才能保存博客');
        router.push('/login?callbackUrl=/create');
        return;
      }
      
      const userId = session.user.id;
      
      // 保存到 Supabase
      const { data, error } = await supabase.from('blogs').insert([
        { 
          title, 
          content, 
          user_id: userId,
          tags: [topic], 
        }
      ]).select();
      
      if (error) throw error;
      
      alert('博客保存成功！');
      
      // 跳转到仪表板
      router.push('/dashboard');
    } catch (error) {
      console.error('保存博客失败:', error);
      alert('保存失败，请重试');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">加载中...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">创建新博客</h1>
      
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">使用 AI 生成内容</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="输入博客主题，如：人工智能、Web开发、旅游攻略..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generateBlog}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? '生成中...' : '生成博客'}
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          博客标题
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入博客标题"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          博客内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="输入博客内容"
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={saveBlog}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          保存博客
        </button>
      </div>
    </div>
  );
} 