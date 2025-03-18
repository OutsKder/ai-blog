import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateBlogContent } from '@/lib/deepseek';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 验证用户会话
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, topic, style, keywords, length } = body;
    
    // 验证必要的字段
    if (!title || !topic) {
      return NextResponse.json(
        { error: '标题和主题是必填项' },
        { status: 400 }
      );
    }
    
    // 构建提示词
    const prompt = `
      请生成一篇博客文章，要求如下：
      标题：${title}
      主题：${topic}
      风格：${style || '专业'}
      关键词：${keywords || ''}
      长度：${length || 'medium'}
      
      请生成一篇结构清晰、内容丰富的博客文章，包含引言、正文和结论。
      正文部分应该包含多个小节，每个小节都有明确的主题。
      请确保文章语言流畅，逻辑清晰，并且与主题高度相关。
    `;
    
    // 调用 DeepSeek API 生成内容
    const blogContent = await generateBlogContent(prompt);
    
    // 将博客保存到数据库
    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          content: blogContent,
          topic,
          style: style || '专业',
          keywords: keywords || '',
          length: length || 'medium',
          author_id: session.user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (error) {
      console.error('创建博客时出错:', error);
      return NextResponse.json(
        { message: '创建博客失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      id: data[0].id,
      title: data[0].title,
      content: data[0].content,
      createdAt: data[0].created_at
    });
  } catch (error) {
    console.error('生成博客时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 