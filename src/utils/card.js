export const symbolMap = {
  'W': 'white.svg',
  'U': 'blue.svg',
  'B': 'black.svg',
  'R': 'red.svg',
  'G': 'green.svg',
  'C': 'card-symbol-C.svg',
  'T': 'card-symbol-T.svg',
  'X': 'card-symbol-X.svg',
  '0': 'card-symbol-0.svg',
  '1': 'card-symbol-1.svg',
  '2': 'card-symbol-2.svg',
  '3': 'card-symbol-3.svg',
  '4': 'card-symbol-4.svg',
  '5': 'card-symbol-5.svg',
  '6': 'card-symbol-6.svg',
  '7': 'card-symbol-7.svg',
  '8': 'card-symbol-8.svg',
  '9': 'card-symbol-9.svg',
  '10': 'card-symbol-10.svg',
  '11': 'card-symbol-11.svg',
  '12': 'card-symbol-12.svg',
  '13': 'card-symbol-13.svg',
  '14': 'card-symbol-14.svg',
  '15': 'card-symbol-15.svg',
  '16': 'card-symbol-16.svg',
  '17': 'card-symbol-17.svg',
  '18': 'card-symbol-18.svg',
  '19': 'card-symbol-19.svg',
  '20': 'card-symbol-20.svg',
  '100': 'card-symbol-100.svg',
  'W/U': 'card-symbol-WU.svg',
  'W/B': 'card-symbol-WB.svg',
  'U/B': 'card-symbol-UB.svg',
  'U/R': 'card-symbol-UR.svg',
  'B/R': 'card-symbol-BR.svg',
  'B/G': 'card-symbol-BG.svg',
  'R/G': 'card-symbol-RG.svg',
  'R/W': 'card-symbol-RW.svg',
  'G/W': 'card-symbol-GW.svg',
  'G/U': 'card-symbol-GU.svg',
  'WU': 'card-symbol-WU.svg',
  'WB': 'card-symbol-WB.svg',
  'UB': 'card-symbol-UB.svg',
  'UR': 'card-symbol-UR.svg',
  'BR': 'card-symbol-BR.svg',
  'BG': 'card-symbol-BG.svg',
  'RG': 'card-symbol-RG.svg',
  'RW': 'card-symbol-RW.svg',
  'GW': 'card-symbol-GW.svg',
  'GU': 'card-symbol-GU.svg',
  'W/P': 'card-symbol-WP.svg',
  'U/P': 'card-symbol-UP.svg',
  'B/P': 'card-symbol-BP.svg',
  'R/P': 'card-symbol-RP.svg',
  'G/P': 'card-symbol-GP.svg',
  'W/U/P': 'card-symbol-GUP.svg',
  'B/G/P': 'card-symbol-BGP.svg',
  'R/G/P': 'card-symbol-RGP.svg',
  'R/W/P': 'card-symbol-RWP.svg',
  'G/W/P': 'card-symbol-GWP.svg'
}

export const rarityMap = {
  'common': '普通',
  'uncommon': '非普通',
  'rare': '稀有',
  'mythic': '秘稀'
}

export const rarityTypeMap = {
  'common': 'info',
  'uncommon': 'success',
  'rare': 'warning',
  'mythic': 'danger'
}

export function parseManaCost(manaCost) {
  if (!manaCost) return []
  return manaCost.match(/\{([^}]+)\}/g) || []
}

export function getManaSymbolImage(symbol) {
  const value = symbol.slice(1, -1).toUpperCase()
  return symbolMap[value]
}

export function formatManaCostHtml(manaCost) {
  if (!manaCost) return ''
  
  const symbols = parseManaCost(manaCost)
  
  return symbols.map(symbol => {
    const svgFile = getManaSymbolImage(symbol)
    const value = symbol.slice(1, -1)
    
    if (svgFile) {
      return `<img src="/symbols/${svgFile}" alt="${value}" class="card-mana-symbol-img" />`
    }
    return `<span class="card-mana-symbol">{${value}}</span>`
  }).join('')
}