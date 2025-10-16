<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import emitter from '../utils/eventBus'
import { supabase } from '../utils/supabase.js'
import userService from '../services/userService.js'

const router = useRouter()
const isLoggedIn = ref(false)
const showUserDropdown = ref(false)
const showSettingsDropdown = ref(false)
const dropdownTimeout = ref(null)
const settingsDropdownTimeout = ref(null)
const currentUser = ref({
  username: '诗词爱好者',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=poem'
})

async function checkLoginStatus() {
  try {
    console.log('checkLoginStatus - 开始检查登录状态')
    
    // 检查localStorage中的登录状态
    const userData = localStorage.getItem('currentUser')
    isLoggedIn.value = !!userData
    
    if (userData) {
      const user = JSON.parse(userData)
      console.log('checkLoginStatus - localStorage用户数据:', user)
      
      // 使用localStorage中的用户ID
      const userId = user.userId
      console.log('checkLoginStatus - 用户ID:', userId)
      
      if (userId) {
        // 获取用户详细信息
        const userInfoResult = await userService.getUserInfo(userId)
        console.log('checkLoginStatus - 用户信息查询结果:', userInfoResult)
        
        if (userInfoResult.success) {
          const userDetail = userInfoResult.userInfo
          
          currentUser.value = {
            username: userDetail.nickname || user.username,
            avatar: userDetail.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
          }
        } else {
          // 使用默认数据
          currentUser.value = {
            username: user.username,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
          }
        }
      } else {
        // 使用默认数据
        currentUser.value = {
          username: user.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
        }
      }
    } else {
      isLoggedIn.value = false
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 尝试使用localStorage作为备用方案
    const userData = localStorage.getItem('currentUser')
    isLoggedIn.value = !!userData
    
    if (userData) {
      const user = JSON.parse(userData)
      currentUser.value = {
        username: user.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      }
    } else {
      isLoggedIn.value = false
    }
  }
}

function showDropdown() {
  clearTimeout(dropdownTimeout.value)
  showUserDropdown.value = true
}

function hideDropdown() {
  dropdownTimeout.value = setTimeout(() => {
    showUserDropdown.value = false
  }, 300) // 延迟300毫秒隐藏，方便用户点击
}

function cancelHide() {
  clearTimeout(dropdownTimeout.value)
}

// 设置下拉菜单相关函数
function showSettingsDropdownMenu() {
  clearTimeout(settingsDropdownTimeout.value)
  showSettingsDropdown.value = true
}

function hideSettingsDropdownMenu() {
  settingsDropdownTimeout.value = setTimeout(() => {
    showSettingsDropdown.value = false
  }, 300) // 延迟300毫秒隐藏，方便用户点击
}

function cancelSettingsHide() {
  clearTimeout(settingsDropdownTimeout.value)
}

onMounted(() => {
  checkLoginStatus()
  emitter.on('login-status-changed', checkLoginStatus)
  emitter.on('user-profile-updated', checkLoginStatus)
})

onUnmounted(() => {
  emitter.off('login-status-changed', checkLoginStatus)
  emitter.off('user-profile-updated', checkLoginStatus)
  clearTimeout(dropdownTimeout.value)
  clearTimeout(settingsDropdownTimeout.value)
})

async function logout() {
  try {
    // 清除Supabase认证
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('退出登录失败:', error)
    }
  } catch (error) {
    console.error('退出登录异常:', error)
  }
  
  // 清除localStorage
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
      
      <!-- 用户头像入口 -->
      <div class="user-dropdown" @mouseenter="showDropdown" @mouseleave="hideDropdown">
        <button class="user-btn" @mouseenter="cancelHide">
          <img :src="currentUser.avatar" alt="用户头像" class="user-avatar" />
          <span class="user-name">{{ currentUser.username }}</span>
        </button>
        <div class="dropdown-menu" v-show="showUserDropdown" @mouseenter="cancelHide" @mouseleave="hideDropdown">
          <RouterLink to="/user" class="dropdown-item">进入个人中心</RouterLink>
        </div>
      </div>
      
      <div class="settings-dropdown" @mouseenter="showSettingsDropdownMenu" @mouseleave="hideSettingsDropdownMenu">
        <button class="settings-btn" @mouseenter="cancelSettingsHide">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          设置
        </button>
        <div class="dropdown-menu" v-show="showSettingsDropdown" @mouseenter="cancelSettingsHide" @mouseleave="hideSettingsDropdownMenu">
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

/* 用户头像下拉菜单 */
.user-dropdown {
  position: relative;
  display: inline-block;
  width: 160px; /* 固定8个汉字宽度 */
}

.user-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
  justify-content: flex-start;
}

.user-btn:hover {
  background: #667eea;
  border-radius: 8px 8px 0 0; /* 顶部圆角，底部直角 */
}

.user-dropdown:hover .user-btn {
  background: #667eea;
  border-radius: 8px 8px 0 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px; /* 限制用户名显示长度 */
}

.user-btn:hover .user-name,
.user-dropdown:hover .user-btn .user-name {
  color: white;
}

/* 下拉菜单样式 */
.user-dropdown .dropdown-menu {
  display: block;
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  width: 100%; /* 宽度与用户头像选项卡一致 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 0 0 8px 8px; /* 底部圆角，顶部直角 */
  z-index: 1;
  margin-top: 0; /* 移除间距，与按钮完美连接 */
  border-top: none;
  box-sizing: border-box;
}

.user-dropdown .dropdown-item {
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #334155;
  text-decoration: none;
  display: block;
  font-size: 14px;
  transition: background 0.3s ease;
}

.user-dropdown .dropdown-item:hover {
  background: #f1f5f9;
  color: #667eea;
}

/* 设置下拉菜单样式 */
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
  transition: all 0.3s ease;
}
.settings-btn:hover {
  background: #667eea;
  color: white;
}

.settings-dropdown .dropdown-menu {
  display: block;
  position: absolute;
  right: -10px; /* 向右移动10px避免重叠 */
  top: 100%;
  background: white;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 0 0 8px 8px;
  z-index: 1;
  margin-top: 0;
  border-top: none;
}

.settings-dropdown .dropdown-item {
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #334155;
  font-size: 14px;
  transition: background 0.3s ease;
}
.settings-dropdown .dropdown-item:hover {
  background: #f1f5f9;
  color: #667eea;
}
</style>