<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const message = ref('')

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
  <div class="auth-page">
    <div class="card">
      <h2 class="title">注册</h2>
      <div class="form" @keyup.enter="handleKeyPress">
        <label class="label">用户名</label>
        <input v-model="username" class="input" placeholder="请输入用户名" />
        <label class="label">密码</label>
        <input v-model="password" class="input" type="password" placeholder="请输入密码（至少 4 位）" @keyup.enter="handleKeyPress" />
        <label class="label">确认密码</label>
        <input v-model="confirm" class="input" type="password" placeholder="请再次输入密码" @keyup.enter="handleKeyPress" />
        <button class="btn primary" :disabled="loading" @click="register">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <button class="btn ghost" @click="toLogin">已有账号？去登录</button>
        <p v-if="message" class="msg">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f5f7fb;
  padding: 24px;
}
.card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  padding: 24px;
}
.title {
  margin: 0 0 16px 0;
  font-size: 22px;
  text-align: center;
  color: #111827;
}
.form { display: flex; flex-direction: column; gap: 10px; }
.label { font-size: 13px; color: #374151; }
.input {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.2s ease;
}
.input:focus { border-color: #4e6ef2; box-shadow: 0 0 0 3px rgba(78,110,242,0.15); }
.btn {
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 500;
  border: 2px solid transparent;
}
.btn.primary { background: #10b981; color: #fff; }
.btn.primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn.ghost { background: #fff; border-color: #e5e7eb; color: #111827; }
.msg { color: #ef4444; font-size: 13px; text-align: center; }
</style>