<template>
  <div class="search-view">
    <!-- 系列信息标题 -->
    <div v-if="currentSet" class="set-header">
      <div class="set-icon-wrapper">
        <img 
          :src="currentSet.icon_svg_uri" 
          :alt="currentSet.name"
          class="set-icon"
          @error="handleSetIconError"
        />
      </div>
      <div class="set-info">
        <h2 class="set-title">{{ currentSet.name }}</h2>
        <p class="set-subtitle">{{ currentSet.code.toUpperCase() }} · {{ formatDate(currentSet.released_at) }}</p>
      </div>
      <el-button type="primary" plain @click="clearSetFilter">
        <el-icon><Close /></el-icon>
        清除筛选
      </el-button>
    </div>

    <el-card v-else class="search-card" shadow="hover">
      <el-input
        v-model="searchQuery"
        placeholder="搜索卡牌名称（仅支持英文，例如：Lightning Bolt, Black Lotus）"
        size="large"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch" :loading="cardStore.loading">
            搜索
          </el-button>
        </template>
      </el-input>

    </el-card>

    <div class="results-header" v-if="cardStore.totalCount > 0">
      <el-text type="info">找到 {{ cardStore.totalCount }} 张卡牌</el-text>
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button label="grid">
          <el-icon><Grid /></el-icon>
          网格
        </el-radio-button>
        <el-radio-button label="list">
          <el-icon><List /></el-icon>
          列表
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-alert
      v-if="cardStore.error"
      :title="cardStore.error"
      type="error"
      :closable="false"
      show-icon
      class="error-alert"
    />

    <el-empty 
      v-if="!cardStore.loading && cardStore.cards.length === 0 && !cardStore.error" 
      :description="getEmptyDescription()"
    >
      <template #image>
        <div style="font-size: 64px; margin-bottom: 16px;">{{ getEmptyIcon() }}</div>
      </template>
    </el-empty>

    <div v-loading="cardStore.loading" element-loading-text="搜索中..." class="cards-container">
      <transition-group name="card-fade" tag="div" :class="['cards-grid', viewMode]">
        <card-item
          v-for="card in paginatedCards"
          :key="card.id"
          :card="card"
          :view-mode="viewMode"
        />
      </transition-group>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="cardStore.cards.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="cardStore.cards.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCardStore } from '../stores/card'
import { cardAPI } from '../api/card'
import CardItem from '../components/CardItem.vue'

const cardStore = useCardStore()
const route = useRoute()

const searchQuery = ref('')
const showAdvanced = ref(false)
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(20)

// 分页后的卡牌
const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return cardStore.cards.slice(start, end)
})

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const filters = ref({
  colors: [],
  colorMode: 'exactly',
  cmcMin: null,
  cmcMax: null,
  rarities: [],
  cardType: '',
  cardSet: '',
  cardFormat: ''
})

const buildQuery = () => {
  const parts = []

  if (searchQuery.value.trim()) {
    parts.push(searchQuery.value.trim())
  }

  if (filters.value.colors.length > 0) {
    const colorQuery = filters.value.colors.join('')
    switch (filters.value.colorMode) {
      case 'exactly':
        parts.push(`c=${colorQuery}`)
        break
      case 'including':
        parts.push(`c>=${colorQuery}`)
        break
      case 'at_most':
        parts.push(`c<=${colorQuery}`)
        break
    }
  }

  if (filters.value.cmcMin !== null) {
    parts.push(`cmc>=${filters.value.cmcMin}`)
  }
  if (filters.value.cmcMax !== null) {
    parts.push(`cmc<=${filters.value.cmcMax}`)
  }

  if (filters.value.rarities.length > 0) {
    parts.push(`r:${filters.value.rarities.join(',')}`)
  }

  if (filters.value.cardType) {
    parts.push(`t:${filters.value.cardType}`)
  }

  if (filters.value.cardSet) {
    parts.push(`e:${filters.value.cardSet}`)
  }

  if (filters.value.cardFormat) {
    parts.push(`f:${filters.value.cardFormat}`)
  }

  return parts.join(' ')
}

const handleSearch = async () => {
  const query = buildQuery()
  if (!query.trim()) {
    cardStore.setError('请输入搜索关键词')
    return
  }

  cardStore.reset()
  cardStore.setLoading(true)
  cardStore.setError(null)
  cardStore.setCurrentQuery(query)

  try {
    const data = await cardAPI.searchCards(query)
    cardStore.setCards(data.data || [])
    cardStore.setTotalCount(data.total_cards || 0)
    cardStore.setHasMore(data.has_more || false)
  } catch (error) {
    // 检查是否是搜索无结果的情况
    if (error.response?.status === 404 || 
        error.message?.includes('didn\'t match any cards') ||
        error.response?.data?.code === 'not_found') {
      // 搜索无结果，显示空状态，不显示错误
      cardStore.setCards([])
      cardStore.setTotalCount(0)
      cardStore.setHasMore(false)
    } else {
      const errorMsg = error.response?.data?.details || error.message || '搜索失败，请稍后重试'
      cardStore.setError(`搜索失败: ${errorMsg}`)
      console.error('Search error:', error)
    }
  } finally {
    cardStore.setLoading(false)
  }
}

