<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
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
  <div class="auth-page">
    <div class="card">
      <h2 class="title">登录</h2>
      <div class="form" @keyup.enter="handleKeyPress">
        <label class="label">用户名</label>
        <input v-model="username" class="input" placeholder="请输入用户名" />
        <label class="label">密码</label>
        <input v-model="password" class="input" type="password" placeholder="请输入密码" @keyup.enter="handleKeyPress" />
        <button class="btn primary" :disabled="loading" @click="login">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <button class="btn ghost" @click="toRegister">没有账号？去注册</button>
        <p v-if="message" class="msg">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  height: 100vh;
  display: grid;
  place-items: center;
  background: #f5f7fb;
  padding: 24px;
  overflow: hidden;
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
.btn.primary { background: #4e6ef2; color: #fff; }
.btn.primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn.ghost { background: #fff; border-color: #e5e7eb; color: #111827; }
.msg { color: #ef4444; font-size: 13px; text-align: center; }
</style>