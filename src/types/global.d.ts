// 创建通用错误接口
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// 用户接口
export interface User {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
}

// 博客接口
export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  created_at: string;
  topic?: string;
  style?: string;
  keywords?: string;
  length?: string;
} 