<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../utils/supabase.js'
import userService from '../services/userService.js'
import favoriteService from '../services/favoriteService.js'
import emitter from '../utils/eventBus'

// 当前用户信息
const userInfo = ref({
  id: '',
  username: '诗词爱好者',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=poem',
  email: 'poem@example.com',
  bio: '热爱古典诗词，喜欢在诗词中寻找生活的诗意',
  gender: 'male'
})

// 当前选中的导航项
const activeNav = ref('profile')

// 表单数据
const formData = ref({
  avatar: userInfo.value.avatar,
  username: userInfo.value.username,
  gender: userInfo.value.gender,
  email: userInfo.value.email,
  bio: userInfo.value.bio
})

// 加载状态
const loading = ref(true)

// 上传头像处理
function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // 检查文件大小（2MB限制）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB')
      return
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    
    // 创建文件阅读器预览图片
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.avatar = e.target.result
      userInfo.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 保存资料
async function saveProfile() {
  try {
    // 从localStorage获取用户信息
    const currentUserStr = localStorage.getItem('currentUser')
    if (!currentUserStr) {
      throw new Error('用户未登录，请重新登录')
    }
    
    const currentUser = JSON.parse(currentUserStr)
    const userId = currentUser.userId

    if (!userId) {
      throw new Error('获取用户信息失败')
    }

    console.log('保存资料，用户ID:', userId)

    // 更新用户信息到数据库
    const result = await userService.updateUserInfo(userId, {
      avatar_url: formData.value.avatar,
      nickname: formData.value.username,
      gender: formData.value.gender,
      email: formData.value.email,
      bio: formData.value.bio
    })

    if (result.success) {
      // 更新本地用户信息
      userInfo.value.avatar = formData.value.avatar
      userInfo.value.username = formData.value.username
      userInfo.value.gender = formData.value.gender
      userInfo.value.email = formData.value.email
      userInfo.value.bio = formData.value.bio
      alert('资料保存成功！')
      // 触发用户资料更新事件，通知导航栏更新
      emitter.emit('user-profile-updated')
    } else {
      alert('保存失败: ' + result.message)
    }
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

// 加载用户数据
async function loadUserData() {
  try {
    loading.value = true
    
    console.log('loadUserData - 开始加载用户数据')
    
    // 从localStorage获取用户信息
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      console.log('用户未登录，使用默认数据')
      // 保持默认数据，不抛出错误
      return
    }

    const user = JSON.parse(userData)
    console.log('loadUserData - localStorage用户数据:', user)
    
    const userId = user.userId
    console.log('loadUserData - 用户ID:', userId)
    
    if (!userId) {
      console.log('用户ID不存在，使用默认数据')
      return
    }
    
    // 获取用户详细信息
    const userInfoResult = await userService.getUserInfo(userId)
    console.log('loadUserData - 用户信息查询结果:', userInfoResult)
    
    if (userInfoResult.success) {
      const userDetail = userInfoResult.userInfo
      
      // 尝试从users表获取用户名（如果RLS允许）
      let username = userDetail.nickname || '诗词爱好者'
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single()
        
        if (!error && userData) {
          username = userDetail.nickname || userData.username || '诗词爱好者'
        }
      } catch (dbError) {
        console.log('获取用户名失败，使用默认值:', dbError)
      }
      
      // 更新用户信息
      userInfo.value = {
        id: userId,
        username: username,
        avatar: userDetail.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        email: userDetail.email || '',
        bio: userDetail.bio || '',
        gender: userDetail.gender || 'male'
      }

      // 更新表单数据
      formData.value = {
        avatar: userInfo.value.avatar,
        username: userInfo.value.username,
        gender: userInfo.value.gender,
        email: userInfo.value.email,
        bio: userInfo.value.bio
      }
      
      console.log('用户数据加载成功:', userInfo.value)
    } else {
      // 创建默认用户信息
      console.log('用户信息不存在，创建默认信息')
      const createResult = await userService.createDefaultUserInfo(userId)
      
      if (createResult.success) {
        const userDetail = createResult.userInfo
        
        // 尝试从users表获取用户名（如果RLS允许）
        let username = userDetail.nickname || '诗词爱好者'
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('username')
            .eq('id', userId)
            .single()
          
          if (!error && userData) {
            username = userDetail.nickname || userData.username || '诗词爱好者'
          }
        } catch (dbError) {
          console.log('获取用户名失败，使用默认值:', dbError)
        }
        
        // 更新用户信息
        userInfo.value = {
          id: userId,
          username: username,
          avatar: userDetail.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          email: userDetail.email || '',
          bio: userDetail.bio || '',
          gender: userDetail.gender || 'male'
        }

        // 更新表单数据
        formData.value = {
          avatar: userInfo.value.avatar,
          username: userInfo.value.username,
          gender: userInfo.value.gender,
          email: userInfo.value.email,
          bio: userInfo.value.bio
        }
      } else {
        // 使用默认数据
        userInfo.value = {
          id: userId,
          username: '诗词爱好者',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=poem',
          email: '',
          bio: '',
          gender: 'male'
        }

        formData.value = {
          avatar: userInfo.value.avatar,
          username: userInfo.value.username,
          gender: userInfo.value.gender,
          email: userInfo.value.email,
          bio: userInfo.value.bio
        }
      }
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    // 保持默认数据
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserData()
})