const loadMore = async () => {
  if (!cardStore.hasMore || cardStore.loading) return

  cardStore.setLoading(true)
  try {
    const nextPage = cardStore.currentPage + 1
    const data = await cardAPI.searchCards(cardStore.currentQuery, nextPage)
    cardStore.appendCards(data.data || [])
    cardStore.setCurrentPage(nextPage)
    cardStore.setHasMore(data.has_more || false)
  } catch (error) {
    cardStore.setError('加载更多失败')
    console.error('Load more error:', error)
  } finally {
    cardStore.setLoading(false)
  }
}

const resetFilters = () => {
  filters.value = {
    colors: [],
    colorMode: 'exactly',
    cmcMin: null,
    cmcMax: null,
    rarities: [],
    cardType: '',
    cardSet: '',
    cardFormat: ''
  }
  searchQuery.value = ''
}

const loadPopularCards = async () => {
  cardStore.setLoading(true)
  try {
    const data = await cardAPI.getPopularCards()
    cardStore.setCards(data.data || [])
    cardStore.setTotalCount(data.total_cards || 0)
  } catch (error) {
    cardStore.setError('加载热门卡牌失败')
    console.error('Load popular cards error:', error)
  } finally {
    cardStore.setLoading(false)
  }
}



onMounted(() => {
  // 从URL参数获取搜索词或系列
  if (route.query.q) {
    searchQuery.value = route.query.q
    handleSearch()
  } else if (route.query.set) {
    searchBySet(route.query.set)
  } else if (route.query.advanced === 'true') {
    showAdvanced.value = true
    loadPopularCards()
  } else {
    loadPopularCards()
  }
})

const currentSet = ref(null)

const searchBySet = async (setCode) => {
  cardStore.reset()
  cardStore.setLoading(true)
  cardStore.setError(null)
  cardStore.setCurrentQuery(`set:${setCode}`)
  currentPage.value = 1

  try {
    // 获取系列信息
    const setsData = await cardAPI.getSets()
    const set = setsData.data.find(s => s.code.toLowerCase() === setCode.toLowerCase())
    if (set) {
      currentSet.value = set
    }
    
    const data = await cardAPI.getCardsBySet(setCode)
    cardStore.setCards(data.data || [])
    cardStore.setTotalCount(data.total_cards || 0)
    cardStore.setHasMore(data.has_more || false)
  } catch (error) {
    // 检查是否是空结果（0张牌的情况）
    if (error.response?.status === 404 || error.response?.data?.code === 'not_found') {
      cardStore.setCards([])
      cardStore.setTotalCount(0)
      cardStore.setHasMore(false)
      // 不设置错误，让页面显示空状态
    } else {
      const errorMsg = error.response?.data?.details || error.message || '搜索失败，请稍后重试'
      cardStore.setError(`搜索失败: ${errorMsg}`)
      console.error('Search error:', error)
    }
  } finally {
    cardStore.setLoading(false)
  }
}

const clearSetFilter = () => {
  currentSet.value = null
  router.push('/search')
  loadPopularCards()
}

const handleSetIconError = (e) => {
  e.target.style.display = 'none'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getEmptyDescription = () => {
  if (currentSet.value) {
    return '当前系列暂无卡牌'
  } else if (cardStore.currentQuery) {
    return '未搜索到匹配的卡牌'
  } else {
    return '暂无卡牌数据'
  }
}

const getEmptyIcon = () => {
  if (currentSet.value) {
    return '📦'
  } else if (cardStore.currentQuery) {
    return '🔍'
  } else {
    return '🃏'
  }
}
</script>

<style scoped>
.search-view {
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.set-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.set-icon-wrapper {
  width: 48px;
  height: 48px;
  min-width: 48px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.set-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.set-info {
  flex: 1;
}

.set-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.set-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.search-card {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

:deep(.el-card__body) {
  padding: 32px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
}

:deep(.el-button--primary) {
  background: #3b82f6;
  border: none;
  color: white;
  font-weight: 600;
}

:deep(.el-button--primary:hover) {
  background: #2563eb;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.error-alert {
  margin-bottom: 20px;
}

.cards-container {
  min-height: 200px;
}

.cards-grid {
  display: grid;
  gap: 20px;
}

.cards-grid.grid {
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.cards-grid.list {
  grid-template-columns: 1fr;
  gap: 8px;
}

.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.3s ease;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.load-more {
  text-align: center;
  margin-top: 32px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

@media (max-width: 1200px) {
  .cards-grid.grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .cards-grid.grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .cards-grid.grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .results-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
