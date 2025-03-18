import { connectToDatabase } from '../lib/mongodb';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    console.log('尝试连接到 MongoDB...');
    const db = await connectToDatabase();
    console.log('连接成功!');
    
    // 获取用户集合
    const usersCollection = db.collection('users');
    
    // 检查测试用户是否已存在
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('测试用户已存在，ID:', existingUser._id);
      console.log('可以使用以下信息登录:');
      console.log('邮箱: test@example.com');
      console.log('密码: password123');
      process.exit(0);
      return;
    }
    
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const result = await usersCollection.insertOne({
      name: '测试用户',
      email: 'test@example.com',
      password: hashedPassword,
      createdAt: new Date()
    });
    
    console.log('测试用户创建成功，ID:', result.insertedId);
    console.log('可以使用以下信息登录:');
    console.log('邮箱: test@example.com');
    console.log('密码: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('创建测试用户失败:', error);
    process.exit(1);
  }
}

createTestUser(); 