import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCardStore = defineStore('card', () => {
  const cards = ref([])
  const loading = ref(false)
  const error = ref(null)
  const hasMore = ref(false)
  const currentPage = ref(1)
  const currentQuery = ref('')
  const totalCount = ref(0)

  const setCards = (newCards) => {
    cards.value = newCards
  }

  const appendCards = (newCards) => {
    cards.value = [...cards.value, ...newCards]
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const setHasMore = (hasMoreValue) => {
    hasMore.value = hasMoreValue
  }

  const setCurrentPage = (page) => {
    currentPage.value = page
  }

  const setCurrentQuery = (query) => {
    currentQuery.value = query
  }

  const setTotalCount = (count) => {
    totalCount.value = count
  }

  const reset = () => {
    cards.value = []
    loading.value = false
    error.value = null
    hasMore.value = false
    currentPage.value = 1
    currentQuery.value = ''
    totalCount.value = 0
  }

  return {
    cards,
    loading,
    error,
    hasMore,
    currentPage,
    currentQuery,
    totalCount,
    setCards,
    appendCards,
    setLoading,
    setError,
    setHasMore,
    setCurrentPage,
    setCurrentQuery,
    setTotalCount,
    reset
  }
})
