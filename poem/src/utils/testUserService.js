import userService from '../services/userService.js'

// 测试用户登录注册功能
async function testUserService() {
  console.log('开始测试用户服务...')
  
  try {
    // 测试用户注册
    console.log('\n1. 测试用户注册...')
    const registerResult = await userService.register('testuser', 'testpassword123')
    console.log('注册结果:', registerResult)
    
    if (registerResult.success) {
      console.log('✅ 用户注册成功')
    } else {
      console.log('❌ 用户注册失败:', registerResult.message)
    }
    
    // 测试用户登录
    console.log('\n2. 测试用户登录...')
    const loginResult = await userService.login('testuser', 'testpassword123')
    console.log('登录结果:', loginResult)
    
    if (loginResult.success) {
      console.log('✅ 用户登录成功')
      
      // 测试获取用户信息
      console.log('\n3. 测试获取用户信息...')
      const userInfoResult = await userService.getUserInfo(loginResult.user.id)
      console.log('用户信息结果:', userInfoResult)
      
      if (userInfoResult.success) {
        console.log('✅ 获取用户信息成功')
      } else {
        console.log('❌ 获取用户信息失败:', userInfoResult.message)
      }
    } else {
      console.log('❌ 用户登录失败:', loginResult.message)
    }
    
    // 测试用户名检查
    console.log('\n4. 测试用户名检查...')
    const checkResult = await userService.checkUserExists('testuser')
    console.log('用户名检查结果:', checkResult)
    
    if (checkResult.exists) {
      console.log('✅ 用户名检查成功')
    } else {
      console.log('❌ 用户名检查失败:', checkResult.error)
    }
    
    // 测试错误的密码登录
    console.log('\n5. 测试错误密码登录...')
    const wrongPasswordResult = await userService.login('testuser', 'wrongpassword')
    console.log('错误密码登录结果:', wrongPasswordResult)
    
    if (!wrongPasswordResult.success) {
      console.log('✅ 错误密码登录验证成功')
    } else {
      console.log('❌ 错误密码登录验证失败')
    }
    
    // 测试不存在的用户名
    console.log('\n6. 测试不存在的用户名...')
    const nonexistentUserResult = await userService.login('nonexistentuser', 'password')
    console.log('不存在的用户名登录结果:', nonexistentUserResult)
    
    if (!nonexistentUserResult.success) {
      console.log('✅ 不存在的用户名验证成功')
    } else {
      console.log('❌ 不存在的用户名验证失败')
    }
    
    console.log('\n✅ 用户服务测试完成!')
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
  }
}

// 如果直接运行此文件，则执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testUserService()
}

export default testUserService