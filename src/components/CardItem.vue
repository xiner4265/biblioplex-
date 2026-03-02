<template>
  <div class="card-item" :class="viewMode" @click="handleClick">
    <!-- 网格模式 -->
    <template v-if="viewMode === 'grid'">
      <div class="card-image-wrapper">
        <img
          :src="imageUrl"
          :alt="card.name"
          class="card-image"
          loading="lazy"
          @error="handleImageError"
        />
      </div>
      <div class="card-info">
        <h3 class="card-name" :title="card.name">{{ card.name }}</h3>
        <div class="card-set-row">
          <span class="card-set">{{ card.set_name }} ({{ card.set.toUpperCase() }})</span>
          <div class="card-mana-cost" v-html="manaCostHtml"></div>
        </div>
        <p class="card-type">{{ card.type_line }}</p>
        <div class="card-footer">
          <el-tag :type="rarityType" size="small">{{ rarityText }}</el-tag>
          <span class="card-price">{{ price }}</span>
        </div>
      </div>
    </template>

    <!-- 列表模式 -->
    <template v-else>
      <div class="list-image-wrapper">
        <img
          :src="imageUrl"
          :alt="card.name"
          class="list-image"
          loading="lazy"
          @error="handleImageError"
        />
      </div>
      <div class="list-info">
        <h3 class="list-name" :title="card.name">{{ card.name }}</h3>
        <p class="list-type">{{ card.type_line }}</p>
      </div>
      <div class="list-right">
        <div class="list-mana-cost" v-html="manaCostHtml"></div>
        <div class="list-set">
          <span class="list-set-icon">{{ card.set.toUpperCase() }}</span>
          <span class="list-set-number">{{ card.collector_number }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'grid'
  }
})

const emit = defineEmits(['click'])

const imageUrl = computed(() => {
  return props.card.image_uris?.normal || 
         props.card.image_uris?.small || 
         props.card.card_faces?.[0]?.image_uris?.normal || 
         ''
})

const symbolMap = {
  'W': 'white.svg', 'U': 'blue.svg', 'B': 'black.svg', 'R': 'red.svg', 'G': 'green.svg', 'C': 'card-symbol-C.svg',
  'W/U': 'card-symbol-WU.svg', 'W/B': 'card-symbol-WB.svg', 'U/B': 'card-symbol-UB.svg', 'U/R': 'card-symbol-UR.svg',
  'B/R': 'card-symbol-BR.svg', 'B/G': 'card-symbol-BG.svg', 'R/G': 'card-symbol-RG.svg', 'R/W': 'card-symbol-RW.svg',
  'G/W': 'card-symbol-GW.svg', 'G/U': 'card-symbol-GU.svg',
  // 单色非瑞
  'W/P': 'card-symbol-WP.svg', 'U/P': 'card-symbol-UP.svg', 'B/P': 'card-symbol-BP.svg',
  'R/P': 'card-symbol-RP.svg', 'G/P': 'card-symbol-GP.svg',
  // 双色非瑞
  'W/U/P': 'card-symbol-WUP.svg', 'U/W/P': 'card-symbol-WUP.svg',
  'W/B/P': 'card-symbol-WBP.svg', 'B/W/P': 'card-symbol-WBP.svg',
  'U/B/P': 'card-symbol-UBP.svg', 'B/U/P': 'card-symbol-UBP.svg',
  'U/R/P': 'card-symbol-URP.svg', 'R/U/P': 'card-symbol-URP.svg',
  'B/R/P': 'card-symbol-BRP.svg', 'R/B/P': 'card-symbol-BRP.svg',
  'B/G/P': 'card-symbol-BGP.svg', 'G/B/P': 'card-symbol-BGP.svg',
  'R/G/P': 'card-symbol-RGP.svg', 'G/R/P': 'card-symbol-RGP.svg',
  'R/W/P': 'card-symbol-RWP.svg', 'W/R/P': 'card-symbol-RWP.svg',
  'G/W/P': 'card-symbol-GWP.svg', 'W/G/P': 'card-symbol-GWP.svg',
  'G/U/P': 'card-symbol-GUP.svg', 'U/G/P': 'card-symbol-GUP.svg',
  'X': 'card-symbol-X.svg', 'Y': 'card-symbol-X.svg', 'Z': 'card-symbol-X.svg',
  '0': 'card-symbol-1.svg', '1': 'card-symbol-1.svg', '2': 'card-symbol-2.svg', '3': 'card-symbol-3.svg',
  '4': 'card-symbol-4.svg', '5': 'card-symbol-5.svg', '6': 'card-symbol-6.svg', '7': 'card-symbol-7.svg',
  '8': 'card-symbol-8.svg', '9': 'card-symbol-9.svg', '10': 'card-symbol-10.svg',
  '11': 'card-symbol-11.svg', '12': 'card-symbol-12.svg', '13': 'card-symbol-13.svg',
  '14': 'card-symbol-15.svg', '15': 'card-symbol-15.svg', '16': 'card-symbol-16.svg',
  'T': 'card-symbol-T.svg', 'Q': 'card-symbol-T.svg',
}

