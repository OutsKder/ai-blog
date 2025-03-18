'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, users(name, email)')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('加载博客失败:', error);
        alert('加载博客失败');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [params.id, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  if (!post) {
    return <div className="text-center py-12">博客不存在</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline"
        >
          ← 返回仪表板
        </Link>
      </div>

      <article className="prose lg:prose-xl mx-auto">
        <h1>{post.title}</h1>
        
        <div className="flex justify-between items-center text-gray-500 text-sm mb-8">
          <span>
            作者：{post.users?.name || '未知作者'}
          </span>
          <span>
            {new Date(post.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        <div className="whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
    </div>
  );
} 