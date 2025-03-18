require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')
const { createClient } = require('@supabase/supabase-js')

// MongoDB 连接
const mongoClient = new MongoClient(process.env.DATABASE_URL)

// Supabase 连接
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // 注意：这需要是服务密钥，不是匿名密钥
)

async function migrateUsers() {
  try {
    await mongoClient.connect()
    const db = mongoClient.db()
    const usersCollection = db.collection('users')
    
    const users = await usersCollection.find({}).toArray()
    
    for (const user of users) {
      // 转换用户数据结构
      const supabaseUser = {
        id: user._id.toString(), // 或生成新的 UUID
        email: user.email,
        name: user.name,
        avatar_url: user.image,
        created_at: user.createdAt || new Date()
      }
      
      // 插入到 Supabase
      const { error } = await supabase
        .from('users')
        .insert(supabaseUser)
      
      if (error) console.error('Error inserting user:', error)
    }
    
    console.log('Users migration completed')
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await mongoClient.close()
  }
}

async function migratePosts() {
  // 类似的逻辑用于迁移文章数据
}

async function main() {
  await migrateUsers()
  await migratePosts()
  console.log('Migration completed')
}

main() 