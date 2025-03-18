import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function testRegisterUser() {
  let client;
  
  try {
    console.log('========= 测试用户注册过程 =========');
    
    // 1. 连接到数据库
    console.log('尝试连接到 MongoDB...');
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ 数据库连接成功!');
    
    const db = client.db();
    console.log('数据库名称:', db.databaseName);
    
    // 2. 创建测试用户数据
    const testUser = {
      name: "测试注册用户",
      email: "test-register@example.com",
      password: "test-password-123"
    };
    console.log('测试用户数据准备完成');
    
    // 3. 检查用户是否已存在
    console.log('检查用户是否已存在...');
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('用户已存在, 删除已有用户重新创建...');
      await usersCollection.deleteOne({ email: testUser.email });
      console.log('已删除已有用户');
    }
    
    // 4. 加密密码
    console.log('加密密码...');
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    console.log('密码加密完成');
    
    // 5. 插入新用户
    console.log('插入新用户...');
    const result = await usersCollection.insertOne({
      name: testUser.name,
      email: testUser.email,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    if (result.acknowledged) {
      console.log('✅ 测试用户创建成功！ID:', result.insertedId);
      
      // 6. 验证用户是否已创建
      console.log('验证用户是否已创建...');
      const createdUser = await usersCollection.findOne({ _id: result.insertedId });
      
      if (createdUser) {
        console.log('✅ 验证成功，完整的用户数据:');
        console.log(JSON.stringify({
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          passwordHash: createdUser.password.substring(0, 10) + '...',
          createdAt: createdUser.createdAt
        }, null, 2));
        
        console.log('测试登录信息:');
        console.log('邮箱:', testUser.email);
        console.log('密码:', testUser.password);
      } else {
        console.log('❌ 验证失败，无法找到刚刚创建的用户');
      }
    } else {
      console.log('❌ 测试用户创建失败');
    }
    
    console.log('========= 测试完成 =========');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('数据库连接已关闭');
    }
  }
}

testRegisterUser(); 