// 收藏列表
const favorites = ref([])
const favoritesLoading = ref(false)
const showAllFavorites = ref(false)
const displayedFavorites = ref([])

// 悬浮小窗相关
const activePoem = ref(null)
const showDetail = ref(false)

// 计算显示的收藏诗词
watch([favorites, showAllFavorites], () => {
  if (showAllFavorites.value) {
    displayedFavorites.value = favorites.value
  } else {
    displayedFavorites.value = favorites.value.slice(0, 4)
  }
})

// 加载用户收藏
async function loadUserFavorites() {
  try {
    favoritesLoading.value = true
    
    // 从localStorage获取用户信息
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      console.log('用户未登录')
      favorites.value = []
      return
    }

    const user = JSON.parse(userData)
    const userId = user.userId

    if (!userId) {
      console.log('用户ID不存在')
      favorites.value = []
      return
    }

    console.log('用户ID:', userId)

    // 获取收藏的诗词
    const result = await favoriteService.getFavoritePoems(userId)
    console.log('收藏结果:', result)
    
    if (result.success) {
      favorites.value = result.poems || []
      console.log('收藏诗词数量:', favorites.value.length)
    } else {
      console.error('获取收藏失败:', result.message)
      favorites.value = []
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
    favorites.value = []
  } finally {
    favoritesLoading.value = false
  }
}

// 取消收藏
async function removeFavorite(poemId) {
  try {
    // 从localStorage获取用户信息
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      throw new Error('用户未登录')
    }

    const user = JSON.parse(userData)
    const userId = user.userId

    if (!userId) {
      throw new Error('获取用户信息失败')
    }

    // 取消收藏
    const result = await favoriteService.removeFavorite(userId, poemId)
    if (result.success) {
      // 从列表中移除
      favorites.value = favorites.value.filter(item => item.id !== poemId)
      alert('取消收藏成功')
    } else {
      alert('取消收藏失败')
    }
  } catch (error) {
    console.error('取消收藏失败:', error)
    alert('取消收藏失败')
  }
}

// 监听导航切换
watch(activeNav, (newVal) => {
  if (newVal === 'favorites') {
    loadUserFavorites()
  }
}, { immediate: true })

// 组件挂载时也加载收藏数据
onMounted(() => {
  if (activeNav.value === 'favorites') {
    loadUserFavorites()
  }
})

// 打开诗词详情
function openDetail(poem) {
  activePoem.value = poem
  showDetail.value = true
}

// 关闭诗词详情
function closeDetail() {
  showDetail.value = false
}
</script>

