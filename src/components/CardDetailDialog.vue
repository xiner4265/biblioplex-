<template>
  <el-dialog
    v-model="dialogVisible"
    width="90%"
    :style="{ maxWidth: '900px' }"
    class="card-detail-dialog"
    @close="handleClose"
  >
    <div v-if="card" class="card-detail">
      <div class="card-detail-image">
        <el-image
          :src="imageUrl"
          :alt="card.name"
          fit="contain"
          class="detail-image"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
              <span>图片加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
      
      <div class="card-detail-info">
        <button class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </button>
        <div class="card-detail-header">
          <h2 class="card-detail-name">{{ card.name }}</h2>
          <div class="card-detail-mana" v-html="manaCostHtml"></div>
          <p class="card-detail-type">{{ card.type_line }}</p>
        </div>
        
        <div class="card-detail-text" v-if="oracleText">
          <div v-html="formattedOracleText"></div>
          <p v-if="card.flavor_text" class="flavor-text">{{ card.flavor_text }}</p>
        </div>

        <div class="card-detail-stats" v-if="hasStats">
          <div class="stat-box" v-if="card.power !== undefined && card.toughness !== undefined">
            <div class="stat-label">力量/防御</div>
            <div class="stat-value">{{ card.power }}/{{ card.toughness }}</div>
          </div>
          <div class="stat-box" v-if="card.loyalty">
            <div class="stat-label">忠诚</div>
            <div class="stat-value">{{ card.loyalty }}</div>
          </div>
        </div>

        <div class="card-detail-prices">
          <div class="price-box">
            <div class="price-label">USD</div>
            <div class="price-value price-usd">{{ usdPrice }}</div>
          </div>
          <div class="price-box">
            <div class="price-label">EUR</div>
            <div class="price-value price-eur">{{ eurPrice }}</div>
          </div>
          <div class="price-box">
            <div class="price-label">TIX</div>
            <div class="price-value price-tix">{{ tixPrice }}</div>
          </div>
        </div>

        <div class="card-detail-legalities">
          <h4 class="legalities-title">格式合法性</h4>
          <div class="legalities-grid">
            <el-tag
              v-for="(status, format) in priorityLegalities"
              :key="format"
              :type="legalityType(status)"
              size="small"
              class="legality-tag"
            >
              {{ formatNames[format] || format }}: {{ legalityText(status) }}
            </el-tag>
          </div>
        </div>

        <div class="card-detail-actions">
          <el-button type="primary" @click="openScryfall" :icon="Link">
            在 Scryfall 查看
          </el-button>
          <el-button @click="copyCardName" :icon="CopyDocument">
            复制卡牌名称
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, CopyDocument, Picture, Close } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  card: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const imageUrl = computed(() => {
  return props.card?.image_uris?.normal || 
         props.card?.image_uris?.large || 
         props.card?.card_faces?.[0]?.image_uris?.normal || 
         ''
})

const manaCostHtml = computed(() => {
  if (!props.card?.mana_cost) return ''
  
  const symbols = props.card.mana_cost.match(/\{([^}]+)\}/g) || []
  return symbols.map(symbol => {
    const value = symbol.slice(1, -1)
    const symbolInfo = symbolMap[value]
    if (symbolInfo) {
      return `<img src="/symbols/${symbolInfo.svg}" alt="${value}" title="${symbolInfo.title}" class="card-mana-symbol-img" />`
    }
    return `<span class="card-mana-symbol-text">${value}</span>`
  }).join('')
})

const oracleText = computed(() => props.card?.oracle_text)

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

const getSymbolSvg = (symbol) => {
  const symbolInfo = symbolMap[symbol]
  if (symbolInfo) {
    return `/symbols/${symbolInfo.svg}`
  }
  return null
}

const formattedOracleText = computed(() => {
  if (!oracleText.value) return ''
  return oracleText.value
    .replace(/\n/g, '<br>')
    .replace(/\{([^}]+)\}/g, (match, symbol) => {
      // 清理符号，移除可能的额外空格
      const cleanSymbol = symbol.trim()
      const svgPath = getSymbolSvg(cleanSymbol)
      const symbolInfo = symbolMap[cleanSymbol]
      if (svgPath && symbolInfo) {
        return `<img src="${svgPath}" alt="${cleanSymbol}" title="${symbolInfo.title}" class="mana-symbol-img" />`
      }
      // 如果找不到映射，直接返回原始符号文本
      return `<span class="mana-symbol-text" title="${cleanSymbol}">{${cleanSymbol}}</span>`
    })
})

