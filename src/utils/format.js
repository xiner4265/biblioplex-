export function formatPrice(prices) {
  if (!prices) return '-'
  
  if (prices.usd) {
    return `$${prices.usd}`
  } else if (prices.eur) {
    return `€${prices.eur}`
  } else if (prices.usd_foil) {
    return `$${prices.usd_foil}`
  } else if (prices.eur_foil) {
    return `€${prices.eur_foil}`
  } else if (prices.tix) {
    return `${prices.tix} tix`
  }
  
  return '-'
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return Number(num).toLocaleString()
}

export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function removeHtmlTags(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}