<template>
  <div class="user-center">
    <!-- 顶部信息栏 -->
    <div class="user-header">
      <div class="header-content">
        <img :src="userInfo.avatar" alt="头像" class="user-avatar" />
        <div class="user-info">
          <h1 class="username">{{ userInfo.username }}</h1>
          <p class="user-bio">{{ userInfo.bio }}</p>
        </div>
      </div>
    </div>

    <div class="user-main">
      <!-- 左侧导航栏 -->
      <aside class="user-sidebar">
        <nav class="sidebar-nav">
          <button 
            class="nav-item" 
            :class="{ active: activeNav === 'profile' }"
            @click="activeNav = 'profile'"
          >
            <span class="nav-icon">👤</span>
            资料编辑
          </button>
          <button 
            class="nav-item" 
            :class="{ active: activeNav === 'favorites' }"
            @click="activeNav = 'favorites'"
          >
            <span class="nav-icon">❤️</span>
            我的收藏
          </button>
        </nav>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="user-content">
        <!-- 资料编辑 -->
        <div v-if="activeNav === 'profile'" class="profile-section">
          <h2 class="section-title">编辑资料</h2>
          <form @submit.prevent="saveProfile" class="profile-form">
            <!-- 上传头像 -->
            <div class="form-group">
              <label class="form-label">头像</label>
              <div class="avatar-upload">
                <img :src="formData.avatar" alt="头像预览" class="avatar-preview" />
                <div class="upload-controls">
                  <input type="file" ref="avatarInput" @change="handleAvatarUpload" accept="image/*" class="file-input" />
                  <button type="button" @click="$refs.avatarInput.click()" class="upload-btn">选择图片</button>
                  <span class="upload-hint">支持 JPG、PNG 格式，大小不超过 2MB</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input v-model="formData.username" type="text" class="form-input" />
            </div>
            
            <!-- 性别选项 -->
            <div class="form-group">
              <label class="form-label">性别</label>
              <div class="gender-options">
                <label class="gender-option">
                  <input type="radio" v-model="formData.gender" value="male" class="gender-radio" />
                  <span class="gender-label">男</span>
                </label>
                <label class="gender-option">
                  <input type="radio" v-model="formData.gender" value="female" class="gender-radio" />
                  <span class="gender-label">女</span>
                </label>
                <label class="gender-option">
                  <input type="radio" v-model="formData.gender" value="other" class="gender-radio" />
                  <span class="gender-label">其他</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input v-model="formData.email" type="email" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">个人简介</label>
              <textarea v-model="formData.bio" class="form-textarea" rows="4"></textarea>
            </div>
            <button type="submit" class="save-btn">保存修改</button>
          </form>
        </div>

        <!-- 我的收藏 -->
        <div v-if="activeNav === 'favorites'" class="favorites-section">
          <h2 class="section-title">我的收藏</h2>
          <div v-if="favoritesLoading" class="loading-favorites">
            <p>正在加载收藏列表...</p>
          </div>
          <div v-else-if="favorites.length === 0" class="empty-favorites">
            <p>暂无收藏的诗词</p>
          </div>
          <div v-else>
            <!-- 诗词卡片网格 -->
            <div class="favorites-grid">
              <article
                v-for="poem in displayedFavorites"
                :key="poem.id"
                class="card"
                @click="openDetail(poem)"
              >
                <header class="card-head">
                  <h3 class="card-title">{{ poem.title }}</h3>
                  <div class="meta">
                    <span class="pill">{{ poem.author }}</span>
                    <span class="pill">{{ poem.dynasty }}</span>
                  </div>
                </header>
                <div class="content">
                  <p class="line">{{ poem.content }}</p>
                </div>
                <footer class="card-footer">
                  <div class="tags">
                    <span v-for="(t,i) in poem.tags" :key="i" class="tag">#{{ t }}</span>
                  </div>
                  <button class="favorite-btn active" @click="removeFavorite(poem.id)" title="取消收藏">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </footer>
              </article>
            </div>

            <!-- 查看更多按钮 -->
            <div v-if="favorites.length > 4" class="more-favorites-container">
              <button class="more-favorites-btn" @click="showAllFavorites = !showAllFavorites">
                ————{{ showAllFavorites ? '收起部分收藏' : '点此查看更多'}}————
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 诗词详情悬浮小窗 -->
    <div v-if="showDetail" class="overlay" @click.self="closeDetail">
      <div class="panel">
        <button class="close" @click="closeDetail" aria-label="关闭">×</button>
        <div v-if="activePoem" class="panel-body">
          <h2 class="panel-title">
            {{ activePoem.title }}
            <small class="panel-meta">{{ activePoem.author }} · {{ activePoem.dynasty }} · {{ activePoem.theme }}</small>
          </h2>

          <section class="panel-section">
            <h4 class="panel-section-title">原文</h4>
            <p class="line">{{ activePoem.content }}</p>
          </section>

          <section class="panel-section">
            <h4 class="panel-section-title">翻译</h4>
            <p class="para">{{ activePoem.translation }}</p>
          </section>

          <section class="panel-section">
            <h4 class="panel-section-title">鉴赏</h4>
            <p class="para">{{ activePoem.appreciation }}</p>
          </section>

          <section class="panel-section">
            <h4 class="panel-section-title">注释</h4>
            <p class="para note">{{ activePoem.notes }}</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-center {
  min-height: 100vh;
  background-color: rgb(242,235,230);
  padding-top: 100px; /* 避免被导航栏遮挡 */
}

