<template>
  <div class="sets-view">
    <div class="sets-header">
      <h1 class="page-title">全部系列</h1>
      <p class="page-subtitle">浏览所有万智牌系列</p>
    </div>

    <div class="sets-content">
      <div v-if="loading" class="sets-list">
        <div v-for="i in 12" :key="i" class="set-row skeleton">
          <el-skeleton animated>
            <template #template>
              <div style="display: flex; align-items: center; gap: 16px; padding: 16px;">
                <el-skeleton-item variant="image" style="width: 40px; height: 40px;" />
                <div style="flex: 1;">
                  <el-skeleton-item variant="text" style="width: 30%;" />
                </div>
                <el-skeleton-item variant="text" style="width: 80px;" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <div v-else-if="sets.length > 0" class="sets-list">
        <div 
          v-for="set in sets" 
          :key="set.code" 
          class="set-row"
          @click="goToSet(set.code)"
        >
          <div class="set-icon">
            <img 
              :src="set.icon_svg_uri" 
              :alt="set.name"
              @error="handleIconError"
            />
          </div>
          <div class="set-info">
            <div class="set-main">
              <span class="set-name">{{ set.name }}</span>
              <span class="set-code">{{ set.code.toUpperCase() }}</span>
            </div>
            <div class="set-meta">
              <span class="set-date">{{ formatDate(set.released_at) }}</span>
              <span class="set-type">{{ set.set_type }}</span>
            </div>
          </div>
          <div class="set-count">
            <el-tag type="info" size="small">{{ set.card_count || 0 }} 张卡牌</el-tag>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无系列数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { cardAPI } from '../api/card'

const router = useRouter()
const sets = ref([])
const loading = ref(true)

const fetchSets = async (retryCount = 0) => {
  loading.value = true
  try {
    const data = await cardAPI.getSets()
    sets.value = (data.data || [])
      .filter(set => set.released_at)
      .sort((a, b) => new Date(b.released_at) - new Date(a.released_at))
  } catch (error) {
    console.error('获取系列失败:', error)
    
    // 如果是网络错误，尝试重试
    if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response)) {
      console.log(`尝试重新获取系列... (${retryCount + 1}/2)`)
      setTimeout(() => fetchSets(retryCount + 1), 1000)
      return
    }
    
    ElMessage.error('获取系列失败，请检查网络连接后刷新页面')
    sets.value = []
  } finally {
    loading.value = false
  }
}

const goToSet = (setCode) => {
  router.push({
    path: '/search',
    query: { set: setCode }
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const handleIconError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  fetchSets()
})
</script>

<style scoped>
.sets-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.sets-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.sets-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.sets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.set-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.set-row:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.set-row.skeleton {
  cursor: default;
}

.set-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
}

.set-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.set-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.set-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.set-code {
  font-size: 0.8rem;
  color: #3b82f6;
  font-weight: 500;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

.set-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: #666;
}

.set-type {
  color: #999;
  text-transform: capitalize;
}

.set-count {
  flex-shrink: 0;
}
</style>
