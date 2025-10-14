<script setup>
import { ref, computed } from 'vue'

const poems = ref([
  {
    id: 1,
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    theme: '思乡',
    content: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'],
    tags: ['写景', '抒情', '名篇'],
    translation: '明亮的月光洒在床前，仿佛像地上的霜。抬头望明月，低头思故乡。',
    appreciation: '以小景寄大情，语言浅易而意蕴深长，结构对称，意境清远。',
    notes: '“举头”“低头”动作对比，将外景与内心交织。'
  },
  {
    id: 2,
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    theme: '春景',
    content: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'],
    tags: ['写景', '自然', '清新'],
    translation: '春眠香甜不觉破晓，处处鸟鸣。念昨夜风雨，不知花落几许。',
    appreciation: '清新含蓄，以听觉与回忆营造春晨与惜春之感。',
    notes: '结尾设问含蓄隽永，反写惜春。'
  },
  {
    id: 3,
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    theme: '登临',
    content: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'],
    tags: ['立意', '豪放', '哲思'],
    translation: '夕阳依山沉落，黄河奔流入海。欲尽览千里风光，更登一层楼。',
    appreciation: '由景入理，寓意进取与格局，言浅意深，格律整齐。',
    notes: '“更上一层楼”常引申为不断提升眼界与境界。'
  },
  {
    id: 4,
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    theme: '山水',
    content: ['日照香炉生紫烟，', '遥看瀑布挂前川。', '飞流直下三千尺，', '疑是银河落九天。'],
    tags: ['写景', '夸张', '壮丽'],
    translation: '阳光照在香炉峰上生起紫色烟雾，远看瀑布像白绢挂在山前。飞流直下三千尺，让人怀疑是银河从九天落下。',
    appreciation: '想象奇特，比喻夸张，展现李白浪漫主义风格，气势磅礴。',
    notes: '运用夸张手法，将瀑布比作银河，极具视觉冲击力。'
  },
  {
    id: 5,
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    theme: '冬景',
    content: ['千山鸟飞绝，', '万径人踪灭。', '孤舟蓑笠翁，', '独钓寒江雪。'],
    tags: ['写景', '孤寂', '意境'],
    translation: '千山万岭不见飞鸟，万千道路不见人影。孤舟上披蓑戴笠的老翁，独自在寒江雪中垂钓。',
    appreciation: '以极简笔墨勾勒出空灵寂静的冬景，意境深远，寄托诗人孤高情怀。',
    notes: '前两句写大景之空寂，后两句写小景之孤傲，对比鲜明。'
  },
  {
    id: 6,
    title: '相思',
    author: '王维',
    dynasty: '唐',
    theme: '爱情',
    content: ['红豆生南国，', '春来发几枝。', '愿君多采撷，', '此物最相思。'],
    tags: ['抒情', '婉约', '含蓄'],
    translation: '红豆生长在南方，春天来了又发几枝。希望你多采摘一些，因为此物最能寄托相思。',
    appreciation: '借物抒情，语言朴素而情感真挚，以红豆象征相思，含蓄隽永。',
    notes: '红豆自古被视为相思之物，诗人借物抒情，委婉动人。'
  }
])

const query = ref('')
const dynasty = ref('全部')
const theme = ref('全部')
const author = ref('全部')

const activePoem = ref(null)
const showDetail = ref(false)

const dynasties = computed(() => ['全部', ...new Set(poems.value.map(p => p.dynasty))])
const themes = computed(() => ['全部', ...new Set(poems.value.map(p => p.theme))])
const authors = computed(() => ['全部', ...new Set(poems.value.map(p => p.author))])

const poets = ref([
  { id: 1, name: '李白', photo: new URL('../assets/photo1.png', import.meta.url).href },
  { id: 2, name: '杜甫', photo: null },
  { id: 3, name: '王维', photo: null },
  { id: 4, name: '白居易', photo: null },
  { id: 5, name: '苏轼', photo: null },
  { id: 6, name: '辛弃疾', photo: null },
  { id: 7, name: '李清照', photo: null },
  { id: 8, name: '陶渊明', photo: new URL('../assets/photo2.png', import.meta.url).href },
  { id: 9, name: '王安石', photo: null },
  { id: 10, name: '孟浩然', photo: null },
  { id: 11, name: '柳宗元', photo: null },
  { id: 12, name: '韩愈', photo: null }
])

