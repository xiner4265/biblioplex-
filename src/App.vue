<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo" @click="goHome">
            <img src="/images/The Biblioplex s.png" alt="茂典阁" class="logo-img" />
            <div class="logo-text">
              <h1>斯翠海文大书库茂典阁</h1>
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
  width: 100%;
  box-sizing: border-box;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.logo-text .subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
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

@media (max-width: 1024px) {
  /* iPad 横屏 */
  .logo-text h1 {
    font-size: 1.1rem;
    max-width: 180px;
  }
  
  .logo-text .subtitle {
    max-width: 180px;
  }
}

@media (max-width: 768px) {
  /* iPad 竖屏 */
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
    max-width: 250px;
  }
  
  .logo-text .subtitle {
    max-width: 250px;
  }

  :deep(.el-menu) {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  :deep(.el-menu-item) {
    padding: 0 10px !important;
  }
}

@media (max-width: 480px) {
  /* 安卓手机 */
  .header-content {
    padding: 8px 12px !important;
    gap: 8px !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .logo {
    gap: 6px !important;
    padding: 4px !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
  }
  
  .logo-img {
    width: 32px !important;
    height: 32px !important;
  }
  
  .logo-text {
    text-align: center !important;
  }
  
  .logo-text h1 {
    font-size: 0.8rem !important;
    max-width: 200px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.2 !important;
    margin: 0 !important;
  }
  
  .logo-text .subtitle {
    display: none !important;
  }
  
  :deep(.el-menu) {
    width: 100% !important;
    justify-content: center !important;
    flex-wrap: wrap !important;
  }
  
  :deep(.el-menu-item) {
    font-size: 0.7rem !important;
    padding: 0 8px !important;
    margin: 0 !important;
    height: 36px !important;
    line-height: 36px !important;
  }
  
  :deep(.el-menu-item .el-icon) {
    font-size: 12px !important;
    margin-right: 4px !important;
  }
  
  :deep(.el-menu-item span) {
    font-size: 0.7rem !important;
  }
  
  :deep(.el-header) {
    padding: 0 !important;
    height: auto !important;
    min-height: 80px !important;
  }
}
</style>
