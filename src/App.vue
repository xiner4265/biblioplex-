<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo" @click="goHome">
            <img src="/images/The Biblioplex s.png" alt="茂典阁" class="logo-img" />
            <div class="logo-text">
              <h1>斯翠海文大书库茂典阁</h1>
              <span class="subtitle">Strixhaven Biblioplex - MTGA卡牌查询</span>
            </div>
          </div>
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            @select="handleMenuSelect"
          >
            <el-menu-item index="home">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="search">
              <el-icon><Search /></el-icon>
              <span>搜索</span>
            </el-menu-item>
            <el-menu-item index="random">
              <el-icon><MagicStick /></el-icon>
              <span>随机卡牌</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer>
        <p>斯翠海文大书库茂典阁 - 使用 Scryfall API</p>
        <p>万智牌是威世智公司的注册商标。本网站仅供学习交流使用。</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.name || 'home')

const goHome = () => {
  router.push('/')
}

const handleMenuSelect = (index) => {
  switch (index) {
    case 'home':
      router.push('/')
      break
    case 'search':
      router.push('/search')
      break
    case 'random':
      router.push('/random')
      break
    case 'about':
      router.push('/about')
      break
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: 
    linear-gradient(135deg, rgba(245, 247, 250, 0.7) 0%, rgba(240, 242, 245, 0.8) 100%),
    url('/images/biblioplex-bg.jpg') center/cover no-repeat fixed;
}

:deep(.el-container) {
  min-height: 100vh;
}

:deep(.el-header) {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.logo:hover {
  background: rgba(255, 255, 255, 0.05);
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px;
}

.logo-text h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
  line-height: 1.3;
}

.logo-text .subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-menu) {
  background: transparent;
  border: none;
}

:deep(.el-menu-item) {
  color: rgba(0, 0, 0, 0.7);
  border-bottom: 2px solid transparent;
}

:deep(.el-menu-item:hover) {
  background: transparent;
  color: #3b82f6;
}

:deep(.el-menu-item.is-active) {
  background: transparent;
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

:deep(.el-main) {
  padding: 32px 24px;
}

:deep(.el-footer) {
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
  color: rgba(0, 0, 0, 0.7);
  font-size: 0.9rem;
  padding: 20px 24px;
  backdrop-filter: blur(10px);
  height: auto !important;
  min-height: 60px;
}

:deep(.el-footer p) {
  margin: 6px 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .logo {
    width: 100%;
    justify-content: center;
  }

  .logo-text h1 {
    font-size: 1.1rem;
  }

  :deep(.el-menu) {
    width: 100%;
    justify-content: center;
  }
}
</style>
