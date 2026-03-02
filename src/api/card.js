import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.scryfall.com',
  timeout: 10000
})

export const cardAPI = {
  async searchCards(query, page = 1) {
    // 检测是否包含中文字符
    const hasChinese = /[\u4e00-\u9fa5]/.test(query)
    let searchQuery
    
    if (hasChinese) {
      // Scryfall 不支持直接搜索中文名称
      // 返回一个空结果，并提示用户
      throw new Error('Scryfall 暂不支持中文搜索，请使用英文卡牌名称（如：Lightning Bolt, Black Lotus）')
    } else {
      // 英文搜索
      searchQuery = encodeURIComponent(query)
    }
    
    console.log('Search query:', query, 'Has Chinese:', hasChinese, 'Encoded:', searchQuery)
    
    try {
      const response = await api.get(`/cards/search?q=${searchQuery}&page=${page}&unique=cards&order=name`)
      return response.data
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message)
      throw error
    }
  },

  async getRandomCard() {
    const response = await api.get('/cards/random')
    return response.data
  },

  async getPopularCards() {
    const response = await api.get('/cards/search?q=game:arena&order=edhrec&page=1')
    return response.data
  },

  async getCardById(id) {
    const response = await api.get(`/cards/${id}`)
    return response.data
  },

  async getSets() {
    try {
      const response = await api.get('/sets')
      return response.data
    } catch (error) {
      console.error('获取系列失败:', error.message)
      throw error
    }
  },

  async getCardsBySet(setCode, page = 1) {
    const response = await api.get(`/cards/search?q=set:${setCode}&page=${page}&unique=cards&order=name`)
    return response.data
  },

  // 获取相同卡牌的不同版本（通过 oracle_id）
  async getCardPrints(oracleId, page = 1) {
    try {
      const response = await api.get(`/cards/search?q=oracleid:${oracleId}&page=${page}&unique=prints&order=released`)
      return response.data
    } catch (error) {
      console.error('获取卡牌版本失败:', error.message)
      throw error
    }
  }
}

export default api
