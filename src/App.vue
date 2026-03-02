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
          <div class="menu-container">
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
            </el-menu>
            <div class="theme-toggle">
              <el-button 
                :icon="isDark ? 'Moon' : 'Sunny'" 
                circle 
                @click="toggleTheme"
                :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
              />
            </div>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer>
        <p>© 2026 斯翠海文大书库茂典阁 - 万智牌卡牌查询工具</p>
        <p>本网站使用 Scryfall API 提供数据服务，仅供学习交流使用</p>
        <p>Magic: The Gathering 及相关商标均为 Wizards of the Coast LLC 的注册商标</p>
        <p>本网站非官方网站，与 Wizards of the Coast 无关联</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Sunny, Moon } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.name || 'home')
const isDark = ref(false)

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

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  // 从本地存储读取主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<style>
/* 全局CSS变量 - 浅色模式 */
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: rgba(255, 255, 255, 0.95);
  --text-primary: #1a1a1a;
  --text-secondary: rgba(0, 0, 0, 0.7);
  --border-color: rgba(0, 0, 0, 0.1);
  --accent-color: #3b82f6;
  --bg-blur: rgba(255, 255, 255, 0.95);
}

/* 深色模式变量 */
.dark {
  --bg-primary: #0f172a;
  --bg-secondary: rgba(15, 23, 42, 0.95);
  --text-primary: #f1f5f9;
  --text-secondary: rgba(241, 245, 249, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
  --accent-color: #60a5fa;
  --bg-blur: rgba(15, 23, 42, 0.95);
}



/* 深色模式下的Element Plus遮罩样式 */
.dark .el-overlay {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

.dark .el-dialog__wrapper {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

.dark .el-drawer__wrapper {
  background-color: rgba(0, 0, 0, 0.6) !important;
}
</style>

<style scoped>
#app {
  min-height: 100vh;
  background: 
    linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)),
    url('/images/biblioplex-bg.jpg') center/cover no-repeat fixed;
  transition: background 0.3s ease;
}

/* 深色模式下的背景图片调整 */
.dark #app {
  background:
    linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url('/images/biblioplex-bg.jpg') center/cover no-repeat fixed;
  transition: background 0.3s ease;
}

:deep(.el-container) {
  min-height: 100vh;
}

:deep(.el-header) {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 0;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
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

.menu-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  display: flex;
  align-items: center;
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
  transition: all 0.3s ease;
}

.logo-text h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-color);
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  transition: color 0.3s ease;
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
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

:deep(.el-menu-item:hover) {
  background: transparent;
  color: var(--accent-color);
}

:deep(.el-menu-item.is-active) {
  background: transparent;
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

:deep(.el-main) {
  padding: 32px 24px;
}

:deep(.el-footer) {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 20px 24px;
  backdrop-filter: blur(10px);
  height: auto !important;
  min-height: 60px;
  transition: all 0.3s ease;
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
