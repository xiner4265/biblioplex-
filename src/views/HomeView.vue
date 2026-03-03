<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-title-area" @click="goToBiblioplex" title="点击查看 The Biblioplex 卡牌">
          <img src="/images/The Biblioplex s.png" alt="茂典阁" class="hero-icon" />
          <h1 class="hero-title">斯翠海文大书库茂典阁</h1>
        </div>
        <p class="hero-subtitle">Strixhaven Biblioplex</p>
        <p class="hero-description">万智牌卡牌查询门户</p>
        
        <div class="search-container">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索卡牌名称（支持中文和英文）"
              size="large"
              clearable
              @keyup.enter="goToSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
            <el-button class="search-btn" type="primary" size="large" @click="goToSearch">
              <el-icon><Search /></el-icon>
              <span>搜索</span>
            </el-button>
          </div>
          
          <div class="quick-actions">
            <el-button class="action-btn" @click="goToRandom">
              <el-icon><MagicStick /></el-icon>
              <span>随机卡牌</span>
            </el-button>
            <el-button class="action-btn" @click="showAdvancedDialog = true">
              <el-icon><Setting /></el-icon>
              <span>高级搜索</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新系列 -->
    <div class="sets-section" v-if="!setsLoading && latestSets.length > 0">
      <h2 class="section-title clickable" @click="goToAllSets">最新系列 <el-icon><ArrowRight /></el-icon></h2>
      <div class="sets-grid">
        <div 
          v-for="set in latestSets" 
          :key="set.code" 
          class="set-card"
          @click="goToSet(set.code)"
        >
          <div class="set-image-container">
            <img 
              :src="set.icon_svg_uri" 
              :alt="set.name"
              class="set-icon"
              @error="handleIconError"
            />
          </div>
          <div class="set-info">
            <h3 class="set-name">{{ set.name }}</h3>
            <p class="set-code">{{ set.code.toUpperCase() }}</p>
            <p class="set-date">{{ formatDate(set.released_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="sets-section" v-else-if="!setsLoading && latestSets.length === 0">
      <h2 class="section-title">最新系列</h2>
      <el-empty description="暂无系列数据" class="empty-state" />
    </div>

    <div class="sets-section" v-else>
      <h2 class="section-title">最新系列</h2>
      <div class="sets-grid">
        <div v-for="i in 6" :key="i" class="set-card skeleton">
          <el-skeleton animated>
            <template #template>
              <div style="display: flex; align-items: center; gap: 12px;">
                <el-skeleton-item variant="image" style="width: 48px; height: 48px;" />
                <div style="flex: 1;">
                  <el-skeleton-item variant="text" style="width: 60%;" />
                  <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px;" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>
  </div>

  <!-- 高级搜索弹窗 -->
  <el-dialog
    v-model="showAdvancedDialog"
    title="高级搜索"
    width="400px"
    :close-on-click-modal="false"
    class="advanced-dialog"
  >
    <el-form :model="advancedForm" label-position="top" class="advanced-form">
      <el-form-item label="卡牌名称" class="form-item">
        <el-input v-model="advancedForm.name" placeholder="输入卡牌名称（英文）" class="form-input" />
      </el-form-item>
      
      <el-form-item label="卡牌类型" class="form-item">
        <el-input v-model="advancedForm.type" placeholder="例如: creature, instant, legendary" class="form-input" />
      </el-form-item>
      
      <el-form-item label="法术力颜色" class="form-item">
        <el-checkbox-group v-model="advancedForm.colors" class="color-checkbox-group">
          <el-checkbox-button label="W" class="color-checkbox">
            <img src="/symbols/white.svg" alt="白" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="U" class="color-checkbox">
            <img src="/symbols/blue.svg" alt="蓝" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="B" class="color-checkbox">
            <img src="/symbols/black.svg" alt="黑" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="R" class="color-checkbox">
            <img src="/symbols/red.svg" alt="红" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="G" class="color-checkbox">
            <img src="/symbols/green.svg" alt="绿" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="C" class="color-checkbox">
            <img src="/symbols/card-symbol-C.svg" alt="无色" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item label="稀有度" class="form-item">
        <el-select v-model="advancedForm.rarity" placeholder="选择稀有度" clearable style="width: 100%" class="form-select">
          <el-option label="普通 Common" value="common" />
          <el-option label="非普通 Uncommon" value="uncommon" />
          <el-option label="稀有 Rare" value="rare" />
          <el-option label="秘稀 Mythic" value="mythic" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="法术力费用" class="form-item">
        <el-input v-model="advancedForm.cmc" placeholder="例如: 3, <5, >=2" class="form-input" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showAdvancedDialog = false" class="footer-btn">取消</el-button>
        <el-button type="primary" @click="handleAdvancedSearch" class="footer-btn primary">搜索</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { cardAPI } from '../api/card'

const router = useRouter()
const searchQuery = ref('')
const sets = ref([])
const setsLoading = ref(true)
const showAdvancedDialog = ref(false)

const advancedForm = reactive({
  name: '',
  type: '',
  colors: [],
  rarity: '',
  cmc: ''
})

const latestSets = computed(() => {
  return sets.value
    .filter(set => set.released_at && new Date(set.released_at) <= new Date() && (set.set_type === 'expansion' || set.set_type === 'core'))
    .sort((a, b) => new Date(b.released_at) - new Date(a.released_at))
    .slice(0, 8)
})

const fetchSets = async (retryCount = 0) => {
  setsLoading.value = true
  try {
    const data = await cardAPI.getSets()
    console.log('Sets data:', data)
    sets.value = Array.isArray(data) ? data : (data.data || [])
    console.log('Latest sets:', latestSets.value)
  } catch (error) {
    console.error('获取系列失败:', error)
    
    // 如果是网络错误，尝试重试
    if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response)) {
      console.log(`尝试重新获取系列... (${retryCount + 1}/2)`)
      setTimeout(() => fetchSets(retryCount + 1), 1000)
      return
    }
    
    sets.value = []
  } finally {
    setsLoading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const handleIconError = (e) => {
  e.target.style.display = 'none'
}

const goToSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
  } else {
    router.push('/search')
  }
}

const goToRandom = () => {
  router.push('/random')
}

const goToAllSets = () => {
  router.push('/sets')
}

const goToSet = (setCode) => {
  router.push({
    path: '/search',
    query: { set: setCode }
  })
}

const handleAdvancedSearch = () => {
  const query = buildAdvancedQuery()
  showAdvancedDialog.value = false
  router.push({
    path: '/search',
    query: { q: query }
  })
}

const buildAdvancedQuery = () => {
  const parts = []
  
  if (advancedForm.name) {
    parts.push(advancedForm.name)
  }
  
  if (advancedForm.type) {
    parts.push(`t:${advancedForm.type}`)
  }
  
  if (advancedForm.colors.length > 0) {
    parts.push(`c:${advancedForm.colors.join('')}`)
  }
  
  if (advancedForm.rarity) {
    parts.push(`r:${advancedForm.rarity}`)
  }
  
  if (advancedForm.cmc) {
    // 检查用户输入是否包含比较运算符
    if (/^[<>]=?\d+$/.test(advancedForm.cmc)) {
      // 如果包含比较运算符，直接使用
      parts.push(`cmc${advancedForm.cmc}`)
    } else if (/^\d+$/.test(advancedForm.cmc)) {
      // 如果是纯数字，添加等号
      parts.push(`cmc=${advancedForm.cmc}`)
    } else {
      // 其他情况，直接使用
      parts.push(`cmc${advancedForm.cmc}`)
    }
  }
  
  return parts.join(' ')
}

const goToBiblioplex = async () => {
  try {
    const data = await cardAPI.searchCards('The Biblioplex')
    if (data.items && data.items.length > 0) {
      const card = data.items[0]
      router.push(`/card/${card.id}`)
    } else {
      ElMessage.error('未找到 The Biblioplex 卡牌')
    }
  } catch (error) {
    console.error('搜索卡牌失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  }
}

onMounted(() => {
  fetchSets()
})
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 200px);
  padding-bottom: 60px;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  z-index: -1;
}

.hero-content {
  max-width: 1000px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.hero-title-area {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 20px 32px;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.hero-title-area:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.hero-icon {
  width: 140px;
  height: 140px;
  border-radius: 24px;
  object-fit: contain;
  margin-bottom: 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, var(--accent-color) 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.4rem;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  font-weight: 500;
  transition: color 0.3s ease;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 40px 0;
  transition: color 0.3s ease;
  line-height: 1.6;
}

.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.search-box:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.search-input {
  flex: 1;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 16px;
  box-shadow: none;
  background: transparent;
  padding: 0 16px;
  border: none;
}

.search-box :deep(.el-input__inner) {
  height: 56px;
  font-size: 1.2rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.search-icon {
  font-size: 1.4rem;
  color: var(--accent-color);
  transition: color 0.3s ease;
}

.search-btn {
  border-radius: 16px;
  padding: 0 32px;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--accent-color) 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  white-space: nowrap;
  color: white;
}

.search-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 600px;
  align-items: center;
}

.action-btn {
  flex: 1;
  min-width: 200px;
  height: 64px !important;
  margin: 0 !important;
  border-radius: 16px !important;
  padding: 0 36px !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  transition: all 0.3s ease !important;
  border: 1px solid var(--border-color) !important;
  justify-content: center !important;
  width: 100% !important;
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  box-sizing: border-box !important;
  backdrop-filter: blur(8px);
}

.action-btn:hover {
  background: var(--bg-secondary) !important;
  transform: translateY(-3px) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
  border-color: var(--accent-color) !important;
  color: var(--accent-color) !important;
}

.action-btn .el-icon {
  font-size: 20px !important;
  color: var(--accent-color) !important;
  transition: color 0.3s ease !important;
}

.action-btn:hover .el-icon {
  color: var(--accent-color) !important;
}

.action-btn span {
  font-size: 1.1rem !important;
  transition: color 0.3s ease !important;
}

.sets-section {
  padding: 60px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 32px 0;
  text-align: center;
  transition: color 0.3s ease;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color), #2563eb);
  border-radius: 2px;
}

.section-title.clickable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  padding: 12px 24px;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.section-title.clickable:hover {
  color: var(--accent-color);
  background: rgba(59, 130, 246, 0.1);
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.set-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.set-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: var(--accent-color);
}

.set-card.skeleton {
  cursor: default;
}

.set-card.skeleton:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: none;
  border-color: var(--border-color);
}

