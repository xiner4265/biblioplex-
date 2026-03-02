<template>
  <div class="card-detail-view">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="error" class="error-container">
      <el-empty description="加载失败">
        <el-button type="primary" @click="loadCard">重试</el-button>
      </el-empty>
    </div>

    <div v-else-if="card" class="card-detail-container">
      <!-- 左侧：卡牌图片和基本信息 -->
      <div class="left-section">
        <!-- 单面牌或双面牌当前面 -->
        <div class="card-image-section">
          <transition name="card-flip" mode="out-in">
            <img
              v-if="!imageError && currentImageUrl"
              :key="currentFace"
              :src="currentImageUrl"
              :alt="currentFaceName"
              class="card-image"
              @error="handleImageError"
            />
            <div v-else class="image-error" :key="'error'">
              <el-icon><Picture /></el-icon>
              <span>图片加载失败</span>
            </div>
          </transition>
          
          <!-- 双面牌翻转按钮 -->
          <div v-if="isDoubleFaced" class="face-toggle">
            <el-button type="primary" @click="flipCard" class="flip-btn">
              <el-icon><RefreshRight /></el-icon>
              <span>翻转卡牌</span>
            </el-button>
          </div>
        </div>

        <div class="card-info-section">
          <div class="card-header">
            <h1 class="card-name">{{ currentFaceName }}</h1>
            <div class="card-mana-cost" v-html="currentManaCostHtml"></div>
            <p class="card-type">{{ currentTypeLine }}</p>
          </div>

          <div class="card-text-box" v-if="currentOracleText">
            <div class="oracle-text" v-html="formattedOracleText"></div>
            <p v-if="currentFlavorText" class="flavor-text">{{ currentFlavorText }}</p>
          </div>

          <div class="card-stats" v-if="hasStats">
            <div class="stat-item" v-if="currentFaceData.power !== undefined && currentFaceData.toughness !== undefined">
              <span class="stat-label">力量/防御</span>
              <span class="stat-value">{{ currentFaceData.power }}/{{ currentFaceData.toughness }}</span>
            </div>
            <div class="stat-item" v-if="currentFaceData.loyalty">
              <span class="stat-label">忠诚</span>
              <span class="stat-value">{{ currentFaceData.loyalty }}</span>
            </div>
          </div>

          <div class="card-meta">
            <div class="meta-item">
              <span class="meta-label">系列</span>
              <span class="meta-value">{{ card.set_name }} ({{ card.set.toUpperCase() }})</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">稀有度</span>
              <el-tag :type="rarityType" size="small">{{ rarityText }}</el-tag>
            </div>
            <div class="meta-item" v-if="card.prices?.usd">
              <span class="meta-label">价格</span>
              <span class="meta-value price">${{ card.prices.usd }}</span>
            </div>
          </div>

          <div class="card-actions">
            <el-button type="primary" @click="openInScryfall">
              <el-icon><Link /></el-icon>
              <span>在 Scryfall 查看</span>
            </el-button>
            <el-button @click="copyCardName">
              <el-icon><DocumentCopy /></el-icon>
              <span>复制卡牌名称</span>
            </el-button>
          </div>

          <div class="legality-section" v-if="card.legalities">
            <h3>赛制合法性</h3>
            <div class="legality-grid">
              <div
                v-for="(status, format) in legalitiesList"
                :key="format"
                class="legality-item"
                :class="{ 'is-legal': status === 'legal', 'is-not-legal': status === 'not_legal', 'is-banned': status === 'banned', 'is-restricted': status === 'restricted' }"
              >
                <span class="legality-format">{{ formatName(format) }}</span>
                <span class="legality-status">{{ legalityText(status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：版本信息 -->
      <div class="right-section" v-if="cardPrints.length > 1">
        <div class="prints-section">
          <h3>其他版本 ({{ cardPrints.length }})</h3>
          <div class="prints-list">
            <div
              v-for="print in cardPrints"
              :key="print.id"
              class="print-item"
              :class="{ 'is-current': print.id === card.id }"
              @click="switchToPrint(print.id)"
            >
              <img
                :src="print.image_uris?.small || print.card_faces?.[0]?.image_uris?.small"
                :alt="print.set_name"
                class="print-image"
                @error="handlePrintImageError"
              />
              <div class="print-info">
                <div class="print-set">{{ print.set_name }}</div>
                <div class="print-code">{{ print.set.toUpperCase() }}</div>
                <div class="print-date">{{ formatDate(print.released_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else description="卡牌不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { cardAPI } from '../api/card'

const route = useRoute()
const router = useRouter()

const card = ref(null)
const loading = ref(true)
const error = ref(false)
const imageError = ref(false)
const currentFace = ref(0)
const cardPrints = ref([])
const printsLoading = ref(false)

// 切换面时重置图片错误状态
watch(currentFace, () => {
  imageError.value = false
})

const flipCard = () => {
  currentFace.value = currentFace.value === 0 ? 1 : 0
}

const handleImageError = () => {
  imageError.value = true
}

// 双面牌相关计算属性
const isDoubleFaced = computed(() => {
  return card.value?.card_faces && card.value.card_faces.length > 1
})

const cardFaces = computed(() => {
  return card.value?.card_faces || [card.value]
})

const currentFaceData = computed(() => {
  return cardFaces.value[currentFace.value] || card.value
})

const currentFaceName = computed(() => {
  return currentFaceData.value?.name || card.value?.name
})

const currentTypeLine = computed(() => {
  return currentFaceData.value?.type_line || card.value?.type_line
})

const currentManaCost = computed(() => {
  return currentFaceData.value?.mana_cost || card.value?.mana_cost
})

const currentOracleText = computed(() => {
  return currentFaceData.value?.oracle_text || card.value?.oracle_text
})

const currentFlavorText = computed(() => {
  return currentFaceData.value?.flavor_text || card.value?.flavor_text
})

const currentImageUrl = computed(() => {
  const face = currentFaceData.value
  return face?.image_uris?.normal || 
         face?.image_uris?.large || 
         card.value?.image_uris?.normal ||
         card.value?.image_uris?.large ||
         ''
})

const symbolMap = {
  'T': { svg: 'card-symbol-T.svg', title: '横置' },
  'Q': { svg: 'card-symbol-T.svg', title: '重置' },
  'W': { svg: 'white.svg', title: '白色' },
  'U': { svg: 'blue.svg', title: '蓝色' },
  'B': { svg: 'black.svg', title: '黑色' },
  'R': { svg: 'red.svg', title: '红色' },
  'G': { svg: 'green.svg', title: '绿色' },
  'C': { svg: 'card-symbol-C.svg', title: '无色' },
  'W/U': { svg: 'card-symbol-WU.svg', title: '白蓝' },
  'W/B': { svg: 'card-symbol-WB.svg', title: '白黑' },
  'U/B': { svg: 'card-symbol-UB.svg', title: '蓝黑' },
  'U/R': { svg: 'card-symbol-UR.svg', title: '蓝红' },
  'B/R': { svg: 'card-symbol-BR.svg', title: '黑红' },
  'B/G': { svg: 'card-symbol-BG.svg', title: '黑绿' },
  'R/G': { svg: 'card-symbol-RG.svg', title: '红绿' },
  'R/W': { svg: 'card-symbol-RW.svg', title: '红白' },
  'G/W': { svg: 'card-symbol-GW.svg', title: '绿白' },
  'G/U': { svg: 'card-symbol-GU.svg', title: '绿蓝' },
  // 单色非瑞
  'W/P': { svg: 'card-symbol-WP.svg', title: '白非瑞' },
  'U/P': { svg: 'card-symbol-UP.svg', title: '蓝非瑞' },
  'B/P': { svg: 'card-symbol-BP.svg', title: '黑非瑞' },
  'R/P': { svg: 'card-symbol-RP.svg', title: '红非瑞' },
  'G/P': { svg: 'card-symbol-GP.svg', title: '绿非瑞' },
  // 双色非瑞
  'W/U/P': { svg: 'card-symbol-WUP.svg', title: '白蓝非瑞' },
  'U/W/P': { svg: 'card-symbol-WUP.svg', title: '蓝白非瑞' },
  'W/B/P': { svg: 'card-symbol-WBP.svg', title: '白黑非瑞' },
  'B/W/P': { svg: 'card-symbol-WBP.svg', title: '黑白非瑞' },
  'U/B/P': { svg: 'card-symbol-UBP.svg', title: '蓝黑非瑞' },
  'B/U/P': { svg: 'card-symbol-UBP.svg', title: '黑蓝非瑞' },
  'U/R/P': { svg: 'card-symbol-URP.svg', title: '蓝红非瑞' },
  'R/U/P': { svg: 'card-symbol-URP.svg', title: '红蓝非瑞' },
  'B/R/P': { svg: 'card-symbol-BRP.svg', title: '黑红非瑞' },
  'R/B/P': { svg: 'card-symbol-BRP.svg', title: '红黑非瑞' },
  'B/G/P': { svg: 'card-symbol-BGP.svg', title: '黑绿非瑞' },
  'G/B/P': { svg: 'card-symbol-BGP.svg', title: '绿黑非瑞' },
  'R/G/P': { svg: 'card-symbol-RGP.svg', title: '红绿非瑞' },
  'G/R/P': { svg: 'card-symbol-RGP.svg', title: '绿红非瑞' },
  'R/W/P': { svg: 'card-symbol-RWP.svg', title: '红白非瑞' },
  'W/R/P': { svg: 'card-symbol-RWP.svg', title: '白红非瑞' },
  'G/W/P': { svg: 'card-symbol-GWP.svg', title: '绿白非瑞' },
  'W/G/P': { svg: 'card-symbol-GWP.svg', title: '白绿非瑞' },
  'G/U/P': { svg: 'card-symbol-GUP.svg', title: '绿蓝非瑞' },
  'U/G/P': { svg: 'card-symbol-GUP.svg', title: '蓝绿非瑞' },
  'X': { svg: 'card-symbol-X.svg', title: 'X' },
  'Y': { svg: 'card-symbol-X.svg', title: 'Y' },
  'Z': { svg: 'card-symbol-X.svg', title: 'Z' },
  '0': { svg: 'card-symbol-1.svg', title: '0' },
  '1': { svg: 'card-symbol-1.svg', title: '1' },
  '2': { svg: 'card-symbol-2.svg', title: '2' },
  '3': { svg: 'card-symbol-3.svg', title: '3' },
  '4': { svg: 'card-symbol-4.svg', title: '4' },
  '5': { svg: 'card-symbol-5.svg', title: '5' },
  '6': { svg: 'card-symbol-6.svg', title: '6' },
  '7': { svg: 'card-symbol-7.svg', title: '7' },
  '8': { svg: 'card-symbol-8.svg', title: '8' },
  '9': { svg: 'card-symbol-9.svg', title: '9' },
  '10': { svg: 'card-symbol-10.svg', title: '10' },
  '11': { svg: 'card-symbol-11.svg', title: '11' },
  '12': { svg: 'card-symbol-12.svg', title: '12' },
  '13': { svg: 'card-symbol-13.svg', title: '13' },
  '14': { svg: 'card-symbol-15.svg', title: '14' },
  '15': { svg: 'card-symbol-15.svg', title: '15' },
  '16': { svg: 'card-symbol-16.svg', title: '16' },
}

const loadCard = async () => {
  loading.value = true
  error.value = false
  
  try {
    const cardId = route.params.id
    const data = await cardAPI.getCardById(cardId)
    card.value = data
    
    // 加载该卡牌的其他版本
    if (data.oracle_id) {
      loadCardPrints(data.oracle_id)
    }
  } catch (err) {
    console.error('加载卡牌失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const loadCardPrints = async (oracleId) => {
  printsLoading.value = true
  try {
    const data = await cardAPI.getCardPrints(oracleId)
    cardPrints.value = data.data || []
  } catch (err) {
    console.error('加载卡牌版本失败:', err)
    cardPrints.value = []
  } finally {
    printsLoading.value = false
  }
}

const switchToPrint = (printId) => {
  console.log('点击版本:', printId, '当前卡牌:', card.value?.id)
  if (printId === card.value?.id) return
  window.location.href = `/card/${printId}`
}

const handlePrintImageError = (e) => {
  e.target.src = '/images/card-back.jpg'
}

const currentManaCostHtml = computed(() => {
  if (!currentManaCost.value) return ''
  
  const symbols = currentManaCost.value.match(/\{([^}]+)\}/g) || []
  return symbols.map(symbol => {
    const value = symbol.slice(1, -1)
    const symbolInfo = symbolMap[value]
    if (symbolInfo) {
      return `<img src="/symbols/${symbolInfo.svg}" alt="${value}" title="${symbolInfo.title}" class="mana-symbol-img" />`
    }
    return `<span class="mana-symbol-text">${value}</span>`
  }).join('')
})

const formattedOracleText = computed(() => {
  if (!currentOracleText.value) return ''
  return currentOracleText.value
    .replace(/\n/g, '<br>')
    .replace(/\{([^}]+)\}/g, (match, symbol) => {
      const cleanSymbol = symbol.trim()
      const symbolInfo = symbolMap[cleanSymbol]
      if (symbolInfo) {
        return `<img src="/symbols/${symbolInfo.svg}" alt="${cleanSymbol}" title="${symbolInfo.title}" class="mana-symbol-inline" />`
      }
      return `<span class="mana-symbol-fallback">{${cleanSymbol}}</span>`
    })
})

const hasStats = computed(() => {
  return currentFaceData.value?.power !== undefined || 
         currentFaceData.value?.toughness !== undefined || 
         currentFaceData.value?.loyalty
})

const rarityType = computed(() => {
  const typeMap = {
    'common': 'info',
    'uncommon': 'success',
    'rare': 'warning',
    'mythic': 'danger'
  }
  return typeMap[card.value?.rarity] || 'info'
})

const rarityText = computed(() => {
  const textMap = {
    'common': '普通',
    'uncommon': '非普通',
    'rare': '稀有',
    'mythic': '秘稀',
    'special': '特殊',
    'bonus': '奖励'
  }
  return textMap[card.value?.rarity] || card.value?.rarity
})

const legalitiesList = computed(() => {
  if (!card.value?.legalities) return {}
  const formats = ['standard', 'pioneer', 'modern', 'legacy', 'vintage', 'commander', 'oathbreaker', 'alchemy', 'historic', 'brawl', 'timeless', 'pauper', 'penny']
  const result = {}
  formats.forEach(format => {
    if (card.value.legalities[format]) {
      result[format] = card.value.legalities[format]
    }
  })
  return result
})

const legalityType = (status) => {
  const typeMap = {
    'legal': 'success',
    'not_legal': 'info',
    'banned': 'danger',
    'restricted': 'warning'
  }
  return typeMap[status] || 'info'
}

const legalityText = (status) => {
  const textMap = {
    'legal': '合法',
    'not_legal': '不合法',
    'banned': '禁牌',
    'restricted': '限制'
  }
  return textMap[status] || status
}

const formatName = (format) => {
  const nameMap = {
    'standard': 'Standard',
    'pioneer': 'Pioneer',
    'modern': 'Modern',
    'legacy': 'Legacy',
    'vintage': 'Vintage',
    'commander': 'Commander',
    'oathbreaker': 'Oathbreaker',
    'alchemy': 'Alchemy',
    'historic': 'Historic',
    'brawl': 'Brawl',
    'timeless': 'Timeless',
    'pauper': 'Pauper',
    'penny': 'Penny'
  }
  return nameMap[format] || format
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const goBack = () => {
  router.back()
}

const openInScryfall = () => {
  if (card.value?.scryfall_uri) {
    window.open(card.value.scryfall_uri, '_blank')
  }
}

const copyCardName = () => {
  if (card.value?.name) {
    navigator.clipboard.writeText(card.value.name)
    ElMessage.success('已复制卡牌名称')
  }
}

onMounted(() => {
  loadCard()
})
</script>

<style scoped>
.card-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 80px 24px;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.back-btn {
  margin-bottom: 24px;
  font-size: 1rem;
}

.loading-container,
.error-container {
  padding: 40px;
}

.card-detail-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
  overflow-y: visible;
  display: flex;
  gap: 24px;
  flex-direction: row;
}

.left-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-section {
  width: 420px;
  min-width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: fit-content;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  /* iPad 横屏 */
  .card-detail-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .left-section {
    width: 100%;
    max-width: none;
  }
  
  .right-section {
    width: 100%;
    max-width: none;
    min-width: auto;
    margin-top: 24px;
  }
  
  .prints-section {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  /* iPad 竖屏 */
  .card-detail-container {
    padding: 20px;
  }
  
  .left-section {
    max-width: 100%;
  }
  
  .right-section {
    max-width: 100%;
  }
  
  .print-item {
    width: 100%;
  }
}

.card-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-height: 400px;
  width: 100%;
}

.face-toggle {
  margin-top: 16px;
}

.flip-btn {
  padding: 12px 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.flip-btn .el-icon {
  font-size: 18px;
}

/* 卡牌翻转动画 */
.card-flip-enter-active,
.card-flip-leave-active {
  transition: all 0.3s ease;
}

.card-flip-enter-from {
  opacity: 0;
  transform: rotateY(90deg);
}

.card-flip-leave-to {
  opacity: 0;
  transform: rotateY(-90deg);
}

.card-image {
  width: 100%;
  max-width: 488px;
  height: auto;
  border-radius: 4.75% / 3.5%;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2);
  display: block;
  object-fit: contain;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #999;
  font-size: 1rem;
  background: #f3f4f6;
  border-radius: 4.75% / 3.5%;
  min-width: 300px;
  min-height: 400px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-info-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

/* 统一分隔线 */
.card-header,
.card-text-box,
.card-stats,
.card-meta,
.card-actions,
.legality-section {
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.card-header {
  padding-top: 0;
}

.legality-section {
  border-bottom: none;
}

.card-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.card-mana-cost {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.card-mana-cost :deep(.mana-symbol-img) {
  width: 26px;
  height: 26px;
}

.card-mana-cost :deep(.mana-symbol-text) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ccc2c0 0%, #b8aeac 100%);
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.card-type {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.card-text-box {
  padding: 16px 0;
}

.oracle-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #374151;
}

.oracle-text :deep(.mana-symbol-inline) {
  display: inline-block;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin: 0 2px;
}

.oracle-text :deep(.mana-symbol-fallback) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 5px;
  margin: 0 2px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.7rem;
  background: linear-gradient(135deg, #ccc2c0 0%, #b8aeac 100%);
  color: #1a1a1a;
}

.flavor-text {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #d1d5db;
  font-style: italic;
  color: #6b7280;
  font-size: 0.9rem;
}

.card-stats {
  display: flex;
  gap: 24px;
  padding: 12px 0;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 12px 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.meta-value {
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 500;
}

.meta-value.price {
  color: #16a34a;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 0;
  flex-direction: column;
  align-items: stretch;
}

.card-actions .el-button {
  width: 100% !important;
  justify-content: center !important;
  height: 48px !important;
  border-radius: 8px !important;
  padding: 0 24px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  min-width: 0 !important;
}

.card-actions .el-button:first-child {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  border: none !important;
}

.card-actions .el-button:last-child {
  background: #ffffff !important;
  color: #4b5563 !important;
  border: 1px solid #e5e7eb !important;
}

.card-actions .el-button span {
  font-size: 14px !important;
}

.card-actions .el-button .el-icon {
  font-size: 16px !important;
}

.legality-section {
  padding: 16px 0;
}

.legality-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.legality-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.legality-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.legality-format {
  font-weight: 500;
  color: #374151;
}

.legality-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
}

.legality-item.is-legal .legality-status {
  background: #dcfce7;
  color: #166534;
}

.legality-item.is-not-legal .legality-status {
  background: #fee2e2;
  color: #991b1b;
}

.legality-item.is-banned .legality-status {
  background: #fecaca;
  color: #7f1d1d;
}

.legality-item.is-restricted .legality-status {
  background: #fef3c7;
  color: #92400e;
}

/* 卡牌版本选择 */
.prints-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  max-height: calc(100vh - 80px);
  overflow-x: hidden;
}

.prints-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.prints-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 8px;
}

.prints-list::-webkit-scrollbar {
  width: 6px;
}

.prints-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.prints-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.prints-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.print-item {
  flex-shrink: 0;
  width: 75%;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 8px;
  background: white;
  border: 2px solid transparent;
  display: flex;
  gap: 8px;
  align-items: center;
}

.print-item:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
}

.print-item.is-current {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.print-image {
  width: 48px;
  height: auto;
  border-radius: 4px;
  flex-shrink: 0;
}

.print-info {
  flex: 1;
  min-width: 0;
}

.print-set {
  font-size: 0.75rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.print-code {
  font-size: 0.65rem;
  color: #6b7280;
  margin: 0 0 2px 0;
}

.print-date {
  font-size: 0.65rem;
  color: #9ca3af;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  /* iPad 横屏 */
  .card-detail-container {
    padding: 24px;
    gap: 20px;
  }
  
  .right-section {
    width: 380px;
    min-width: 340px;
  }
  
  .card-image {
    max-width: 400px;
  }
  
  .card-name {
    font-size: 1.5rem;
  }
  
  .legality-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  /* iPad 竖屏 */
  .card-detail-view {
    padding: 16px 16px 60px 16px;
  }
  
  .card-detail-container {
    flex-direction: column;
    padding: 20px;
    gap: 24px;
  }
  
  .right-section {
    width: 100%;
    min-width: auto;
    margin-top: 0;
  }
  
  .card-image-section {
    min-height: 300px;
  }
  
  .card-image {
    max-width: 320px;
    max-height: 450px;
  }
  
  .card-name {
    font-size: 1.3rem;
  }
  
  .card-stats {
    gap: 16px;
  }
  
  .card-meta {
    gap: 12px 16px;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-actions .el-button {
    width: 100%;
  }
  
  .prints-section {
    height: auto;
    max-height: 400px;
  }
  
  .prints-list {
    max-height: 300px;
  }
  
  .print-item {
    padding: 6px;
  }
  
  .print-image {
    width: 40px;
  }
  
  .print-set {
    font-size: 0.7rem;
  }
  
  .print-code {
    font-size: 0.6rem;
  }
  
  .print-date {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  /* 安卓手机 */
  .card-detail-view {
    padding: 12px 12px 40px 12px;
  }
  
  .card-detail-container {
    padding: 16px;
  }
  
  .card-image {
    max-width: 280px;
    max-height: 380px;
  }
  
  .card-name {
    font-size: 1.2rem;
  }
  
  .card-type {
    font-size: 0.9rem;
  }
  
  .oracle-text {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  .oracle-text :deep(.mana-symbol-inline) {
    width: 16px;
    height: 16px;
  }
  
  .flavor-text {
    font-size: 0.8rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .stat-value {
    font-size: 1.1rem;
  }
  
  .meta-label {
    font-size: 0.8rem;
  }
  
  .meta-value {
    font-size: 0.8rem;
  }
  
  .card-actions {
    gap: 8px !important;
  }
  
  .card-actions .el-button {
    height: 44px !important;
    font-size: 13px !important;
    padding: 0 16px !important;
  }
  
  .card-actions .el-button span {
    font-size: 13px !important;
  }
  
  .card-actions .el-button .el-icon {
    font-size: 14px !important;
  }
  
  .legality-section h3 {
    font-size: 0.9rem;
  }
  
  .legality-item {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
  
  .legality-status {
    font-size: 0.65rem;
  }
  
  .prints-section {
    padding: 12px;
  }
  
  .prints-section h3 {
    font-size: 0.9rem;
    margin-bottom: 12px;
  }
  
  .print-item {
    flex-direction: column;
    text-align: center;
    padding: 12px;
  }
  
  .print-info {
    text-align: center;
  }
  
  .print-set {
    white-space: normal;
    overflow: visible;
  }
}
</style>
