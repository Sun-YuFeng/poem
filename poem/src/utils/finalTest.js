import { supabase } from './supabase.js'

// 最终测试 - 精确检查登录功能
async function finalTest() {
  console.log('🎯 最终登录功能测试...\n')
  
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
    // 1. 检查数据库中的实际密码哈希值
    console.log('1. 检查数据库密码哈希值:')
    const { data: users, error } = await supabase
      .from('users')
      .select('username, password')
    
    if (error) {
      console.log('❌ 查询失败:', error.message)
      return
    }
    
    users.forEach(user => {
      console.log(`   ${user.username}: 哈希密码 "${user.password}"`)
    })
    
    // 2. 计算预期的哈希值
    console.log('\n2. 计算预期的哈希值:')
    const testCases = [
      { username: 'admin', password: '-479308479' },
      { username: 'user', password: '2358688' }
    ]
    
    testCases.forEach(test => {
      const expectedHash = simpleHash(test.password)
      console.log(`   ${test.username}: 密码 "${test.password}" -> 预期哈希 "${expectedHash}"`)
    })
    
    // 3. 精确测试登录查询
    console.log('\n3. 精确测试登录查询:')
    
    for (const test of testCases) {
      const expectedHash = simpleHash(test.password)
      
      console.log(`\n   测试 ${test.username}:`)
      console.log(`   预期哈希: ${expectedHash}`)
      
      // 方法1: 使用更宽松的查询
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('username', test.username)
        .eq('password', expectedHash)
      
      if (queryError) {
        console.log(`   ❌ 查询错误: ${queryError.message}`)
      } else if (userData && userData.length > 0) {
        console.log(`   ✅ 登录成功！找到用户`)
        console.log(`      数据库哈希: ${userData[0].password}`)
        console.log(`      匹配状态: ${userData[0].password === expectedHash ? '匹配' : '不匹配'}`)
      } else {
        console.log(`   ❌ 登录失败 - 未找到匹配的用户`)
        
        // 检查用户名是否存在
        const { data: usernameCheck } = await supabase
          .from('users')
          .select('password')
          .eq('username', test.username)
          .single()
        
        if (usernameCheck) {
          console.log(`      用户名存在，但密码哈希不匹配`)
          console.log(`      数据库中的哈希: ${usernameCheck.password}`)
          console.log(`      预期的哈希: ${expectedHash}`)
        } else {
          console.log(`      用户名不存在`)
        }
      }
    }
    
    console.log('\n💡 问题诊断:')
    console.log('   如果哈希值不匹配，可能需要:')
    console.log('   1. 重新运行修复脚本确保密码正确哈希')
    console.log('   2. 或者直接在Supabase控制台手动更新密码')
    
  } catch (error) {
    console.log('❌ 测试过程中出错:', error.message)
  }
}

finalTest()