const manaCostHtml = computed(() => {
  if (!props.card.mana_cost) return ''
  
  const symbols = props.card.mana_cost.match(/\{([^}]+)\}/g) || []
  return symbols.map(symbol => {
    const value = symbol.slice(1, -1)
    const svgFile = symbolMap[value]
    if (svgFile) {
      return `<img src="/symbols/${svgFile}" alt="${value}" class="card-mana-symbol-img" />`
    }
    return `<span class="card-mana-symbol">${value}</span>`
  }).join('')
})

const rarityType = computed(() => {
  const typeMap = {
    'common': 'info',
    'uncommon': 'success',
    'rare': 'warning',
    'mythic': 'danger'
  }
  return typeMap[props.card.rarity] || 'info'
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
  return textMap[props.card.rarity] || props.card.rarity
})

const price = computed(() => {
  return props.card.prices?.usd ? `$${props.card.prices.usd}` : 
         (props.card.prices?.eur ? `€${props.card.prices.eur}` : '-')
})

const handleClick = () => {
  // 跳转到卡牌详情页面
  const cardId = props.card.id
  if (cardId) {
    window.location.href = `/card/${cardId}`
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  // 显示错误占位符
  const wrapper = e.target.parentElement
  if (wrapper) {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'image-error'
    errorDiv.innerHTML = '<span>图片加载失败</span>'
    wrapper.appendChild(errorDiv)
  }
}
</script>

<style scoped>
.card-item {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.card-image-wrapper {
  position: relative;
  padding-top: 140%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-item:hover .card-image {
  transform: scale(1.05);
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0a0b0;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
}

.card-info {
  padding: 16px;
}

.card-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1a1a1a;
}

.card-set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-set {
  font-size: 0.85rem;
  color: #666;
}

.card-mana-cost {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.card-mana-symbol-img {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.card-mana-symbol {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ccc2c0 0%, #b8aeac 100%);
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-type {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.card-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #16a34a;
}

/* 列表模式样式 */
.card-item.list {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: 60px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.card-item.list:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.list-image-wrapper {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  margin-right: 12px;
}

.list-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.list-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-type {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-left: 12px;
}

.list-mana-cost {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.list-mana-cost :deep(.card-mana-symbol-img) {
  width: 18px;
  height: 18px;
}

.list-set {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6b7280;
}

.list-set-icon {
  font-weight: 600;
  color: #3b82f6;
}

.list-set-number {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .card-info {
    padding: 12px;
  }

  .card-name {
    font-size: 0.9rem;
  }

  .card-item.list {
    padding: 6px 12px;
    height: 56px;
  }

  .list-image-wrapper {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }

  .list-name {
    font-size: 0.9rem;
  }

  .list-type {
    font-size: 0.75rem;
  }
}
</style>
