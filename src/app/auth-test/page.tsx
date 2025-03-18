'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AuthTestPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const handleGoogleLogin = async () => {
    setMessage('开始测试 Google 登录...');
    setError('');

    try {
      // 创建一个新的 Supabase 客户端实例，避免潜在的配置问题
      const supabase = createClient(
        'https://shkjpiuxllglleviigpp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoa2pwaXV4bGxnbGxldmlpZ3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzE1OTksImV4cCI6MjA1NzcwNzU5OX0.TJY0RMbrgp1hXRsgQhpz1dSVbLeQlI0PUDV_WEtgDb4'
      );
      
      // 最简单的 Google 登录调用
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      
      if (error) throw error;
      
      setMessage('获取到 OAuth URL，准备重定向...');
      console.log('OAuth URL:', data.url);
      
      // 重定向到 Google 登录
      window.location.href = data.url;
    } catch (err) {
      console.error('Google 登录测试失败:', err);
      setError(err.message || '未知错误');
    }
  };
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Auth 测试页面</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          错误: {error}
        </div>
      )}
      
      <button
        onClick={handleGoogleLogin}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        独立测试 Google 登录
      </button>
      
      <div className="mt-8 p-4 bg-gray-50 rounded text-sm">
        <p><strong>说明:</strong> 此页面使用硬编码的 Supabase URL 和密钥直接测试 Google 登录，绕过应用中的任何自定义配置。</p>
      </div>
    </div>
  );
} 