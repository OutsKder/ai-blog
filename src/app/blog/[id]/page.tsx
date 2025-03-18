'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const blogId = params.id as string;
    const blogData = localStorage.getItem(`blog_${blogId}`);
    
    if (blogData) {
      setBlog(JSON.parse(blogData));
    } else {
      // 博客不存在，重定向到博客列表
      router.push('/blogs');
    }
    
    setLoading(false);
  }, [params.id, router]);
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p>加载中...</p>
      </div>
    );
  }
  
  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p>博客不存在</p>
        <Link href="/blogs" className="text-blue-600 hover:underline">
          返回博客列表
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/blogs" className="text-blue-600 hover:underline">
          ← 返回博客列表
        </Link>
      </div>
      
      <article className="prose lg:prose-xl max-w-none">
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-8">
          <span>作者: {blog.authorName || '匿名用户'}</span>
          <span className="mx-2">•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
        
        <div className="whitespace-pre-wrap">
          {blog.content.split('\n').map((paragraph: string, index: number) => (
            paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
          ))}
        </div>
      </article>
    </div>
  );
} 