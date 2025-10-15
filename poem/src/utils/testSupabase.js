import { supabase } from './supabase.js'

// 测试Supabase连接和数据库表
async function testSupabaseConnection() {
  console.log('正在测试Supabase连接...')
  
  try {
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ users表不存在，需要创建数据库表')
        return { connected: true, tableExists: false }
      } else {
        console.log('❌ Supabase连接错误:', error.message)
        return { connected: false, tableExists: false, error: error.message }
      }
    }
    
    console.log('✅ Supabase连接成功，users表已存在')
    console.log('📊 当前用户数量:', data?.length || 0)
    return { connected: true, tableExists: true, userCount: data?.length || 0 }
    
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message)
    return { connected: false, tableExists: false, error: error.message }
  }
}

// 运行测试
testSupabaseConnection().then(result => {
  console.log('\n测试结果:', result)
  
  if (!result.connected) {
    console.log('\n⚠️ 请检查以下配置：')
    console.log('1. Supabase项目ID是否正确')
    console.log('2. 匿名密钥是否正确')
    console.log('3. 网络连接是否正常')
  } else if (!result.tableExists) {
    console.log('\n📋 需要创建users表，请执行以下SQL：')
    console.log(`
-- 在Supabase SQL编辑器中执行以下SQL

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 插入示例数据（可选）
INSERT INTO users (username, password) VALUES 
  ('admin', '-479308479'),
  ('user', '2358688')
ON CONFLICT (username) DO NOTHING;
    `)
  }
})