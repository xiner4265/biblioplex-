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
              placeholder="搜索卡牌名称（英文）..."
              size="large"
              clearable
              @keyup.enter="goToSearch"
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
            <el-button class="action-btn primary" @click="goToSearch">
              <el-icon><Search /></el-icon>
              <span>搜索卡牌</span>
            </el-button>
            <el-button class="action-btn secondary" @click="goToRandom">
              <el-icon><MagicStick /></el-icon>
              <span>随机卡牌</span>
            </el-button>
            <el-button class="action-btn secondary" @click="showAdvancedDialog = true">
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
      <el-empty description="暂无系列数据" />
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
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="advancedForm" label-position="top">
      <el-form-item label="卡牌名称">
        <el-input v-model="advancedForm.name" placeholder="输入卡牌名称（英文）" />
      </el-form-item>
      
      <el-form-item label="卡牌类型">
        <el-input v-model="advancedForm.type" placeholder="例如: creature, instant, legendary" />
      </el-form-item>
      
      <el-form-item label="法术力颜色">
        <el-checkbox-group v-model="advancedForm.colors">
          <el-checkbox-button label="W">
            <img src="/symbols/white.svg" alt="白" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="U">
            <img src="/symbols/blue.svg" alt="蓝" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="B">
            <img src="/symbols/black.svg" alt="黑" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="R">
            <img src="/symbols/red.svg" alt="红" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="G">
            <img src="/symbols/green.svg" alt="绿" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
          <el-checkbox-button label="C">
            <img src="/symbols/card-symbol-C.svg" alt="无色" style="width: 20px; height: 20px;" />
          </el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item label="稀有度">
        <el-select v-model="advancedForm.rarity" placeholder="选择稀有度" clearable style="width: 100%">
          <el-option label="普通 Common" value="common" />
          <el-option label="非普通 Uncommon" value="uncommon" />
          <el-option label="稀有 Rare" value="rare" />
          <el-option label="秘稀 Mythic" value="mythic" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="法术力费用">
        <el-input v-model="advancedForm.cmc" placeholder="例如: 3, <5, >=2" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="showAdvancedDialog = false">取消</el-button>
      <el-button type="primary" @click="handleAdvancedSearch">搜索</el-button>
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
    .filter(set => set.released_at && new Date(set.released_at) <= new Date())
    .sort((a, b) => new Date(b.released_at) - new Date(a.released_at))
    .slice(0, 8)
})

const fetchSets = async (retryCount = 0) => {
  setsLoading.value = true
  try {
    const data = await cardAPI.getSets()
    console.log('Sets data:', data)
    sets.value = data.data || []
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
    parts.push(`cmc${advancedForm.cmc}`)
  }
  
  return parts.join(' ')
}

const goToBiblioplex = async () => {
  try {
    const data = await cardAPI.searchCards('The Biblioplex')
    if (data.data && data.data.length > 0) {
      const card = data.data[0]
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
  padding: 80px 24px;
  text-align: center;
}

.hero-content {
  max-width: 1000px;
}

.hero-title-area {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 16px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.hero-title-area:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.hero-icon {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  object-fit: contain;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #6b7280;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.hero-description {
  font-size: 1rem;
  color: #9ca3af;
  margin: 0 0 32px 0;
}

.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 800px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: none;
  background: transparent;
  padding: 0 12px;
}

.search-box :deep(.el-input__inner) {
  height: 48px;
  font-size: 1.1rem;
  background: transparent;
  border: none;
}

.search-icon {
  font-size: 1.2rem;
  color: #3b82f6;
}

.search-btn {
  border-radius: 12px;
  padding: 0 24px;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.quick-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-btn.secondary:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.quick-actions .el-button {
  padding: 16px 32px;
  font-size: 1rem;
}

.sets-section {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  text-align: center;
}

.section-title.clickable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.section-title.clickable:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.set-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.set-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #3b82f6;
}

.set-card.skeleton {
  cursor: default;
}

.set-card.skeleton:hover {
  box-shadow: none;
  transform: none;
  border-color: #e5e7eb;
}

.set-image-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
  flex-shrink: 0;
}

.set-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.set-info {
  flex: 1;
  min-width: 0;
}

.set-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.set-code {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 2px 0;
}

.set-date {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 16px;
  }

  .hero-icon {
    width: 80px;
    height: 80px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }

  .quick-actions .el-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>
