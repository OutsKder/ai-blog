import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

function analyzeConnectionString() {
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('错误: DATABASE_URL 环境变量未设置');
    return;
  }
  
  // 解析连接字符串
  const regex = /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@([^\/\?]+)(?:\/([^\?]+))?(\?.*)?/;
  const match = uri.match(regex);
  
  if (!match) {
    console.error('错误: 无法解析连接字符串格式');
    return;
  }
  
  const [_, protocol, username, password, host, database, query] = match;
  
  console.log('========= MongoDB连接字符串分析 =========');
  console.log('协议类型:', protocol ? 'mongodb+srv (DNS SRV)' : 'mongodb (直连)');
  console.log('用户名:', username);
  console.log('密码长度:', password.length, '字符');
  
  // 检查密码中的特殊字符
  const specialChars = password.match(/[^A-Za-z0-9]/g);
  if (specialChars) {
    console.log('密码中包含以下特殊字符:', [...new Set(specialChars)].join(' '));
    
    // 检查特殊字符是否需要被编码
    const needsEncoding = specialChars.some(char => {
      const code = char.charCodeAt(0);
      return char === '%' || char === '@' || char === ':' || char === '/' || 
        char === '+' || char === ' ' || code < 32 || code > 127;
    });
    
    if (needsEncoding) {
      console.log('⚠️ 警告: 密码中有需要进行URL编码的字符');
      
      // 提供经过编码的密码版本
      const encodedPassword = encodeURIComponent(password);
      console.log('建议的编码后密码:', encodedPassword);
      
      // 构建新的连接字符串
      const newUri = uri.replace(
        `${username}:${password}@`, 
        `${username}:${encodedPassword}@`
      );
      
      console.log('建议更新后的连接字符串:');
      console.log(newUri);
    } else {
      console.log('✅ 密码中的特殊字符不需要额外编码');
    }
  } else {
    console.log('✅ 密码中不包含特殊字符');
  }
  
  console.log('主机:', host);
  console.log('数据库:', database || '(默认)');
  
  if (query) {
    console.log('查询参数:', query);
    // 解析查询参数
    const params = new URLSearchParams(query.substring(1));
    const options = {};
    
    for (const [key, value] of params.entries()) {
      options[key] = value;
    }
    
    console.log('连接选项:', options);
  }
  
  console.log('========= 分析完成 =========');
}

analyzeConnectionString(); 