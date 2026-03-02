// MTGA Card Search - 主应用逻辑
// 使用 Scryfall API 获取卡牌数据

class MTGACardSearch {
    constructor() {
        this.apiBase = 'https://api.scryfall.com';
        this.currentPage = 1;
        this.hasMore = false;
        this.currentQuery = '';
        this.viewMode = 'grid';
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadRandomCards();
    }

    cacheElements() {
        // 搜索元素
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        
        // 高级搜索元素
        this.advancedToggle = document.getElementById('advancedSearchToggle');
        this.advancedPanel = document.getElementById('advancedPanel');
        this.applyFiltersBtn = document.getElementById('applyFilters');
        this.resetFiltersBtn = document.getElementById('resetFilters');
        
        // 结果元素
        this.cardsContainer = document.getElementById('cardsContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultsCount = document.getElementById('resultsCount');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        
        // 视图切换
        this.gridViewBtn = document.getElementById('gridView');
        this.listViewBtn = document.getElementById('listView');
        
        // 弹窗
        this.cardModal = document.getElementById('cardModal');
        this.cardDetailContent = document.getElementById('cardDetailContent');
        this.modalClose = document.querySelector('.modal-close');
        this.modalOverlay = document.querySelector('.modal-overlay');
    }

    bindEvents() {
        // 搜索事件
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Logo点击返回主页面
        document.getElementById('logo').addEventListener('click', () => this.loadRandomCards());

        // 导航栏事件
        document.querySelector('.nav-link:nth-child(1)').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadRandomCards();
        });
        document.querySelector('.nav-link:nth-child(2)').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadRandomCard();
        });
        document.querySelector('.nav-link:nth-child(3)').addEventListener('click', (e) => {
            e.preventDefault();
            alert('MTGA Card Search - 万智牌卡牌查询工具\n\n使用 Scryfall API 提供数据\n支持中英文搜索\n\n© 2026 MTGA Card Search');
        });

        // 高级搜索切换
        this.advancedToggle.addEventListener('click', () => this.toggleAdvancedPanel());

        // 筛选器事件
        this.applyFiltersBtn.addEventListener('click', () => this.handleSearch());
        this.resetFiltersBtn.addEventListener('click', () => this.resetFilters());

        // 视图切换
        this.gridViewBtn.addEventListener('click', () => this.setViewMode('grid'));
        this.listViewBtn.addEventListener('click', () => this.setViewMode('list'));

        // 加载更多
        this.loadMoreBtn.addEventListener('click', () => this.loadMore());

        // 弹窗事件
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', () => this.closeModal());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // 法术力符号点击效果
        document.querySelectorAll('.mana-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function() {
                const input = this.querySelector('input');
                input.checked = !input.checked;
                this.classList.toggle('active', input.checked);
            });
        });

        // 稀有度点击效果
        document.querySelectorAll('.rarity-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function() {
                const input = this.querySelector('input');
                input.checked = !input.checked;
                this.classList.toggle('active', input.checked);
            });
        });
    }

    toggleAdvancedPanel() {
        this.advancedPanel.classList.toggle('hidden');
        this.advancedToggle.classList.toggle('active');
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.gridViewBtn.classList.toggle('active', mode === 'grid');
        this.listViewBtn.classList.toggle('active', mode === 'list');
        this.cardsContainer.classList.toggle('list-view', mode === 'list');
    }

    buildQuery() {
        const parts = [];
        const searchTerm = this.searchInput.value.trim();

        if (searchTerm) {
            parts.push(searchTerm);
        }

        // 颜色筛选
        const selectedColors = Array.from(document.querySelectorAll('.mana-checkbox input:checked'))
            .map(cb => cb.value);
        if (selectedColors.length > 0) {
            const colorMode = document.querySelector('input[name="colorMode"]:checked').value;
            const colorQuery = selectedColors.join('');
            
            switch(colorMode) {
                case 'exactly':
                    parts.push(`c=${colorQuery}`);
                    break;
                case 'including':
                    parts.push(`c>=${colorQuery}`);
                    break;
                case 'at_most':
                    parts.push(`c<=${colorQuery}`);
                    break;
            }
        }

        // 法术力费用
        const cmcMin = document.getElementById('cmcMin').value;
        const cmcMax = document.getElementById('cmcMax').value;
        if (cmcMin) parts.push(`cmc>=${cmcMin}`);
        if (cmcMax) parts.push(`cmc<=${cmcMax}`);

        // 稀有度
        const selectedRarities = Array.from(document.querySelectorAll('.rarity-checkbox input:checked'))
            .map(cb => cb.value);
        if (selectedRarities.length > 0) {
            parts.push(`r:${selectedRarities.join(',')}`);
        }

        // 卡牌类型
        const cardType = document.getElementById('cardType').value;
        if (cardType) {
            parts.push(`t:${cardType}`);
        }

        // 系列
        const cardSet = document.getElementById('cardSet').value;
        if (cardSet) {
            parts.push(`e:${cardSet}`);
        }

        // 格式
        const cardFormat = document.getElementById('cardFormat').value;
        if (cardFormat) {
            parts.push(`f:${cardFormat}`);
        }

        return parts.join(' ');
    }

    async handleSearch() {
        const query = this.buildQuery();
        if (!query.trim()) {
            this.showError('请输入搜索关键词');
            return;
        }

        this.currentQuery = query;
        this.currentPage = 1;
        this.hasMore = false;
        
        this.cardsContainer.innerHTML = '';
        this.hideError();
        this.showLoading();

        try {
            const data = await this.searchCards(query);
            this.hideLoading();
            this.renderCards(data);
        } catch (error) {
            this.hideLoading();
            this.showError('搜索失败，请稍后重试');
            console.error('Search error:', error);
        }
    }

    async searchCards(query, page = 1) {
        const encodedQuery = encodeURIComponent(query);
        const url = `${this.apiBase}/cards/search?q=${encodedQuery}&page=${page}&unique=cards&order=name`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                return { data: [], total_cards: 0, has_more: false };
            }
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    }

    async loadRandomCards() {
        this.showLoading();
        try {
            // 获取一些热门卡牌作为默认展示
            const response = await fetch(`${this.apiBase}/cards/search?q=game:arena&order=edhrec&page=1`);
            if (response.ok) {
                const data = await response.json();
                this.hideLoading();
                this.renderCards(data);
                this.resultsCount.textContent = '热门卡牌推荐';
            }
        } catch (error) {
            this.hideLoading();
            console.error('Failed to load random cards:', error);
        }
    }

    async loadRandomCard() {
        this.showLoading();
        try {
            // 从Scryfall API获取随机卡牌
            const response = await fetch(`${this.apiBase}/cards/random`);
            if (response.ok) {
                const card = await response.json();
                this.hideLoading();
                this.showCardDetail(card);
            }
        } catch (error) {
            this.hideLoading();
            this.showError('获取随机卡牌失败');
            console.error('Failed to load random card:', error);
        }
    }

    async loadMore() {
        if (!this.hasMore) return;
        
        this.loadMoreBtn.textContent = '加载中...';
        this.loadMoreBtn.disabled = true;

        try {
            this.currentPage++;
            const data = await this.searchCards(this.currentQuery, this.currentPage);
            this.appendCards(data);
        } catch (error) {
            this.showError('加载更多失败');
            console.error('Load more error:', error);
        } finally {
            this.loadMoreBtn.textContent = '加载更多';
            this.loadMoreBtn.disabled = false;
        }
    }

    renderCards(data) {
        if (!data.data || data.data.length === 0) {
            this.resultsCount.textContent = '未找到匹配的卡牌';
            this.loadMoreContainer.classList.add('hidden');
            return;
        }

        this.resultsCount.textContent = `找到 ${data.total_cards} 张卡牌`;
        this.hasMore = data.has_more;
        
        if (this.hasMore) {
            this.loadMoreContainer.classList.remove('hidden');
        } else {
            this.loadMoreContainer.classList.add('hidden');
        }

        data.data.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.cardsContainer.appendChild(cardElement);
        });
    }

    appendCards(data) {
        if (!data.data || data.data.length === 0) return;

        this.hasMore = data.has_more;
        
        if (!this.hasMore) {
            this.loadMoreContainer.classList.add('hidden');
        }

        data.data.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.cardsContainer.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const div = document.createElement('div');
        div.className = 'card-item';
        div.addEventListener('click', () => this.showCardDetail(card));

        const imageUrl = card.image_uris?.normal || card.image_uris?.small || card.card_faces?.[0]?.image_uris?.normal || '';
        const manaCost = this.parseManaCost(card.mana_cost);
        const rarityClass = `rarity-${card.rarity}`;
        const rarityText = this.getRarityText(card.rarity);
        const price = card.prices?.usd ? `$${card.prices.usd}` : (card.prices?.eur ? `€${card.prices.eur}` : '-');

        div.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${imageUrl}" alt="${card.name}" class="card-image" loading="lazy">
            </div>
            <div class="card-info">
                <h3 class="card-name">${card.name}</h3>
                <div class="card-set-row">
                    <span class="card-set">${card.set_name} (${card.set.toUpperCase()})</span>
                    <div class="card-mana-cost">${manaCost}</div>
                </div>
                <p class="card-type">${card.type_line}</p>
                <div class="card-footer">
                    <span class="card-rarity ${rarityClass}">${rarityText}</span>
                    <span class="card-price">${price}</span>
                </div>
            </div>
        `;

        return div;
    }

    parseManaCost(manaCost) {
        if (!manaCost) return '';
        
        const symbols = manaCost.match(/\{([^}]+)\}/g) || [];
        return symbols.map(symbol => {
            const value = symbol.slice(1, -1);
            const colorClass = this.getManaColorClass(value);
            return `<span class="card-mana-symbol ${colorClass}">${value}</span>`;
        }).join('');
    }

    getManaColorClass(symbol) {
        const colorMap = {
            'W': 'mana-w', 'U': 'mana-u', 'B': 'mana-b', 'R': 'mana-r', 'G': 'mana-g',
            'C': 'mana-c'
        };
        return colorMap[symbol] || 'mana-c';
    }

    getRarityText(rarity) {
        const rarityMap = {
            'common': '普通',
            'uncommon': '非普通',
            'rare': '稀有',
            'mythic': '秘稀',
            'special': '特殊',
            'bonus': '奖励'
        };
        return rarityMap[rarity] || rarity;
    }

    showCardDetail(card) {
        const imageUrl = card.image_uris?.normal || card.image_uris?.large || card.card_faces?.[0]?.image_uris?.normal || '';
        const manaCost = this.parseManaCost(card.mana_cost);
        const oracleText = card.oracle_text ? card.oracle_text.replace(/\n/g, '<br>') : '';
        const flavorText = card.flavor_text ? `<p class="flavor-text">${card.flavor_text}</p>` : '';
        
        // 构建合法性格式标签
        const legalitiesHtml = this.buildLegalitiesHtml(card.legalities);

        // 价格信息
        const usdPrice = card.prices?.usd ? `$${card.prices.usd}` : 'N/A';
        const eurPrice = card.prices?.eur ? `€${card.prices.eur}` : 'N/A';
        const tixPrice = card.prices?.tix ? `${card.prices.tix} TIX` : 'N/A';

        // 攻防信息（仅生物）
        let statsHtml = '';
        if (card.power !== undefined && card.toughness !== undefined) {
            statsHtml = `
                <div class="stat-box">
                    <div class="stat-label">力量/防御</div>
                    <div class="stat-value">${card.power}/${card.toughness}</div>
                </div>
            `;
        }
        if (card.loyalty) {
            statsHtml = `
                <div class="stat-box">
                    <div class="stat-label">忠诚</div>
                    <div class="stat-value">${card.loyalty}</div>
                </div>
            `;
        }

        this.cardDetailContent.innerHTML = `
            <div class="card-detail-image">
                <img src="${imageUrl}" alt="${card.name}">
            </div>
            <div class="card-detail-info">
                <div class="card-detail-header">
                    <h2 class="card-detail-name">${card.name}</h2>
                    <div class="card-detail-mana">${manaCost}</div>
                    <p class="card-detail-type">${card.type_line}</p>
                </div>
                
                <div class="card-detail-text">
                    ${oracleText}
                    ${flavorText}
                </div>

                ${statsHtml ? `<div class="card-detail-stats">${statsHtml}</div>` : ''}

                <div class="card-detail-prices">
                    <div class="price-box">
                        <div class="price-label">USD</div>
                        <div class="price-value price-usd">${usdPrice}</div>
                    </div>
                    <div class="price-box">
                        <div class="price-label">EUR</div>
                        <div class="price-value price-eur">${eurPrice}</div>
                    </div>
                </div>

                <div class="card-detail-legalities">
                    <div class="legalities-title">格式合法性</div>
                    <div class="legalities-grid">
                        ${legalitiesHtml}
                    </div>
                </div>

                <div class="card-detail-actions">
                    <button class="btn btn-primary" onclick="window.open('${card.scryfall_uri}', '_blank')">
                        在 Scryfall 查看
                    </button>
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${card.name}')">
                        复制卡牌名称
                    </button>
                </div>
            </div>
        `;

        this.cardModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    buildLegalitiesHtml(legalities) {
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
        };

        const priorityFormats = ['standard', 'pioneer', 'modern', 'legacy', 'vintage', 'commander', 'pauper', 'historic', 'explorer'];
        
        return priorityFormats.map(format => {
            const status = legalities[format] || 'not_legal';
            const formatName = formatNames[format] || format;
            const statusClass = `legality-${status}`;
            const statusText = this.getLegalityText(status);
            return `<div class="legality-tag ${statusClass}">${formatName}: ${statusText}</div>`;
        }).join('');
    }

    getLegalityText(status) {
        const statusMap = {
            'legal': '合法',
            'not_legal': '不合法',
            'banned': '禁牌',
            'restricted': '限制'
        };
        return statusMap[status] || status;
    }

    closeModal() {
        this.cardModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    resetFilters() {
        document.querySelectorAll('.mana-checkbox input').forEach(cb => {
            cb.checked = false;
            cb.closest('.mana-checkbox').classList.remove('active');
        });
        document.querySelectorAll('.rarity-checkbox input').forEach(cb => {
            cb.checked = false;
            cb.closest('.rarity-checkbox').classList.remove('active');
        });
        document.getElementById('cmcMin').value = '';
        document.getElementById('cmcMax').value = '';
        document.getElementById('cardType').value = '';
        document.getElementById('cardSet').value = '';
        document.getElementById('cardFormat').value = '';
        document.querySelector('input[name="colorMode"][value="exactly"]').checked = true;
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
        this.loadMoreContainer.classList.add('hidden');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new MTGACardSearch();
});
