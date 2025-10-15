import { supabase } from './supabase.js'

// 修复密码哈希问题 - 将数据库中的明文密码更新为哈希值
async function fixPasswords() {
  console.log('🔧 修复密码哈希问题...\n')
  
  // 与前端一致的哈希函数
  function simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
  }
  
  try {
    // 1. 获取当前用户数据
    console.log('1. 获取当前用户数据...')
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, password')
    
    if (error) {
      console.log('❌ 查询失败:', error.message)
      return
    }
    
    console.log('📊 找到用户:', users.length)
    users.forEach(user => {
      console.log(`   ${user.username}: 当前密码 "${user.password}"`)
    })
    
    // 2. 更新密码为哈希值
    console.log('\n2. 更新密码为哈希值...')
    
    for (const user of users) {
      const hashedPassword = simpleHash(user.password)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id)
      
      if (updateError) {
        console.log(`❌ 更新 ${user.username} 失败:`, updateError.message)
      } else {
        console.log(`✅ 更新 ${user.username}: "${user.password}" -> "${hashedPassword}"`)
      }
    }
    
    // 3. 验证修复结果
    console.log('\n3. 验证修复结果...')
    
    const testLogin = async (username, plainPassword) => {
      const hashedPassword = simpleHash(plainPassword)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', hashedPassword)
        .single()
      
      if (error && error.code === 'PGRST116') {
        console.log(`   ${username}: ❌ 登录失败 - 密码不匹配`)
      } else if (error) {
        console.log(`   ${username}: ❌ 错误: ${error.message}`)
      } else if (data) {
        console.log(`   ${username}: ✅ 登录成功！`)
      }
    }
    
    await testLogin('admin', '-479308479')
    await testLogin('user', '2358688')
    
    console.log('\n🎉 修复完成！')
    console.log('📝 现在可以使用以下账号登录:')
    console.log('   用户名: admin, 密码: -479308479')
    console.log('   用户名: user, 密码: 2358688')
    
  } catch (error) {
    console.log('❌ 修复过程中出错:', error.message)
  }
}

fixPasswords()