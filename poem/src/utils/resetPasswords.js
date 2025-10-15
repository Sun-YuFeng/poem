import { supabase } from './supabase.js'

// 重置密码为正确的哈希值
async function resetPasswords() {
  console.log('🔄 重置密码哈希值...\n')
  
  // 与前端一致的哈希函数（只哈希一次）
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
    // 直接使用原始明文密码计算正确的哈希值
    const correctHashes = {
      'admin': simpleHash('-479308479'),
      'user': simpleHash('2358688')
    }
    
    console.log('正确的哈希值:')
    console.log('  admin:', correctHashes.admin)
    console.log('  user:', correctHashes.user)
    
    // 重置密码
    console.log('\n重置密码...')
    
    for (const [username, correctHash] of Object.entries(correctHashes)) {
      const { error } = await supabase
        .from('users')
        .update({ password: correctHash })
        .eq('username', username)
      
      if (error) {
        console.log(`❌ 重置 ${username} 失败:`, error.message)
      } else {
        console.log(`✅ 重置 ${username}: 密码 -> "${correctHash}"`)
      }
    }
    
    // 验证重置结果
    console.log('\n验证重置结果...')
    
    const { data: users } = await supabase
      .from('users')
      .select('username, password')
    
    console.log('数据库中的当前哈希值:')
    users.forEach(user => {
      console.log(`  ${user.username}: "${user.password}"`)
      console.log(`  正确性: ${user.password === correctHashes[user.username] ? '✅' : '❌'}`)
    })
    
    console.log('\n🎉 重置完成！现在可以正常登录了。')
    
  } catch (error) {
    console.log('❌ 重置过程中出错:', error.message)
  }
}

resetPasswords()