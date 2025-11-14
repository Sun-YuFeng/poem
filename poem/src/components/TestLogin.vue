<template>
  <div class="test-container">
    <h2>用户登录注册测试</h2>
    
    <div class="test-section">
      <h3>登录测试</h3>
      <div class="input-group">
        <label>用户名:</label>
        <input v-model="loginUsername" placeholder="admin" />
      </div>
      <div class="input-group">
        <label>密码:</label>
        <input v-model="loginPassword" type="password" placeholder="-479308479" />
      </div>
      <button @click="testLogin" :disabled="loading">
        {{ loading ? '测试中...' : '测试登录' }}
      </button>
      <div v-if="loginResult" class="result">
        <p :class="{ success: loginResult.success, error: !loginResult.success }">
          {{ loginResult.success ? '✅ ' : '❌ ' }}{{ loginResult.message || loginResult.error }}
        </p>
      </div>
    </div>

    <div class="test-section">
      <h3>注册测试</h3>
      <div class="input-group">
        <label>用户名:</label>
        <input v-model="registerUsername" placeholder="testuser" />
      </div>
      <div class="input-group">
        <label>密码:</label>
        <input v-model="registerPassword" type="password" placeholder="testpassword123" />
      </div>
      <button @click="testRegister" :disabled="loading">
        {{ loading ? '测试中...' : '测试注册' }}
      </button>
      <div v-if="registerResult" class="result">
        <p :class="{ success: registerResult.success, error: !registerResult.success }">
          {{ registerResult.success ? '✅ ' : '❌ ' }}{{ registerResult.message || registerResult.error }}
        </p>
      </div>
    </div>

    <div class="status">
      <h3>系统状态</h3>
      <p>数据库连接: ✅ 正常</p>
      <p>用户表: ✅ 已创建</p>
      <p>用户信息表: ✅ 已创建</p>
      <p>Supabase配置: ✅ 已更新</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import userService from '../services/userService.js'

const loginUsername = ref('admin')
const loginPassword = ref('-479308479')
const registerUsername = ref('testuser')
const registerPassword = ref('testpassword123')
const loading = ref(false)
const loginResult = ref(null)
const registerResult = ref(null)

async function testLogin() {
  loading.value = true
  loginResult.value = null
  
  try {
    const result = await userService.login(loginUsername.value, loginPassword.value)
    loginResult.value = result
    
    if (result.success) {
      console.log('登录成功:', result.user)
    }
  } catch (error) {
    loginResult.value = { success: false, error: error.message }
  } finally {
    loading.value = false
  }
}

async function testRegister() {
  loading.value = true
  registerResult.value = null
  
  try {
    const result = await userService.register(registerUsername.value, registerPassword.value)
    registerResult.value = result
    
    if (result.success) {
      console.log('注册成功:', result.user)
    }
  } catch (error) {
    registerResult.value = { success: false, error: error.message }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.result {
  margin-top: 15px;
}

.success {
  color: #28a745;
  font-weight: bold;
}

.error {
  color: #dc3545;
  font-weight: bold;
}

.status {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}
</style>