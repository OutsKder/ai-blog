'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DebugPage() {
  const [status, setStatus] = useState('加载中...');
  const [envInfo, setEnvInfo] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    async function checkConnection() {
      try {
        setStatus('正在检查 Supabase 连接...');
        
        // 环境变量信息
        const envInfo = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置',
          hasSupabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
          nodeEnv: process.env.NODE_ENV,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '未设置'
        };
        setEnvInfo(envInfo);
        
        // 创建客户端
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // 测试连接
        const { data, error } = await supabase.from('blogs').select('count()').limit(1);
        
        if (error) {
          throw error;
        }
        
        setIsConnected(true);
        setStatus('成功连接到 Supabase!');
      } catch (error) {
        console.error('连接测试失败:', error);
        setStatus(`连接失败: ${error.message}`);
      }
    }
    
    checkConnection();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase 连接调试</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">连接状态:</h2>
        <p className={isConnected ? "text-green-600" : "text-red-600"}>
          {status}
        </p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">环境变量信息:</h2>
        <pre className="bg-gray-800 text-white p-3 rounded overflow-auto">
          {JSON.stringify(envInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
} 