.user-header {
  background: url('@/assets/photo2.png') center/cover no-repeat;
  color: white;
  padding: 40px 20px;
  position: relative;
}

.user-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.3);
}

.user-info {
  flex: 1;
}

.username {
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.user-bio {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.user-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  display: flex;
  gap: 30px;
}

.user-sidebar {
  flex: 0 0 250px;
}

.sidebar-nav {
  background: white;
  border-radius: 12px;
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-item {
  width: 100%;
  padding: 15px 20px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #333;
}

.nav-item.active {
  background: #667eea;
  color: white;
}

.nav-icon {
  font-size: 18px;
}

.user-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 24px;
  margin: 0 0 30px 0;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.profile-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.save-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.save-btn:hover {
  background: #5a6fd8;
}

/* 头像上传样式 */
.avatar-upload {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  object-fit: cover;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input {
  display: none;
}

.upload-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  align-self: flex-start;
}

.upload-btn:hover {
  background: #5a6fd8;
}

.upload-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* 性别选项样式 */
.gender-options {
  display: flex;
  gap: 20px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.gender-option:hover {
  background: #f5f5f5;
}

.gender-radio {
  margin: 0;
}

.gender-label {
  font-size: 14px;
  color: #333;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}
@media (min-width: 640px) {
  .favorites-grid { grid-template-columns: repeat(2, 1fr); }
}

.card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  color: #000000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e0e0e0;
}
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4e6ef2, #0ea5e9);
  border-radius: 12px 12px 0 0;
}
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.card-title {
  font-size: 18px;
  margin: 0;
  color: #000000;
}
.meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.pill {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: #000000;
}
.content .line {
  margin: 6px 0;
  color: #000000;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.tags {
  flex: 1;
}

.favorite-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  color: #ff4757;
  background: rgba(255, 107, 107, 0.1);
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #ff6b6b;
}

.favorite-btn.active:hover {
  color: #ff4757;
}
.tag {
  display: inline-block;
  background: #eef2ff;
  color: #000000;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  margin-right: 6px;
}

/* 查看更多按钮样式 */
.more-favorites-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

.more-favorites-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 16px;
  transition: color 0.3s ease;
  text-decoration: none;
}

.more-favorites-btn:hover {
  color: #4e6ef2;
}

.loading-favorites {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-favorites p {
  font-size: 16px;
  margin: 0;
}

.empty-favorites {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-favorites p {
  font-size: 16px;
  margin: 0;
}

/* 悬浮小窗样式 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.panel {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.close {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close:hover {
  background: #f0f0f0;
  color: #333;
}

.panel-body {
  padding: 30px;
}

.panel-title {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #333;
}

.panel-meta {
  font-size: 14px;
  color: #666;
  margin-left: 8px;
}

.panel-section {
  margin: 20px 0;
}

.panel-section-title {
  font-size: 16px;
  color: #4e6ef2;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.line {
  line-height: 1.8;
  color: #333;
  margin: 0;
}

.para {
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.note {
  color: #9333ea;
}

@media (max-width: 768px) {
  .user-main {
    flex-direction: column;
  }
  
  .user-sidebar {
    flex: none;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .overlay {
    padding: 10px;
  }
  
  .panel {
    max-width: 100%;
    max-height: 90vh;
  }
  
  .panel-body {
    padding: 20px;
  }
}
</style>