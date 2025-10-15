import { supabase } from './supabase.js'

// 调试密码哈希问题
async function debugPassword() {
  console.log('🔍 调试密码哈希问题...\n')
  
  try {
    // 1. 查看数据库中的实际密码值
    console.log('1. 查看数据库中的用户数据:')
    const { data: users, error } = await supabase
      .from('users')
      .select('username, password')
    
    if (error) {
      console.log('❌ 查询失败:', error.message)
      return
    }
    
    users.forEach(user => {
      console.log(`   ${user.username}: "${user.password}"`)
    })
    
    // 2. 测试当前哈希算法
    console.log('\n2. 测试当前哈希算法:')
    
    function simpleHash(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return hash.toString()
    }
    
    const testPasswords = ['-479308479', '2358688']
    testPasswords.forEach(pwd => {
      const hashed = simpleHash(pwd)
      console.log(`   密码 "${pwd}" -> 哈希值: ${hashed}`)
    })
    
    // 3. 测试登录查询
    console.log('\n3. 测试登录查询:')
    
    const testLogin = async (username, password) => {
      const hashedPassword = simpleHash(password)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', hashedPassword)
        .single()
      
      if (error) {
        console.log(`   ${username}: ❌ ${error.message}`)
      } else if (data) {
        console.log(`   ${username}: ✅ 登录成功`)
      } else {
        console.log(`   ${username}: ❌ 用户名或密码错误`)
      }
    }
    
    await testLogin('admin', '-479308479')
    await testLogin('user', '2358688')
    
    console.log('\n💡 解决方案:')
    console.log('   如果哈希值不匹配，可能需要:')
    console.log('   1. 更新数据库中的密码为正确的哈希值')
    console.log('   2. 或者重新插入用户数据')
    
  } catch (error) {
    console.log('❌ 调试过程中出错:', error.message)
  }
}

debugPassword()