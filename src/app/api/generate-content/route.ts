import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    console.log('收到内容生成请求:', requestData);
    
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API 密钥未配置，请检查环境变量');
    }
    
    const { title, topic, style, keywords, length } = requestData;
    
    // 构建提示词
    const fullPrompt = `
请生成一篇关于"${topic}"的博客文章，标题为"${title}"，要求如下：
- 风格：${style || '专业'}
- 长度：${length === 'short' ? '短文（约500字）' : length === 'medium' ? '中等（约1000字）' : '长文（约2000字）'}
${keywords ? `- 需要包含的关键词：${keywords}` : ''}
- 要求：内容丰富、结构清晰、语言流畅
- 包含：引言、正文（至少3个小节）和结论
- 正文部分应该包含多个小节，每个小节都有明确的主题
`;
    
    console.log('正在调用 AI API...');
    console.log('使用的 API URL:', process.env.DEEPSEEK_API_URL);
    
    // 使用自定义 API 端点
    const response = await fetch(process.env.DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一位专业的博客作家，擅长创作高质量、结构清晰的文章。"
          },
          {
            role: "user",
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', response.status, errorText);
      throw new Error(`API请求失败 (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('API返回数据结构:', data);
      throw new Error('API返回内容为空');
    }
    
    return NextResponse.json({ content });
    
  } catch (error: any) {
    console.error('API调用失败:', error);
    return NextResponse.json(
      { error: error.message || '生成内容失败' },
      { status: 500 }
    );
  }
} 