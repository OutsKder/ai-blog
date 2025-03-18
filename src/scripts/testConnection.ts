import { connectToDatabase } from '../lib/mongodb';

async function testConnection() {
  try {
    console.log('尝试连接到 MongoDB...');
    const db = await connectToDatabase();
    console.log('连接成功!');
    
    // 尝试列出集合
    const collections = await db.listCollections().toArray();
    console.log('数据库中的集合:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('连接失败:', error);
    process.exit(1);
  }
}

testConnection(); 