<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <div class="brand">诗歌鉴赏</div>
    <nav class="nav-actions">
      <a href="#" class="nav-link">首页</a>
      <a href="#" class="nav-link">分类</a>
      <a href="#" class="nav-link">关于</a>
      <button class="login-btn">登录</button>
    </nav>
  </header>
  <div class="app-offset"></div>
  <RouterView />
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
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link {
  color: #334155;
  font-size: 16px;
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 8px;
}
.nav-link:hover {
  background: #f1f5f9;
}

.login-btn {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #1f2937;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}
.login-btn:hover {
  background: #f8fafc;
}

.app-offset {
  height: 88px; /* 与 .app-header 高度一致，用于推开内容，避免被覆盖 */
}
</style>
