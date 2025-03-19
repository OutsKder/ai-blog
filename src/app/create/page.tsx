'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { generateBlogContent } from '@/lib/deepseek';

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
  const [style, setStyle] = useState('专业');
  const [keywords, setKeywords] = useState('');
  const [length, setLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

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
  
  // 生成按钮点击处理函数
  const handleGenerate = async () => {
    if (!topic) {
      alert('请至少输入一个主题');
      return;
    }
    
    setIsGenerating(true);
    setContent(''); // 清空之前的内容
    
    try {
      // 调用带有详细参数的函数
      const generatedContent = await generateBlogContent({
        title: title || `关于${topic}的分析`, 
        topic,
        style,
        keywords,
        length
      });
      
      // 使用生成的内容更新状态
      setContent(generatedContent);
      console.log('生成的内容:', generatedContent.substring(0, 100) + '...');
    } catch (error) {
      console.error('生成内容失败:', error);
      setError('生成内容时出错，请稍后再试');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 保存博客
  const saveBlog = async () => {
    // 使用 topic 作为默认标题
    const finalTitle = title || `关于${topic}的分析`;
    
    if (!topic || !content) {
      alert('主题和内容不能为空');
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
      console.log('准备保存博客:', { title: finalTitle, contentLength: content.length, userId });
      
      // 使用 finalTitle 而不是 title
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: finalTitle,
          content,
          author_id: userId,
          published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('保存博客错误:', error);
        throw error;
      }
      
      alert('博客保存成功！');
      router.push('/dashboard');
    } catch (error) {
      console.error('保存博客失败:', error);
      alert(`保存失败: ${error.message || '请检查网络连接并重试'}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">加载中...</p>1. 登录您的 Gmail 账户
进入【设置】-> 【转发和 POP/IMAP】
确保 IMAP 已启用
如果您的 Gmail 是 G Suite 企业账户，可能需要管理员启用 SMTP 访问
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">创建新博客</h1>
      
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">使用 AI 生成内容</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">博客主题</label>
            <input
              type="text"
              placeholder="例如：人工智能、南京旅游、健康饮食..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">博客标题 (可选)</label>
            <input
              type="text"
              placeholder="留空将自动生成"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">写作风格</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="专业">专业/学术</option>
              <option value="通俗">通俗易懂</option>
              <option value="幽默">幽默诙谐</option>
              <option value="故事">故事性</option>
              <option value="深度">深度分析</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">文章长度</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">短文 (约500字)</option>
              <option value="medium">中等 (约1000字)</option>
              <option value="long">长文 (约2000字)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关键词 (可选)</label>
            <input
              type="text"
              placeholder="用逗号分隔多个关键词"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? '生成中...' : '生成博客内容'}
          </button>
        </div>
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