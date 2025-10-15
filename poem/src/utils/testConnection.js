import { supabase } from './supabase.js'

// 测试连接和基本功能
async function testConnection() {
  console.log('🧪 测试Supabase连接和功能...\n')
  
  try {
    // 测试连接和表访问
    console.log('1. 测试基本连接...')
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(2)
    
    if (error) {
      console.log('❌ 连接失败:', error.message)
      return
    }
    
    console.log('✅ 连接成功！')
    console.log('📊 当前用户数量:', data.length)
    
    if (data.length > 0) {
      console.log('👥 现有用户:')
      data.forEach(user => {
        console.log(`   - ${user.username} (创建于: ${new Date(user.created_at).toLocaleDateString()})`)
      })
    }
    
    // 测试登录功能
    console.log('\n2. 测试登录功能...')
    const loginResult = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('password', '-479308479')
      .single()
    
    if (loginResult.error) {
      console.log('❌ 登录测试失败:', loginResult.error.message)
    } else if (loginResult.data) {
      console.log('✅ 登录测试成功！可以正常访问admin用户')
    } else {
      console.log('⚠️  admin用户不存在或密码不匹配')
    }
    
    console.log('\n🎉 测试完成！应用已准备好使用。')
    console.log('\n📝 下一步：')
    console.log('   1. 访问 http://localhost:5173')
    console.log('   2. 使用 admin/-479308479 或 user/2358688 登录')
    console.log('   3. 测试注册新用户功能')
    
  } catch (error) {
    console.log('❌ 测试过程中出错:', error.message)
  }
}

// 运行测试
testConnection()