.set-image-container {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.set-card:hover .set-image-container {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.05);
}

.set-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.set-card:hover .set-icon {
  transform: scale(1.1);
}

.set-info {
  flex: 1;
  min-width: 0;
}

.set-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.set-card:hover .set-name {
  color: var(--accent-color);
}

.set-code {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
  font-weight: 500;
}

.set-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  transition: color 0.3s ease;
}

.empty-state {
  margin: 80px 0;
}

:deep(.el-empty__description) {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

:deep(.el-empty__image) {
  margin-bottom: 24px;
}

/* 高级搜索弹窗样式 */
.advanced-dialog {
  border-radius: 20px !important;
  overflow: hidden !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(12px) !important;
}

:deep(.advanced-dialog .el-dialog__header) {
  background: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-color) !important;
  padding: 20px 24px !important;
}

:deep(.advanced-dialog .el-dialog__title) {
  font-size: 1.3rem !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

:deep(.advanced-dialog .el-dialog__body) {
  padding: 24px !important;
  background: var(--bg-secondary) !important;
}

.advanced-form {
  width: 100%;
}

.form-item {
  margin-bottom: 20px;
}

:deep(.form-item .el-form-item__label) {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  margin-bottom: 8px !important;
}

.form-input,
.form-select {
  border-radius: 10px !important;
  border: 1px solid var(--border-color) !important;
  transition: all 0.3s ease !important;
}

:deep(.form-input .el-input__wrapper),
:deep(.form-select .el-input__wrapper) {
  border-radius: 10px !important;
  box-shadow: none !important;
  transition: all 0.3s ease !important;
}

:deep(.form-input .el-input__wrapper:hover),
:deep(.form-select .el-input__wrapper:hover) {
  border-color: var(--accent-color) !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

:deep(.form-input .el-input__wrapper.is-focus),
:deep(.form-select .el-input__wrapper.is-focus) {
  border-color: var(--accent-color) !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
}

.color-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.color-checkbox {
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.color-checkbox .el-checkbox-button__inner) {
  border-radius: 8px !important;
  padding: 8px 12px !important;
  transition: all 0.3s ease !important;
}

:deep(.color-checkbox .el-checkbox-button__inner:hover) {
  border-color: var(--accent-color) !important;
  color: var(--accent-color) !important;
}

:deep(.color-checkbox.is-checked .el-checkbox-button__inner) {
  background-color: var(--accent-color) !important;
  border-color: var(--accent-color) !important;
  color: white !important;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
  padding: 20px 24px !important;
  background: var(--bg-secondary) !important;
  border-top: 1px solid var(--border-color) !important;
}

.footer-btn {
  width: 100px !important;
  height: 44px !important;
  border-radius: 10px !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
}

.footer-btn.primary {
  background: linear-gradient(135deg, var(--accent-color) 0%, #2563eb 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
}

.footer-btn.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5) !important;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  /* iPad 横屏 */
  .hero-section {
    padding: 80px 20px;
  }
  
  .hero-icon {
    width: 120px;
    height: 120px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .sets-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  /* iPad 竖屏 */
  .hero-section {
    padding: 60px 16px;
  }

  .hero-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-description {
    font-size: 1rem;
    margin-bottom: 32px;
  }

  .search-box {
    padding: 10px;
    gap: 12px;
  }
  
  .search-box :deep(.el-input__inner) {
    height: 48px;
    font-size: 1.1rem;
  }
  
  .search-btn {
    height: 48px;
    padding: 0 24px;
    font-size: 1rem;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .action-btn {
    width: 100% !important;
    max-width: 300px !important;
    height: 56px !important;
    padding: 0 28px !important;
    min-width: 180px !important;
  }
  
  .action-btn span {
    font-size: 1rem !important;
  }
  
  .action-btn .el-icon {
    font-size: 18px !important;
  }
  
  .sets-section {
    padding: 40px 16px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .sets-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  
  .set-card {
    padding: 16px;
    gap: 16px;
  }
  
  .set-image-container {
    width: 56px;
    height: 56px;
  }
  
  .set-icon {
    width: 36px;
    height: 36px;
  }
  
  .set-name {
    font-size: 1rem;
  }
  
  .set-code {
    font-size: 0.85rem;
  }
  
  .set-date {
    font-size: 0.75rem;
  }
  
  /* 高级搜索弹窗响应式 */
  :deep(.advanced-dialog) {
    width: 95% !important;
    max-width: 320px !important;
    margin: 0 !important;
    top: 2% !important;
    max-height: 95vh !important;
    height: 95vh !important;
    display: flex !important;
    flex-direction: column !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  
  :deep(.advanced-dialog .el-dialog__header) {
    padding: 16px 20px !important;
  }
  
  :deep(.advanced-dialog .el-dialog__title) {
    font-size: 1.1rem !important;
  }
  
  :deep(.advanced-dialog .el-dialog__body) {
    padding: 20px !important;
    flex: 1 !important;
    overflow-y: auto !important;
  }
  
  :deep(.advanced-dialog .el-dialog__footer) {
    padding: 16px 20px !important;
  }
  
  .footer-btn {
    width: 90px !important;
    height: 40px !important;
    font-size: 0.9rem !important;
  }
  
  .color-checkbox-group {
    gap: 8px;
  }
  
  :deep(.color-checkbox .el-checkbox-button__inner) {
    padding: 6px 10px !important;
  }
  
  :deep(.color-checkbox img) {
    width: 16px !important;
    height: 16px !important;
  }
}

@media (max-width: 480px) {
  /* 安卓手机 */
  .hero-section {
    padding: 40px 12px;
  }
  
  .hero-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }
  
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-description {
    font-size: 0.9rem;
    margin-bottom: 24px;
  }
  
  .search-box {
    gap: 8px;
  }
  
  .search-btn {
    padding: 0 16px;
    font-size: 0.9rem;
  }
  
  .search-btn span {
    display: none;
  }
  
  .action-btn {
    padding: 0 20px !important;
    font-size: 0.9rem !important;
  }
  
  .sets-section {
    padding: 30px 16px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .sets-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .set-card {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }
  
  .set-info {
    text-align: center;
  }
  
  .set-name {
    white-space: normal;
    overflow: visible;
  }
  
  /* 高级搜索弹窗响应式 */
  :deep(.advanced-dialog) {
    width: 98% !important;
    max-width: 280px !important;
  }
  
  :deep(.advanced-dialog .el-dialog__header) {
    padding: 12px 16px !important;
  }
  
  :deep(.advanced-dialog .el-dialog__title) {
    font-size: 1rem !important;
  }
  
  :deep(.advanced-dialog .el-dialog__body) {
    padding: 16px !important;
  }
  
  :deep(.form-item .el-form-item__label) {
    font-size: 0.9rem !important;
  }
  
  :deep(.form-input .el-input__inner),
  :deep(.form-select .el-input__inner) {
    font-size: 0.9rem !important;
    height: 40px !important;
  }
  
  .footer-btn {
    width: 80px !important;
    height: 36px !important;
    font-size: 0.8rem !important;
  }
}
</style>
