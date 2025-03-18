// 过渡文件 - 应用已迁移到 Supabase
console.warn('项目已迁移到 Supabase，此 MongoDB 连接文件不再使用');

export async function connectToDatabase() {
  console.warn('connectToDatabase: 应用已迁移到 Supabase');
  return { db: null, client: null };
}

// 其他可能被导入的函数
export const ObjectId = (id) => id; 