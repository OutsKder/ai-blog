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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查认证状态并加载用户数据
    async function loadUserAndPosts() {
      try {
        // 获取当前会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          router.push('/login');
          return;
        }

        // 获取用户信息
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;
        setUser(userData);

        // 获取用户的博客文章
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', session.user.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);

      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserAndPosts();
  }, [router]);

  // 添加删除博客的处理函数
  const handleDeletePost = async (postId: string) => {
    if (!confirm('确定要删除这篇博客吗？此操作不可恢复。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // 从本地状态中移除被删除的博客
      setPosts(posts.filter(post => post.id !== postId));
      alert('博客已删除');
    } catch (error) {
      console.error('删除博客失败:', error);
      alert('删除失败，请重试');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 账户信息部分 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">账户信息</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
            {user?.name?.[0]?.toUpperCase() || '用'}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.name || '未设置姓名'}</h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* 我的博客部分 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">我的博客</h2>
          <Link 
            href="/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            写新博客
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">您还没有创建任何博客</p>
            <Link 
              href="/create" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              创建第一篇博客
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/posts/${post.id}`}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    >
                      查看
                    </Link>
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content.substring(0, 200)}...
                </p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {new Date(post.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    post.published 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {post.published ? '已发布' : '草稿'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 