// 这里是与 DeepSeek 模型交互的工具函数
export async function generateBlogContent(prompt: string | { 
  title: string, 
  topic: string, 
  style?: string, 
  keywords?: string,
  length?: string 
}): Promise<string> {
  try {
    // 统一处理不同的输入格式
    let requestData;
    
    if (typeof prompt === 'string') {
      requestData = { topic: prompt, title: `关于${prompt}的分析` };
    } else {
      requestData = prompt;
    }

    console.log('正在调用内容生成API...');
    
    // 调用服务器端 API 路由
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content;
    
  } catch (error: any) {
    console.error('内容生成失败:', error);
    return `生成内容失败: ${error.message || '未知错误'}。请稍后再试。`;
  }
} 