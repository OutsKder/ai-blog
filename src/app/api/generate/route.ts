import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 获取会话 cookie
    const sessionCookie = cookies().get('session');
    if (!sessionCookie) {
      return NextResponse.json(
        { message: '未登录' },
        { status: 401 }
      );
    }
    
    // 获取请求体
    const { title, topic, style, length } = await request.json();
    
    // 验证输入
    if (!title || !topic || !length) {
      return NextResponse.json(
        { message: '请提供所有必填字段' },
        { status: 400 }
      );
    }
    
    // 构建提示词
    const prompt = `
请生成一篇关于"${topic}"的博客文章，标题为"${title}"，要求如下：
- 风格：${style || '专业'}
- 长度：${length === 'short' ? '短文（约500字）' : length === 'medium' ? '中等（约1000字）' : '长文（约2000字）'}
- 要求：内容丰富、结构清晰、语言流畅
- 包含：引言、正文（至少3个小节）和结论
- 正文部分应该包含多个小节，每个小节都有明确的主题
- 请确保文章语言流畅，逻辑清晰，并且与主题高度相关
`;
    
    // 这里应该调用 DeepSeek API 生成内容
    // 为了演示，我们使用模拟内容
    const content = `# ${title}

## 引言

${topic}是一个非常有趣的主题。本文将探讨其主要方面和重要性。

## 主要内容

### 第一部分

这里是关于${topic}的第一个重要方面。这个部分详细讨论了相关的背景和基本概念。

### 第二部分

在这一部分中，我们将深入探讨${topic}的核心内容和关键要点。

### 第三部分

最后，我们来看看${topic}的应用场景和未来发展趋势。

## 结论

总结来说，${topic}是一个值得关注的领域，它具有广阔的发展前景和重要的实际意义。`;
    
    return NextResponse.json({
      content
    });
  } catch (error) {
    console.error('生成博客内容时出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 