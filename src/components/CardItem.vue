<template>
  <div class="card-item" :class="viewMode" @click="handleClick">
    <!-- 网格模式 -->
    <template v-if="viewMode === 'grid'">
      <div class="card-image-wrapper">
        <img
          :src="imageUrl"
          :alt="cardDisplayName"
          class="card-image"
          loading="lazy"
          @error="handleImageError"
        />
        <!-- 图片加载失败时显示卡牌名称 -->
        <div v-if="!imageUrl" class="image-placeholder">
          <span class="placeholder-name">{{ cardDisplayName }}</span>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-name" :title="cardDisplayName">{{ cardDisplayName }}</h3>
        <div class="card-set-row">
          <span class="card-set">{{ card.set_translated_name || card.set_name || card.set }} ({{ card.set?.toUpperCase() || 'N/A' }})</span>
        </div>
        <p class="card-type">{{ card.display_type_line || card.zhs_type_line || card.type_line || 'N/A' }}</p>
        <div class="card-footer">
          <el-tag :type="rarityType" size="small">{{ rarityText }}</el-tag>
        </div>
      </div>
    </template>

    <!-- 列表模式 -->
    <template v-else>
      <div class="list-image-wrapper">
        <img
          :src="imageUrl"
          :alt="cardDisplayName"
          class="list-image"
          loading="lazy"
          @error="handleImageError"
        />
        <!-- 图片加载失败时显示卡牌名称 -->
        <div v-if="!imageUrl" class="list-image-placeholder">
          <span>{{ cardDisplayName }}</span>
        </div>
      </div>
      <div class="list-info">
        <h3 class="list-name" :title="cardDisplayName">{{ cardDisplayName }}</h3>
        <p class="list-type">{{ card.display_type_line || card.zhs_type_line || card.type_line || 'N/A' }}</p>
      </div>
      <div class="list-right">
        <div class="list-mana-cost" v-html="cardManaCostHtml"></div>
        <div class="list-set">
          <span class="list-set-icon">{{ card.set?.toUpperCase() || 'N/A' }}</span>
          <span class="list-set-number">{{ card.collector_number || card.number || 'N/A' }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { rarityMap, rarityTypeMap, symbolMap, formatManaCostHtml } from '@/utils/card'

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
  const card = props.card
  
  // 尝试多种图片来源 - 根据API返回的实际字段
  const image = 
    // API返回的主要图片字段
    card.image_url ||
    card.img ||
    card.image ||
    // 中文图片优先
    card.zhs_image_uris?.normal || 
    card.zhs_image_uris?.small ||
    card.zhs_image_uris?.large ||
    // 英文图片
    card.image_uris?.normal || 
    card.image_uris?.small ||
    card.image_uris?.large ||
    // 双面卡牌
    card.card_faces?.[0]?.zhs_image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.normal ||
    card.card_faces?.[0]?.zhs_image_uris?.small ||
    card.card_faces?.[0]?.image_uris?.small ||
    ''
  
  return image
})

// 确保始终有卡牌名称显示 - 使用API返回的正确字段名
const cardDisplayName = computed(() => {
  const card = props.card
  
  // 尝试多种可能的名称字段（按优先级排序）
  const names = [
    // API返回的中文名称字段
    card.display_name_zh,
    // API返回的英文名称字段
    card.display_name,
    // 其他可能的字段名
    card.zhs_name,
    card.name,
    card.name_zh,
    card.chinese_name,
    card.oracle_id,
    card.id
  ]
  
  // 过滤空值并返回第一个有效名称
  const validName = names.find(n => n && typeof n === 'string' && n.trim())
  
  // 如果都为空，返回默认值
  return validName || '未知卡牌'
})

const cardManaCostHtml = computed(() => {
  const card = props.card
  
  // 使用工具函数格式化法术力费用
  if (card.mana_cost) {
    return formatManaCostHtml(card.mana_cost)
  }
  
  // 备用：解析 mana_cost_html 中的类名
  if (card.mana_cost_html && card.mana_cost_html.includes('ms-')) {
    // 提取所有 ms-xxx 类名
    const classMatches = card.mana_cost_html.match(/ms-[^\s"]+/g) || []
    
    // 过滤掉不需要的类
    const symbolClasses = classMatches.filter(cls => 
      !cls.includes('ms-cost') && 
      !cls.includes('ms-shadow') &&
      !cls.includes('ms-sr-only')
    )
    
    return symbolClasses.map(cls => {
      // 提取符号值（去掉 ms- 前缀）并转换为大写
      const value = cls.slice(3).toUpperCase()
      
      // 直接从映射中查找
      const svgFile = symbolMap[value]
      if (svgFile) {
        return `<img src="/symbols/${svgFile}" alt="${value}" class="card-mana-symbol-img" />`
      }
      
      return `<span class="card-mana-symbol">{${value}}</span>`
    }).join('')
  }
  
  return ''
})

const rarityType = computed(() => {
  return rarityTypeMap[props.card.rarity] || 'info'
})

const rarityText = computed(() => {
  const extendedMap = {
    ...rarityMap,
    'special': '特殊',
    'bonus': '奖励'
  }
  return extendedMap[props.card.rarity] || props.card.rarity
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
  // 显示错误占位符，包含卡牌名称
  const wrapper = e.target.parentElement
  if (wrapper) {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'image-error'
    const cardName = props.card.zhs_name || props.card.name || '未知卡牌'
    errorDiv.innerHTML = `<span>${cardName}</span><span class="error-text">图片加载失败</span>`
    wrapper.appendChild(errorDiv)
  }
}
</script>

<style scoped>
.card-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
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
  padding: 8px;
  text-align: center;
}

.image-error span:first-child {
  font-weight: 600;
  color: #d0d0e0;
  font-size: 1rem;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.image-error .error-text {
  font-size: 0.75rem;
  color: #707080;
}

/* 图片占位符样式 */
.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
  padding: 12px;
  text-align: center;
}

.image-placeholder .placeholder-name {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* 列表模式图片占位符 */
.list-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
  padding: 4px;
  text-align: center;
}

.list-image-placeholder span {
  font-size: 0.65rem;
  font-weight: 600;
  color: #e0e0f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
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
  color: var(--text-primary);
}

.card-set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-set {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.card-mana-cost {
  display: flex;
  gap: 3px;
  flex-wrap: nowrap;
  justify-content: flex-end;
  align-items: center;
}

.card-mana-symbol-img {
  width: 22px;
  height: 22px;
  display: inline-block;
  flex-shrink: 0;
}

.card-mana-symbol {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ccc2c0 0%, #b8aeac 100%);
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.card-type {
  font-size: 0.8rem;
  color: var(--text-secondary);
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
  border-top: 1px solid var(--border-color);
}

/* 列表模式样式 */
.card-item.list {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: 60px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.card-item.list:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent-color);
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
  color: var(--text-primary);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-type {
  font-size: 0.8rem;
  color: var(--text-secondary);
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
  color: var(--text-secondary);
}

.list-set-icon {
  font-weight: 600;
  color: var(--accent-color);
}

.list-set-number {
  color: var(--text-secondary);
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
