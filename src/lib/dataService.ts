// 用户类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// 博客类型定义
export interface Blog {
  id: string;
  title: string;
  content: string;
  topic: string;
  style?: string;
  keywords?: string;
  length: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

// API 请求基础函数
async function fetchAPI(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}

// 用户服务
export const userService = {
  // 注册新用户
  async register(name: string, email: string, password: string): Promise<User> {
    const data = await fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    return data.user;
  },

  // 用户登录
  async login(email: string, password: string): Promise<User> {
    try {
      console.log('调用登录 API...');
      const data = await fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('登录 API 响应:', data);
      
      // 在本地存储中保存一些用户信息，用于 UI 显示
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 获取当前登录用户
  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await fetchAPI('/api/auth/me');
      return data.user;
    } catch (error) {
      return null;
    }
  },

  // 退出登录
  async logout(): Promise<void> {
    await fetchAPI('/api/auth/logout', { method: 'POST' });
  }
};

// 博客服务
export const blogService = {
  // 获取所有博客
  async getBlogs(): Promise<Blog[]> {
    const data = await fetchAPI('/api/blogs');
    return data.blogs;
  },

  // 通过ID获取博客
  async getBlogById(id: string): Promise<Blog | null> {
    try {
      const data = await fetchAPI(`/api/blogs/${id}`);
      return data.blog;
    } catch (error) {
      return null;
    }
  },

  // 获取用户的博客
  async getUserBlogs(): Promise<Blog[]> {
    const data = await fetchAPI('/api/blogs/user');
    return data.blogs;
  },

  // 创建新博客
  async createBlog(blogData: {
    title: string;
    topic: string;
    style?: string;
    keywords?: string;
    length: string;
  }): Promise<Blog> {
    const data = await fetchAPI('/api/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
    
    return data.blog;
  },
  
  // 生成博客内容
  async generateContent(
    title: string,
    topic: string,
    style: string,
    length: string
  ): Promise<string> {
    const data = await fetchAPI('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ title, topic, style, length }),
    });
    
    return data.content;
  }
}; 