const hasStats = computed(() => {
  return props.card?.power !== undefined || 
         props.card?.toughness !== undefined || 
         props.card?.loyalty
})

const usdPrice = computed(() => props.card?.prices?.usd || 'N/A')
const eurPrice = computed(() => props.card?.prices?.eur || 'N/A')
const tixPrice = computed(() => props.card?.prices?.tix || 'N/A')

const formatNames = {
  'standard': '标准',
  'pioneer': '先驱',
  'modern': '摩登',
  'legacy': '薪传',
  'vintage': '特选',
  'commander': '指挥官',
  'pauper': '铁牌',
  'historic': '史迹',
  'explorer': '探险',
  'brawl': '争锋',
  'future': '未来',
  'gladiator': '角斗场',
  'oldschool': '老学校',
  'premodern': '前现代'
}

const priorityFormats = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage', 
  'commander', 'pauper', 'historic', 'explorer'
]

const priorityLegalities = computed(() => {
  const legalities = {}
  priorityFormats.forEach(format => {
    legalities[format] = props.card?.legalities?.[format] || 'not_legal'
  })
  return legalities
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

const openScryfall = () => {
  if (props.card?.scryfall_uri) {
    window.open(props.card.scryfall_uri, '_blank')
  }
}

const copyCardName = async () => {
  if (props.card?.name) {
    try {
      await navigator.clipboard.writeText(props.card.name)
      ElMessage.success('卡牌名称已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.card-detail {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 0;
}

.card-detail-image {
  padding: 24px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e5e7eb;
}

.detail-image {
  max-width: 100%;
  max-height: 450px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.image-error .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.card-detail-info {
  padding: 28px;
  background: #ffffff;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.card-detail-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.card-detail-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111827;
  letter-spacing: -0.5px;
}

.card-detail-mana {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.card-detail-mana :deep(.card-mana-symbol-img) {
  width: 24px;
  height: 24px;
  vertical-align: middle;
}

.card-detail-mana :deep(.card-mana-symbol-text) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ccc2c0 0%, #b8aeac 100%);
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.card-detail-type {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.card-detail-text {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  line-height: 1.8;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.card-detail-text :deep(.mana-symbol-img) {
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin: 0 2px;
}

.card-detail-text :deep(.mana-symbol-text) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  margin: 0 2px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.75rem;
  min-width: 20px;
  height: 20px;
  vertical-align: middle;
  background: linear-gradient(135deg, #ccc2c0 0%, #b8aeac 100%);
  color: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.flavor-text {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #d1d5db;
  font-style: italic;
  color: #6b7280;
  font-size: 0.95rem;
}

.card-detail-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 12px 20px;
  border-radius: 10px;
  border: 1px solid #bfdbfe;
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 4px;
  color: #1d4ed8;
}

.card-detail-prices {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.price-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #bbf7d0;
}

.price-box:nth-child(2) {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #bfdbfe;
}

.price-box:nth-child(3) {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #e9d5ff;
}

.price-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.price-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.price-usd { color: #16a34a; }
.price-eur { color: #2563eb; }
.price-tix { color: #7c3aed; }

.card-detail-legalities {
  margin-top: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.legalities-title {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 12px;
  font-weight: 600;
}

.legalities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.legality-tag {
  text-align: center;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.85rem;
}

.card-detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.card-detail-actions .el-button {
  flex: 1;
  padding: 12px 20px;
  font-size: 0.95rem;
  border-radius: 8px;
}

.card-detail-actions .el-button--primary {
  background: #3b82f6;
  border: none;
  color: white;
  font-weight: 600;
}

.card-detail-actions .el-button--primary:hover {
  background: #2563eb;
}

.card-detail-actions .el-button:not(.el-button--primary) {
  border: 1px solid #d1d5db;
  color: #374151;
}

.card-detail-actions .el-button:not(.el-button--primary):hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

@media (max-width: 768px) {
  .card-detail {
    grid-template-columns: 1fr;
  }

  .card-detail-image {
    padding: 16px;
  }

  .card-detail-info {
    padding: 20px;
  }

  .card-detail-name {
    font-size: 1.4rem;
  }

  .card-detail-prices {
    grid-template-columns: 1fr;
  }

  .card-detail-actions {
    flex-direction: column;
  }
}
</style>

<style>
.card-detail-dialog .el-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
}

.card-detail-dialog .el-dialog__header {
  display: none;
}

.card-detail-dialog .el-dialog__body {
  padding: 0;
}
</style>
