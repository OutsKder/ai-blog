import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 从 Supabase 获取博客列表
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('获取博客列表时出错:', error);
      return NextResponse.json(
        { message: '获取博客列表失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ blogs: data });
  } catch (error) {
    console.error('获取博客列表时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, /* authorId, */ authorName, topic, style, keywords, length } = await request.json();
    
    // 验证授权
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }
    
    // 创建博客
    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          content,
          author_id: session.user.id,
          author_name: authorName || session.user.email?.split('@')[0] || '匿名用户',
          topic,
          style,
          keywords,
          length,
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
      message: '博客创建成功',
      blog: data[0]
    });
  } catch (error) {
    console.error('创建博客时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 