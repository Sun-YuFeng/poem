import { supabase } from '../utils/supabase.js'

// 简单的哈希函数（与前端保持一致）
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// 用户服务类
class UserService {
  // 用户注册
  async register(username, password) {
    try {
      // 检查用户名是否已存在
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('检查用户名时出错')
      }

      if (existingUser) {
        throw new Error('该用户名已存在')
      }

      // 对密码进行哈希处理
      const hashedPassword = simpleHash(password)

      // 插入新用户
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            username: username, 
            password: hashedPassword,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        throw new Error('注册失败: ' + error.message)
      }

      // 创建用户信息记录
      const user = data[0]
      const { error: infoError } = await supabase
        .from('user_info')
        .insert([
          {
            user_id: user.id,
            nickname: username,
            gender: 'male',
            email: '',
            bio: '',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          }
        ])

      if (infoError) {
        console.error('创建用户信息失败:', infoError)
        // 不抛出错误，因为用户注册已经成功
      }

      return { success: true, user: user }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // 用户登录
  async login(username, password) {
    try {
      // 对密码进行哈希处理
      const hashedPassword = simpleHash(password)

      // 查询用户
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', hashedPassword)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('用户名或密码错误')
        }
        throw new Error('登录失败: ' + error.message)
      }

      return { success: true, user: data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // 检查用户是否存在
  async checkUserExists(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error('检查用户时出错')
      }

      return { exists: !!data }
    } catch (error) {
      return { exists: false, error: error.message }
    }
  }

  // 获取用户信息
  async getUserInfo(userId) {
    try {
      console.log('getUserInfo - 开始查询用户信息，用户ID:', userId)
      
      const { data, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('getUserInfo - 查询结果:', { data, error })

      if (error) {
        console.log('getUserInfo - 查询错误:', error)
        if (error.code === 'PGRST116') {
          // 用户信息不存在，创建默认记录
          console.log('getUserInfo - 用户信息不存在，创建默认记录')
          return await this.createDefaultUserInfo(userId)
        }
        throw new Error('获取用户信息失败: ' + error.message)
      }

      console.log('getUserInfo - 查询成功，返回数据:', data)
      return { success: true, userInfo: data }
    } catch (error) {
      console.error('getUserInfo - 异常:', error)
      return { success: false, message: error.message }
    }
  }

  // 更新用户信息
  async updateUserInfo(userId, userInfo) {
    try {
      const { data, error } = await supabase
        .from('user_info')
        .update({
          ...userInfo,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()

      if (error) {
        throw new Error('更新用户信息失败: ' + error.message)
      }

      return { success: true, userInfo: data[0] }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // 创建默认用户信息
  async createDefaultUserInfo(userId) {
    try {
      let username = '诗词爱好者'
      
      // 从localStorage获取用户名
      const userData = localStorage.getItem('currentUser')
      if (userData) {
        const localUser = JSON.parse(userData)
        username = localUser.username || '诗词爱好者'
      }

      const { data, error } = await supabase
        .from('user_info')
        .insert([
          {
            user_id: userId,
            nickname: username,
            gender: 'male',
            email: '',
            bio: '',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          }
        ])
        .select()

      if (error) {
        throw new Error('创建用户信息失败: ' + error.message)
      }

      return { success: true, userInfo: data[0] }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // 获取所有用户（仅用于调试）
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')

      if (error) {
        throw new Error('获取用户列表失败: ' + error.message)
      }

      return { success: true, users: data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

export default new UserService()