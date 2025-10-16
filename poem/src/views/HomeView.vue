<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getAllPoems as getPoems, 
  getAllTags as getTags, 
  getAllDynasties as getDynasties, 
  getAllAuthors as getAuthors 
} from '../services/poemService.js'
import { supabase } from '../utils/supabase.js'
import favoriteService from '../services/favoriteService.js'

const poems = ref([])
const allTags = ref([])
const allDynasties = ref([])
const allAuthors = ref([])
const loading = ref(true)

const query = ref('')
const selectedDynasty = ref('全部')
const selectedTag = ref('全部')
const selectedAuthor = ref('全部')

const activePoem = ref(null)
const showDetail = ref(false)
const showAllPoems = ref(false)
const currentUserId = ref(null)
const userFavorites = ref(new Set())

const dynasties = computed(() => ['全部', ...allDynasties.value])
const authors = computed(() => ['全部', ...allAuthors.value])

const poets = computed(() => {
  // 统计每个作者的诗词数量
  const authorCounts = {}
  poems.value.forEach(poem => {
    authorCounts[poem.author] = (authorCounts[poem.author] || 0) + 1
  })
  
  // 按诗词数量排序，取前12位
  const topAuthors = Object.keys(authorCounts)
    .sort((a, b) => authorCounts[b] - authorCounts[a])
    .slice(0, 12)
  
  // 生成诗人列表
  const topPoets = topAuthors.map((author, index) => ({
    id: index + 1,
    name: author,
    photo: index === 0 ? new URL('../assets/photo1.png', import.meta.url).href : 
           index === 7 ? new URL('../assets/photo2.png', import.meta.url).href : null
  }))
  
  return topPoets
})

// 控制显示的诗词数量
const displayedPoems = computed(() => {
  return showAllPoems.value ? filteredPoems.value : filteredPoems.value.slice(0, 24)
})

