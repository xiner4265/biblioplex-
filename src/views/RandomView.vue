<template>
  <div class="random-view">
    <el-card class="random-card" shadow="hover">
      <div class="random-header">
        <el-icon class="random-icon"><MagicStick /></el-icon>
        <h2>随机卡牌</h2>
        <p>点击下方按钮，探索万智牌的无限可能</p>
      </div>

      <!-- 条件筛选 -->
      <div class="filter-section">
        <el-collapse v-model="activeFilterNames" class="filter-collapse">
          <el-collapse-item title="条件筛选" name="filter" class="filter-item">
            <el-form :model="filterForm" label-position="top" class="filter-form">
              <el-form-item label="法术力费用" class="filter-form-item">
                <el-input 
                  v-model="filterForm.cmc" 
                  placeholder="例如: 2, <5, >=3" 
                  class="filter-input"
                />
              </el-form-item>
              
              <el-form-item label="法术力颜色" class="filter-form-item">
                <el-checkbox-group v-model="filterForm.colors" class="color-checkbox-group">
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
              
              <el-form-item label="卡牌类型" class="filter-form-item">
                <el-input v-model="filterForm.type" placeholder="例如: creature, instant, sorcery" class="filter-input" />
              </el-form-item>
              
              <el-form-item label="稀有度" class="filter-form-item">
                <el-select v-model="filterForm.rarity" placeholder="选择稀有度" clearable style="width: 100%" class="filter-select">
                  <el-option label="普通 Common" value="common" />
                  <el-option label="非普通 Uncommon" value="uncommon" />
                  <el-option label="稀有 Rare" value="rare" />
                  <el-option label="秘稀 Mythic" value="mythic" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>

      <el-button
        type="primary"
        size="large"
        @click="getRandomCard"
        :loading="loading"
        class="random-btn"
      >
        <el-icon><Refresh /></el-icon>
        获取随机卡牌
      </el-button>
    </el-card>

    <el-empty v-if="!card && !loading && !error" description="点击上方按钮获取随机卡牌" class="empty-state" />
    
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      closable
      @close="error = null"
      class="error-alert"
    />

    <div v-if="card" class="card-display">
      <div class="card-animation">
        <card-item
          :card="card"
          view-mode="grid"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { cardAPI } from '../api/card'
import CardItem from '../components/CardItem.vue'

const loading = ref(false)
const card = ref(null)
const error = ref(null)
const activeFilterNames = ref(['filter'])

const filterForm = reactive({
  cmc: '',
  colors: [],
  type: '',
  rarity: ''
})

const buildFilterQuery = () => {
  const parts = []
  
  if (filterForm.cmc) {
    // 检查用户输入是否包含比较运算符
    if (/^[<>]=?\d+$/.test(filterForm.cmc)) {
      // 如果包含比较运算符，直接使用
      parts.push(`cmc${filterForm.cmc}`)
    } else if (/^\d+$/.test(filterForm.cmc)) {
      // 如果是纯数字，添加等号
      parts.push(`cmc=${filterForm.cmc}`)
    } else {
      // 其他情况，直接使用
      parts.push(`cmc${filterForm.cmc}`)
    }
  }
  
  if (filterForm.colors.length > 0) {
    parts.push(`c:${filterForm.colors.join('')}`)
  }
  
  if (filterForm.type) {
    parts.push(`t:${filterForm.type}`)
  }
  
  if (filterForm.rarity) {
    parts.push(`r:${filterForm.rarity}`)
  }
  
  return parts.join(' ')
}

const getRandomCard = async () => {
  loading.value = true
  error.value = null
  card.value = null
  
  try {
    const filterQuery = buildFilterQuery()
    
    if (filterQuery) {
      // 如果有筛选条件，使用搜索API获取符合条件的卡牌，然后随机选择一张
      const searchData = await cardAPI.searchCards(filterQuery, 1)
      
      if (searchData.items && searchData.items.length > 0) {
        // 从搜索结果中随机选择一张
        const randomIndex = Math.floor(Math.random() * searchData.items.length)
        card.value = searchData.items[randomIndex]
      } else {
        error.value = '未找到符合条件的卡牌，请调整筛选条件'
      }
    } else {
      // 如果没有筛选条件，使用原来的随机卡牌API
      const data = await cardAPI.getRandomCard()
      card.value = data
    }
  } catch (err) {
    console.error('Get random card error:', err)
    error.value = '获取随机卡牌失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.random-view {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.random-card {
  text-align: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  margin-bottom: 32px;
  padding: 40px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.random-card:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  transform: translateY(-4px);
}

.random-header {
  margin-bottom: 32px;
  position: relative;
}

.random-icon {
  font-size: 72px;
  color: var(--accent-color);
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.random-header h2 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--accent-color) 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.random-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.5;
}

.random-btn {
  background: linear-gradient(135deg, var(--accent-color) 0%, #2563eb 100%);
  border: none;
  padding: 18px 48px;
  font-size: 1.2rem;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  margin-top: 32px;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  min-width: 240px;
}

.random-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
}

.random-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.filter-section {
  margin: 32px 0;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.filter-collapse {
  width: 100%;
}

.filter-item {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-collapse-item__header) {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:deep(.el-collapse-item__header:hover) {
  background: var(--accent-color);
  color: white;
}

:deep(.el-collapse-item__content) {
  padding: 24px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.filter-form {
  width: 100%;
}

.filter-form-item {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.filter-input,
.filter-select {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select .el-input__wrapper:hover) {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.color-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.color-checkbox {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

:deep(.el-checkbox-button__inner) {
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

:deep(.el-checkbox-button__inner:hover) {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.card-display {
  max-width: 400px;
  margin: 0 auto;
}

.card-animation {
  animation: cardAppear 0.6s ease-out;
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.error-alert {
  max-width: 600px;
  margin: 0 auto 24px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.empty-state {
  margin: 60px 0;
}

:deep(.el-empty__description) {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

:deep(.el-empty__image) {
  margin-bottom: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .random-card {
    padding: 32px 24px;
  }
  
  .random-header h2 {
    font-size: 1.8rem;
  }
  
  .random-btn {
    padding: 16px 40px;
    font-size: 1.1rem;
  }
  
  .filter-section {
    padding: 16px;
  }
  
  :deep(.el-collapse-item__header) {
    padding: 12px 16px;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .random-card {
    padding: 24px 16px;
  }
  
  .random-icon {
    font-size: 56px;
  }
  
  .random-header h2 {
    font-size: 1.5rem;
  }
  
  .random-btn {
    padding: 14px 32px;
    font-size: 1rem;
    min-width: 200px;
  }
  
  .color-checkbox-group {
    gap: 8px;
  }
  
  :deep(.el-checkbox-button__inner) {
    padding: 6px 8px;
  }
  
  :deep(.el-checkbox-button img) {
    width: 16px !important;
    height: 16px !important;
  }
}
</style>
