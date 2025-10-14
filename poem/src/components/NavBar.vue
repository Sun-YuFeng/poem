<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import emitter from '../utils/eventBus'

const router = useRouter()
const isLoggedIn = ref(false)

function checkLoginStatus() {
  isLoggedIn.value = !!localStorage.getItem('currentUser')
}

onMounted(() => {
  checkLoginStatus()
  emitter.on('login-status-changed', checkLoginStatus)
})

onUnmounted(() => {
  emitter.off('login-status-changed', checkLoginStatus)
})

function logout() {
  localStorage.removeItem('currentUser')
  isLoggedIn.value = false
  router.push('/')
}
</script>

<template>
  <header class="app-header" v-if="isLoggedIn">
    <div class="brand">诗歌鉴赏</div>
    <nav class="nav-actions">
      <RouterLink to="/home" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        首页
      </RouterLink>
      <RouterLink to="#" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        分类
      </RouterLink>
      <RouterLink to="#" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        关于
      </RouterLink>
      
      <div class="settings-dropdown">
        <button class="settings-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          设置
        </button>
        <div class="dropdown-menu">
          <button @click="logout" class="dropdown-item">退出登录</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link {
  color: #334155;
  font-size: 14px;
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-link:hover {
  background: #f1f5f9;
}
.nav-link svg {
  flex-shrink: 0;
}

.settings-dropdown {
  position: relative;
  display: inline-block;
}

.settings-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.settings-btn:hover {
  background: #f1f5f9;
}

.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  background: white;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  z-index: 1;
}

.settings-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #334155;
}
.dropdown-item:hover {
  background: #f1f5f9;
}
</style>