// 收藏/取消收藏功能
async function toggleFavorite(poem) {
  if (!currentUserId.value) {
    alert('请先登录后再收藏')
    return
  }

  try {
    const poemId = poem.id
    
    if (isFavorite(poemId)) {
      // 取消收藏
      const result = await favoriteService.removeFavorite(currentUserId.value, poemId)
      if (result.success) {
        userFavorites.value.delete(poemId)
        console.log('取消收藏:', poem.title)
      } else {
        alert('取消收藏失败')
      }
    } else {
      // 添加收藏
      const result = await favoriteService.addFavorite(currentUserId.value, poemId)
      if (result.success) {
        userFavorites.value.add(poemId)
        console.log('收藏成功:', poem.title)
      } else {
        alert('收藏失败')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    alert('操作失败，请重试')
  }
}

const filteredPoems = computed(() => {
  const q = query.value.trim()
  return poems.value.filter(p => {
    const matchQ =
      !q ||
      p.title.includes(q) ||
      p.author.includes(q) ||
      p.content.includes(q) ||
      p.tags.some(t => t.includes(q))
    const matchDynasty = selectedDynasty.value === '全部' || p.dynasty === selectedDynasty.value
    const matchTag = selectedTag.value === '全部' || p.tags.includes(selectedTag.value)
    const matchAuthor = selectedAuthor.value === '全部' || p.author === selectedAuthor.value
    return matchQ && matchDynasty && matchTag && matchAuthor
  })
})

function openDetail(p) {
  activePoem.value = p
  showDetail.value = true
}
function closeDetail() {
  showDetail.value = false
}
function clearFilters() {
  query.value = ''
  selectedDynasty.value = '全部'
  selectedTag.value = '全部'
  selectedAuthor.value = '全部'
}
function searchPoems() {
  console.log('搜索关键词:', query.value)
}

function refreshPoems() {
  poems.value = [...poems.value].sort(() => Math.random() - 0.5)
}

function selectTag(tag) {
  selectedTag.value = tag
}

function selectAuthor(author) {
  selectedAuthor.value = author
}

function selectDynasty(dynasty) {
  selectedDynasty.value = dynasty
}

// 获取当前用户ID
async function getCurrentUserId() {
  try {
    console.log('getCurrentUserId - 开始获取用户ID')
    
    // 检查localStorage中的用户信息
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      console.log('getCurrentUserId - 用户未登录')
      return null
    }

    const localUser = JSON.parse(userData)
    console.log('getCurrentUserId - localStorage用户数据:', localUser)
    
    // 直接使用localStorage中的userId
    if (localUser.userId) {
      console.log('getCurrentUserId - 使用localStorage中的用户ID:', localUser.userId)
      return localUser.userId
    }
    
    // 如果没有userId，尝试从users表获取（兼容旧版本）
    console.log('getCurrentUserId - 尝试从users表获取用户ID')
    const { data: userDataFromDB, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', localUser.username)
      .single()

    if (error) {
      console.log('getCurrentUserId - 获取用户ID失败:', error)
      return null
    }
    
    console.log('getCurrentUserId - 从users表获取的用户ID:', userDataFromDB.id)
    return userDataFromDB.id
  } catch (error) {
    console.error('getCurrentUserId - 异常:', error)
    return null
  }
}

// 加载用户收藏
async function loadUserFavorites() {
  if (!currentUserId.value) return
  
  try {
    const result = await favoriteService.getUserFavorites(currentUserId.value)
    if (result.success) {
      userFavorites.value = new Set(result.favorites)
    }
  } catch (error) {
    console.error('加载用户收藏失败:', error)
  }
}

// 检查诗词是否被收藏
function isFavorite(poemId) {
  return userFavorites.value.has(poemId)
}

async function loadData() {
  try {
    loading.value = true
    
    // 获取当前用户ID
    currentUserId.value = await getCurrentUserId()
    
    const [poemsData, tagsData, dynastiesData, authorsData] = await Promise.all([
      getPoems(),
      getTags(),
      getDynasties(),
      getAuthors()
    ])
    
    poems.value = poemsData
    allTags.value = tagsData
    allDynasties.value = dynastiesData
    allAuthors.value = authorsData
    
    // 加载用户收藏
    if (currentUserId.value) {
      await loadUserFavorites()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    currentUserId.value = session.user.id
    loadUserFavorites()
  } else if (event === 'SIGNED_OUT') {
    currentUserId.value = null
    userFavorites.value = new Set()
  }
})
</script>

<template>
  <main class="page">


    <section class="search-section">
      <div class="search-background">
        <div class="baidu-search-container">
          <div class="baidu-search-box">
            <input
              v-model="query"
              class="baidu-search-input"
              type="text"
              placeholder="搜索：标题 / 作者 / 全文 / 关键词"
            />
            <button class="baidu-search-btn" @click="searchPoems">搜索</button>
          </div>
        </div>
      </div>
    </section>



    <div class="main-layout">

      <div class="left-column">
      <section class="poets-section">
        <div class="section-header">
          <h2 class="section-title">诗人</h2>
          <a class="more-link" href="javascript:void(0)">更多</a>
        </div>
        <div class="poets-grid">
          <div v-for="poet in poets" :key="poet.id" class="poet-card">
            <div
              class="poet-avatar"
              :style="{
                backgroundImage: poet.photo ? 'url(' + poet.photo + ')' : '',
              }"
              aria-label="poet avatar"
            ></div>
            <div class="poet-name">{{ poet.name }}</div>
          </div>
        </div>
      </section>
      <section class="poems-section">
        <div class="section-header">
          <h2 class="section-title">经典诗词</h2>
          <button class="refresh-btn" @click="refreshPoems">换一批</button>
        </div>
        <div class="grid">
          <div v-if="loading" class="loading">
            正在加载诗词数据...
          </div>
          <article
            v-else
            v-for="p in displayedPoems"
            :key="p.id"
            class="card"
            @click="openDetail(p)"
          >
            <header class="card-head">
              <h3 class="card-title">{{ p.title }}</h3>
              <div class="meta">
                <span class="pill">{{ p.author }}</span>
                <span class="pill">{{ p.dynasty }}</span>
              </div>
            </header>
            <div class="content">
              <p class="line">{{ p.content }}</p>
            </div>
            <footer class="card-footer">
              <div class="tags">
                <span v-for="(t,i) in p.tags" :key="i" class="tag">#{{ t }}</span>
              </div>
              <button class="favorite-btn" @click.stop="toggleFavorite(p)" :class="{ active: isFavorite(p.id) }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </footer>
          </article>

          <div v-if="!loading && filteredPoems.length === 0" class="empty">
            暂无匹配的诗作，试试调整筛选或关键词。
          </div>
        </div>

        <!-- 查看更多按钮 -->
        <div v-if="!loading && filteredPoems.length > 24" class="more-poems-container">
          <button class="more-poems-btn" @click="showAllPoems = !showAllPoems">
            ————{{ showAllPoems ? '收起部分诗词' : '点此查看更多'}}————
          </button>
        </div>
      </section>

      </div>

      <aside class="filter-sidebar">
        <div class="filter-card">
          <h3 class="filter-title">分类筛选</h3>
          


          <div class="category-tags">
            <h4 class="category-title">类型</h4>
            <div class="tags-container">
              <span 
                v-for="tag in allTags.slice(0, 20)" 
                :key="tag"
                class="category-tag"
                :class="{ active: selectedTag === tag }"
                @click="selectTag(tag)"
              >
                {{ tag }}
              </span>
              <span class="category-tag more" v-if="allTags.length > 20">更多>></span>
            </div>
          </div>

          <div class="category-tags">
            <h4 class="category-title">诗人</h4>
            <div class="tags-container">
              <span 
                v-for="author in allAuthors" 
                :key="author"
                class="category-tag"
                :class="{ active: selectedAuthor === author }"
                @click="selectAuthor(author)"
              >
                {{ author }}
              </span>
            </div>
          </div>

          <div class="category-tags">
            <h4 class="category-title">朝代</h4>
            <div class="tags-container">
              <span 
                v-for="dynasty in allDynasties" 
                :key="dynasty"
                class="category-tag"
                :class="{ active: selectedDynasty === dynasty }"
                @click="selectDynasty(dynasty)"
              >
                {{ dynasty }}
              </span>
            </div>
          </div>

          <button class="btn ghost reset-btn" @click="clearFilters">重置筛选</button>
        </div>
      </aside>
    </div>

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
  </main>
</template>

<style scoped>
:root {
  --bg: #faf9f7;
  --card: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #e5e7eb;
  --accent: #334155;
  --accent-2: #0ea5e9;
  --pill: #f1f5f9;
  --tag: #eef2ff;
}

.page {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 24px 20px 56px;
  color: var(--text);
  background-color: rgb(242,235,230);
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%);
  background-repeat: no-repeat;
  background-size: cover;
}

