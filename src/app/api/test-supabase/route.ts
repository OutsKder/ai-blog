import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 使用服务端角色密钥而不是匿名密钥
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // 尝试查询 posts 表
    const { data, error, status } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ success: false, message: '查询失败', error }, { status: 500 });
    }
    
    // 尝试获取表格详情
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'posts' })
      .single();
    
    return NextResponse.json({
      success: true,
      message: '数据库连接正常',
      data,
      tableExists: !error && status !== 406,
      tableInfo: tableInfo || '未能获取表格信息'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '测试失败', error: error.message },
      { status: 500 }
    );
  }
} 