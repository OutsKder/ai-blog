import { connectToDatabase } from '../lib/mongodb';
import bcrypt from 'bcrypt';

async function createInitialUser() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // 检查是否已存在测试用户
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('测试用户已存在，无需创建');
      return;
    }
    
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await usersCollection.insertOne({
      name: '测试用户',
      email: 'test@example.com',
      password: hashedPassword,
      createdAt: new Date()
    });
    
    console.log('测试用户创建成功');
  } catch (error) {
    console.error('创建测试用户时出错:', error);
  }
}

createInitialUser(); 