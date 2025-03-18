'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import LogoutButton from '../../components/LogoutButton';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          // 未认证，重定向到登录页面
          router.push('/login');
          return;
        }
        
        setIsAuthenticated(true);
        setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户');
        setUserEmail(session.user.email || '');
        
        // 获取博客数据
        // 从本地存储获取博客（临时方案，之后应该从 Supabase 获取）
        const blogList = JSON.parse(localStorage.getItem('blogList') || '[]');
        const userBlogs: any[] = [];
        
        blogList.forEach((blogId: string) => {
          const blogData = localStorage.getItem(`blog_${blogId}`);
          if (blogData) {
            const blog = JSON.parse(blogData);
            if (blog.authorId === session.user.email) {
              userBlogs.push(blog);
            }
          }
        });
        
        // 按创建时间排序，最新的在前面
        userBlogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setBlogs(userBlogs);
      } catch (error) {
        console.error('认证检查错误:', error);
        // 出错时也重定向到登录页面
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  // 显示加载状态
  if (isLoading) {
    return <div className="p-8 text-center">正在加载...</div>;
  }
  
  // 只有认证后才显示仪表板内容
  if (!isAuthenticated) {
    return null; // 防止在重定向前闪现内容
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">欢迎回来, {userName}</h1>
        <button 
          onClick={() => router.push('/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          创建新博客
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">账户信息</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-gray-500">{userEmail}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">我的博客</h2>
        
        {blogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 mb-4">您还没有创建任何博客</p>
            <Link 
              href="/create" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              创建第一篇博客
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    <Link href={`/blog/${blog.id}`} className="hover:text-blue-600">
                      {blog.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.content.substring(0, 120)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>主题: {blog.topic}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LogoutButton />
    </div>
  );
} 