.hero {
  text-align: center;
  margin-bottom: 16px;
}
.title {
  font-size: 28px;
  margin: 0;
  letter-spacing: 2px;
}
.subtitle {
  color: var(--muted);
  margin-top: 8px;
}

.search-section {
  margin: 80px 0 24px;
}

.search-background {
  background-color: #d7d7d7;
  background-image: url('../assets/photo1.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  padding: 60px 20px;
  margin: -30px -20px 30px -20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.baidu-search-container {
  display: flex;
  justify-content: center;
}

.main-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.poems-section {
  grid-column: 1;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.refresh-btn {
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
  padding: 6px 16px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.refresh-btn:hover {
  background: #e0e0e0;
}

.filter-sidebar {
  flex: 0 0 300px;
  width: 300px;
}

.filter-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #e5e7eb;
  position: sticky;
  top: 20px;
  height: 100%;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #000;
  text-align: center;
}

.category-tags {
  margin-top: 20px;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #000;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  background: #f1f5f9;
  color: #000;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.category-tag:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.category-tag.active {
  background: #4e6ef2;
  color: white;
  border-color: #4e6ef2;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
  grid-column: 1 / -1;
}

.reset-btn {
  width: 100%;
  margin-top: 16px;
  text-align: center;
}

.baidu-search-box {
  position: relative;
  width: 800px;
  max-width: 90%;
  display: flex;
  align-items: stretch;
  border: 2px solid #4e6ef2;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(78, 110, 242, 0.15);
  transition: all 0.3s ease;
  height: 60px;
  overflow: hidden;
}

.baidu-search-box:focus-within {
  box-shadow: 0 4px 20px rgba(78, 110, 242, 0.25);
}

.baidu-search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 20px;
  font-size: 18px;
  background: transparent;
  height: 100%;
  border-radius: 0;
}

.baidu-search-btn {
  background: #4e6ef2;
  border: none;
  outline: none;
  padding: 0 30px;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
  font-weight: 500;
  border-radius: 0;
  margin: 0;
}

.baidu-search-btn:hover {
  background: #4662d9;
}

.baidu-search-btn:active {
  background: #3d56c0;
}

.filters {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}
.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1 1 200px;
}
.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
.input, .select {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s ease;
}
.input {
  flex: 1 1 100%;
  width: 100%;
}
.select {
  width: 100%;
}
.input:focus, .select:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
}
.btn.ghost {
  border: 2px solid #e5e7eb;
  background: #fff;
  color: #000000;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn.ghost:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}
@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 960px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
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
  background: var(--pill);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: #000000;
}
.pill.theme {
  color: #000000;
  background: #e0f2fe;
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
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  color: #ff6b6b;
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
  background: var(--tag);
  color: #000000;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  margin-right: 6px;
}

.empty {
  text-align: center;
  color: var(--muted);
  padding: 24px;
  grid-column: 1 / -1;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.panel {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: auto;
}
.close {
  position: absolute;
  top: 12px;
  right: 16px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.close:hover { 
  color: #333;
  background: rgba(0, 0, 0, 0.1);
}
.panel-body {
  padding: 24px;
}
.panel-title {
  margin: 0 0 8px 0;
  font-size: 22px;
}
.panel-meta {
  font-size: 12px;
  color: var(--muted);
  margin-left: 8px;
}
.panel-section { margin: 12px 0; }
.panel-section-title {
  font-size: 14px;
  color: var(--accent);
  margin: 6px 0;
}
.para { line-height: 1.8; }
.note { color: #9333ea; }
.poets-section {
  grid-column: 1;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.poets-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (min-width: 640px) {
  .poets-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 960px) {
  .poets-grid { grid-template-columns: repeat(6, 1fr); }
}

.poet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
}

.poet-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f1f5f9;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid #e5e7eb;
}

.poet-name {
  font-size: 14px;
  color: #000;
  text-align: center;
}

.more-link {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
  text-decoration: none;
}
.more-link:hover {
  background: #e9e9e9;
  color: #333;
}

/* 查看更多按钮样式 */
.more-poems-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

.more-poems-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 16px;
  transition: color 0.3s ease;
  text-decoration: none;
}

.more-poems-btn:hover {
  color: #4e6ef2;
}

</style>