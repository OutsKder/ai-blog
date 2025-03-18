import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// 使用正确的类型定义
type Props = {
  params: { id: string }
}

// 注意页面组件的参数类型
export default async function BlogPage({ params }: Props) {
  const { id } = params;
  
  // 获取博客内容的逻辑...
}

// 如果有动态元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  
  // 生成元数据的逻辑...
} 