import axios from 'axios'

const api = axios.create({
  baseURL: 'https://mtgch.com/api/v1',
  timeout: 10000
})

export const cardAPI = {
  async searchCards(query, page = 1) {
    // 支持中文搜索，使用新的API
    const searchQuery = encodeURIComponent(query)
    
    console.log('Search query:', query, 'Encoded:', searchQuery)
    
    try {
      const response = await api.get(`/result?q=${searchQuery}&page=${page}&page_size=20&priority_chinese=true&unique=oracle_id&order=name`)
      return response.data
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message)
      throw error
    }
  },

  async getRandomCard() {
    // 先获取随机卡牌的 set 和 collector_number
    const randomResponse = await api.get('/random')
    const { set, collector_number } = randomResponse.data
    
    // 再用搜索接口获取完整卡牌数据
    const searchResponse = await api.get(`/result?q=set:${set} number:${collector_number}&page=1&page_size=1&priority_chinese=true`)
    
    if (searchResponse.data && searchResponse.data.items && searchResponse.data.items.length > 0) {
      return searchResponse.data.items[0]
    }
    
    throw new Error('Card not found')
  },

  async getPopularCards() {
    // 使用新API的搜索接口，搜索热门卡牌
    const response = await api.get('/result?q=game:arena&page=1&page_size=20&priority_chinese=true&unique=oracle_id&order=name')
    return response.data
  },

  async getCardById(id) {
    try {
      // 使用搜索API，通过ID搜索卡牌
      const response = await api.get(`/result?q=id:${id}&page=1&page_size=1&priority_chinese=true`)
      
      // 确保只返回第一个结果
      if (response.data && response.data.items && response.data.items.length > 0) {
        return response.data.items[0]
      }
      
      throw new Error('Card not found')
    } catch (error) {
      console.error('获取卡牌详情失败:', error.message)
      throw error
    }
  },

  async getSets() {
    try {
      const response = await api.get('/sets/')
      return response.data
    } catch (error) {
      console.error('获取系列失败:', error.message)
      throw error
    }
  },

  async getCardsBySet(setCode, page = 1) {
    const response = await api.get(`/set/${setCode}/cards/?page=${page}&priority_chinese=true&unique=oracle_id&order=name`)
    return response.data
  },

  // 获取相同卡牌的不同版本（通过 UUID）
  async getCardPrints(cardId, page = 1) {
    try {
      const response = await api.get(`/versions/${cardId}/?limit=20`)
      return response.data
    } catch (error) {
      console.error('获取卡牌版本失败:', error.message)
      throw error
    }
  }
}

export default api
