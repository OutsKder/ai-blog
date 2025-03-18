import { connectToDatabase } from '../lib/mongodb';

async function listUsers() {
  try {
    console.log('尝试连接到 MongoDB...');
    const db = await connectToDatabase();
    console.log('连接成功!');
    
    // 获取用户集合
    const usersCollection = db.collection('users');
    
    // 查询所有用户
    const users = await usersCollection.find({}).toArray();
    
    if (users.length === 0) {
      console.log('数据库中没有用户记录');
    } else {
      console.log(`共找到 ${users.length} 个用户:`);
      users.forEach(user => {
        console.log(`- ID: ${user._id}`);
        console.log(`  名称: ${user.name}`);
        console.log(`  邮箱: ${user.email}`);
        console.log(`  创建时间: ${user.createdAt}`);
        console.log('-------------------');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('连接或查询失败:', error);
    process.exit(1);
  }
}

listUsers(); 