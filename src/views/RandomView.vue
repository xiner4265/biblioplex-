<template>
  <div class="random-view">
    <el-card class="random-card" shadow="hover">
      <div class="random-header">
        <el-icon class="random-icon"><MagicStick /></el-icon>
        <h2>随机卡牌</h2>
        <p>点击下方按钮，探索万智牌的无限可能</p>
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

    <el-empty v-if="!card && !loading && !error" description="点击上方按钮获取随机卡牌" />
    
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
      <card-item
        :card="card"
        view-mode="grid"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { cardAPI } from '../api/card'
import CardItem from '../components/CardItem.vue'

const loading = ref(false)
const card = ref(null)
const error = ref(null)

const getRandomCard = async () => {
  loading.value = true
  error.value = null
  card.value = null
  
  try {
    const data = await cardAPI.getRandomCard()
    card.value = data
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
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  margin-bottom: 32px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.random-header {
  margin-bottom: 32px;
}

.random-icon {
  font-size: 64px;
  color: #3b82f6;
  margin-bottom: 16px;
}

.random-header h2 {
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.random-header p {
  color: #6b7280;
  font-size: 1rem;
}

.random-btn {
  background: #3b82f6;
  border: none;
  padding: 16px 40px;
  font-size: 1.1rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
}

.random-btn:hover {
  background: #2563eb;
}

.card-display {
  max-width: 400px;
  margin: 0 auto;
}

.error-alert {
  max-width: 600px;
  margin: 0 auto 24px;
}
</style>
