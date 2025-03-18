import { MongoClient } from 'mongodb';

async function directDatabaseTest() {
  let client;
  
  try {
    console.log('尝试直接连接到 MongoDB...');
    const uri = process.env.DATABASE_URL;
    console.log('使用连接字符串:', uri);
    
    client = new MongoClient(uri);
    await client.connect();
    console.log('直接连接成功!');
    
    const db = client.db();
    console.log('数据库名称:', db.databaseName);
    
    // 尝试创建一个测试文档
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({
      test: true,
      createdAt: new Date()
    });
    
    console.log('测试文档创建结果:', result.acknowledged ? '成功' : '失败');
    
    // 尝试读取测试文档
    const testDoc = await testCollection.findOne({ _id: result.insertedId });
    console.log('读取测试文档:', testDoc ? '成功' : '失败');
    
    // 尝试删除测试文档
    const deleteResult = await testCollection.deleteOne({ _id: result.insertedId });
    console.log('删除测试文档结果:', deleteResult.acknowledged ? '成功' : '失败');
    
    process.exit(0);
  } catch (error) {
    console.error('直接数据库测试失败:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('数据库连接已关闭');
    }
  }
}

directDatabaseTest(); 