import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RouteSegmentProps {
  params: {
    userId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteSegmentProps
) {
  try {
    const userId = params.userId;
    
    // 获取特定用户的博客
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ blogs: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 