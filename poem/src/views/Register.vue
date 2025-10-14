<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const message = ref('')
const agreementChecked = ref(false)

// 简单的哈希函数（与登录组件保持一致）
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

function getUsers() {
  try {
    const raw = localStorage.getItem('users')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users))
}

function register() {
  message.value = ''
  if (!username.value || !password.value || !confirm.value) {
    message.value = '请填写完整信息'
    return
  }
  if (password.value.length < 4) {
    message.value = '密码至少 4 位'
    return
  }
  if (password.value !== confirm.value) {
    message.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  setTimeout(() => {
    const users = getUsers()
    if (users.some(u => u.username === username.value)) {
      message.value = '该用户名已存在'
      loading.value = false
      return
    }
    // 存储哈希后的密码
    users.push({ 
      username: username.value, 
      password: simpleHash(password.value) 
    })
    saveUsers(users)
    message.value = '注册成功，正在跳转登录...'
    setTimeout(() => router.push('/'), 600)
    loading.value = false
  }, 400)
}

// 处理键盘事件
function handleKeyPress(event) {
  if (event.key === 'Enter' && !loading.value) {
    register()
  }
}

function toLogin() {
  router.push('/')
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-illustration">
      <img src="@/assets/photo2.png" alt="注册插图" class="illustration-img">
    </div>
    <div class="auth-form">
      <div class="form-card">
        <h2 class="form-title">创建账号</h2>
        <p class="form-subtitle">加入我们，开始您的诗歌之旅</p>
        
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input v-model="username" class="form-input" placeholder="请输入用户名">
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="password" class="form-input" type="password" placeholder="请输入密码（至少 4 位）">
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input v-model="confirm" class="form-input" type="password" placeholder="请再次输入密码">
        </div>

        <div class="agreement">
          <input type="checkbox" id="register-agreement" v-model="agreementChecked">
          <label for="register-agreement">我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私政策</a></label>
        </div>

        <button class="submit-btn" :disabled="loading || !agreementChecked" @click="register">
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <div class="form-footer">
          <span>已有账号？</span>
          <a class="login-link" @click="toLogin">立即登录</a>
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
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.illustration-img {
  max-width: 80%;
  height: auto;
  border-radius: 8px;
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
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #0d9b6c;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #a7f3d0;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.login-link {
  color: #10b981;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

.agreement {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
}

.agreement input {
  margin-right: 0.5rem;
}

.agreement a {
  color: #10b981;
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