const filteredPoems = computed(() => {
  const q = query.value.trim()
  return poems.value.filter(p => {
    const matchQ =
      !q ||
      p.title.includes(q) ||
      p.author.includes(q) ||
      p.content.join('').includes(q) ||
      p.tags.some(t => t.includes(q))
    const matchDynasty = dynasty.value === '全部' || p.dynasty === dynasty.value
    const matchTheme = theme.value === '全部' || p.theme === theme.value
    const matchAuthor = author.value === '全部' || p.author === author.value
    return matchQ && matchDynasty && matchTheme && matchAuthor
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
  dynasty.value = '全部'
  theme.value = '全部'
  author.value = '全部'
}
function searchPoems() {
  // 搜索功能已经通过v-model自动实现，这里可以添加搜索动画或其他逻辑
  console.log('搜索关键词:', query.value)
}

function refreshPoems() {
  // 随机打乱诗词顺序实现换一批功能
  poems.value = [...poems.value].sort(() => Math.random() - 0.5)
}
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
          <article
            v-for="p in filteredPoems"
            :key="p.id"
            class="card"
            @click="openDetail(p)"
          >
            <header class="card-head">
              <h3 class="card-title">{{ p.title }}</h3>
              <div class="meta">
                <span class="pill">{{ p.author }}</span>
                <span class="pill">{{ p.dynasty }}</span>
                <span class="pill theme">{{ p.theme }}</span>
              </div>
            </header>
            <div class="content">
              <p v-for="(line, i) in p.content" :key="i" class="line">{{ line }}</p>
            </div>
            <footer class="tags">
              <span v-for="(t,i) in p.tags" :key="i" class="tag">#{{ t }}</span>
            </footer>
          </article>

          <div v-if="filteredPoems.length === 0" class="empty">
            暂无匹配的诗作，试试调整筛选或关键词。
          </div>
        </div>
      </section>

      </div>

      <aside class="filter-sidebar">
        <div class="filter-card">
          <h3 class="filter-title">分类筛选</h3>
          


          <div class="category-tags">
            <h4 class="category-title">类型</h4>
            <div class="tags-container">
              <span class="category-tag">抒情</span>
              <span class="category-tag">写景</span>
              <span class="category-tag">写人</span>
              <span class="category-tag">山水</span>
              <span class="category-tag">咏物</span>
              <span class="category-tag">婉约</span>
              <span class="category-tag">春天</span>
              <span class="category-tag">送别</span>
              <span class="category-tag">秋天</span>
              <span class="category-tag">离别</span>
              <span class="category-tag">爱情</span>
              <span class="category-tag">思乡</span>
              <span class="category-tag">爱国</span>
              <span class="category-tag">怀古</span>
              <span class="category-tag">哲理</span>
              <span class="category-tag">节日</span>
              <span class="category-tag">友情</span>
              <span class="category-tag">边塞</span>
              <span class="category-tag">闺怨</span>
              <span class="category-tag">战争</span>
              <span class="category-tag">梅花</span>
              <span class="category-tag">豪放</span>
              <span class="category-tag">田园</span>
              <span class="category-tag">月亮</span>
              <span class="category-tag">夏天</span>
              <span class="category-tag">雪</span>
              <span class="category-tag">励志</span>
              <span class="category-tag">冬天</span>
              <span class="category-tag">重阳</span>
              <span class="category-tag">悼亡</span>
              <span class="category-tag">中秋</span>
              <span class="category-tag">七夕</span>
              <span class="category-tag">荷花</span>
              <span class="category-tag">元宵节</span>
              <span class="category-tag">寒食节</span>
              <span class="category-tag">地名</span>
              <span class="category-tag">清明节</span>
              <span class="category-tag">春节</span>
              <span class="category-tag">菊花</span>
              <span class="category-tag">端午节</span>
              <span class="category-tag">黄河</span>
              <span class="category-tag">惜时</span>
              <span class="category-tag">更多>></span>
            </div>
          </div>

          <div class="category-tags">
            <h4 class="category-title">诗人</h4>
            <div class="tags-container">
              <span class="category-tag">李白</span>
              <span class="category-tag">杜甫</span>
              <span class="category-tag">王维</span>
              <span class="category-tag">孟浩然</span>
              <span class="category-tag">白居易</span>
              <span class="category-tag">李商隐</span>
              <span class="category-tag">杜牧</span>
              <span class="category-tag">王之涣</span>
              <span class="category-tag">柳宗元</span>
              <span class="category-tag">韩愈</span>
              <span class="category-tag">苏轼</span>
              <span class="category-tag">李清照</span>
              <span class="category-tag">辛弃疾</span>
              <span class="category-tag">陆游</span>
              <span class="category-tag">王安石</span>
              <span class="category-tag">更多>></span>
            </div>
          </div>

          <div class="category-tags">
            <h4 class="category-title">朝代</h4>
            <div class="tags-container">
              <span class="category-tag">先秦</span>
              <span class="category-tag">汉朝</span>
              <span class="category-tag">魏晋</span>
              <span class="category-tag">南北朝</span>
              <span class="category-tag">隋朝</span>
              <span class="category-tag">唐朝</span>
              <span class="category-tag">宋朝</span>
              <span class="category-tag">元朝</span>
              <span class="category-tag">明朝</span>
              <span class="category-tag">清朝</span>
              <span class="category-tag">更多>></span>
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
            <p v-for="(line, i) in activePoem.content" :key="i" class="line">{{ line }}</p>
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
  background-image: url('../assets/photo1.png');
  background-repeat: repeat;
  background-position: center;
  background-size: auto;
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
.tags {
  margin-top: 8px;
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
  background: #ffffff;
  z-index: 50;
}
.panel {
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  border: none;
  border-radius: 0;
  box-shadow: none;
  position: relative;
  overflow: auto;
}
.close {
  position: absolute;
  top: 8px;
  right: 10px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  color: var(--muted);
}
.close:hover { color: var(--text); }
.panel-body {
  padding: 18px 18px 22px;
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

</style>