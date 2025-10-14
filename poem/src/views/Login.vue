<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('admin')
const password = ref('-479308479')
const loading = ref(false)
const message = ref('')

// 简单的哈希函数（生产环境应使用更安全的哈希算法）
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// 初始化用户数据：若本地无 users，则从 public/users.json 读取作为种子
async function initUsers() {
  const key = 'users'
  const exist = localStorage.getItem(key)
  if (exist) return
  try {
    // 修复反引号转义问题，去掉多余的反斜杠
    const resp = await fetch('/users.json')
    if (!resp.ok) throw new Error('种子数据加载失败')
    const data = await resp.json()
    // 对种子数据中的密码进行哈希处理
    const hashedUsers = data.map(user => ({
      ...user,
      password: simpleHash(user.password)
    }))
    localStorage.setItem(key, JSON.stringify(hashedUsers))
  } catch (e) {
    console.error(e)
    // 若加载失败，至少写入一个空数组
    localStorage.setItem(key, JSON.stringify([]))
  }
}

function getUsers() {
  try {
    const raw = localStorage.getItem('users')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function login() {
  message.value = ''
  if (!username.value || !password.value) {
    message.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  setTimeout(() => {
    const users = getUsers()
    const hashedPassword = simpleHash(password.value)
    const ok = users.find(u => u.username === username.value && u.password === hashedPassword)
    if (ok) {
      // 设置登录状态
      localStorage.setItem('currentUser', JSON.stringify({ 
        username: ok.username,
        loginTime: new Date().toISOString()
      }))
      import('../utils/eventBus').then(module => {
        module.default.emit('login-status-changed')
      })
      router.push('/home')
    } else {
      message.value = '用户名或密码错误'
    }
    loading.value = false
  }, 400)
}

function toRegister() {
  router.push('/register')
}

// 处理键盘事件
function handleKeyPress(event) {
  if (event.key === 'Enter' && !loading.value) {
    login()
  }
}

onMounted(() => {
  initUsers()
})
</script>

<template>
  <div class="auth-container">
    <div class="auth-illustration">
      <img src="@/assets/photo3.png" alt="登录插图" class="illustration-img">
    </div>
    <div class="auth-form">
      <div class="form-card">
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-subtitle">请登录您的账号</p>
        
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input v-model="username" class="form-input" placeholder="请输入用户名">
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="password" class="form-input" type="password" placeholder="请输入密码">
        </div>

        <button class="submit-btn" :disabled="loading" @click="login">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div class="form-footer">
          <span>没有账号？</span>
          <a class="register-link" @click="toRegister">立即注册</a>
        </div>

        <div class="agreement">
          <input type="checkbox" id="login-agreement" checked>
          <label for="login-agreement">我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私政策</a></label>
        </div>

        <p v-if="message" class="error-message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  min-height: 100vh;
}

.auth-illustration {
  flex: 1;
  background: #f8fafc;
  display: flex;
  overflow: hidden;
}

.illustration-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-width: 100%;
  min-height: 100%;
}

.auth-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
}

.form-card {
  width: 100%;
  max-width: 400px;
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #64748b;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4e6ef2;
  box-shadow: 0 0 0 3px rgba(78, 110, 242, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4e6ef2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #3b5bdb;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.register-link {
  color: #4e6ef2;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}

.agreement {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.agreement a {
  color: #4e6ef2;
  text-decoration: none;
}

.agreement a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 1rem;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}
</style>