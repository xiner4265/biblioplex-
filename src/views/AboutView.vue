<template>
  <div class="about-view">
    <el-card class="about-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><InfoFilled /></el-icon>
          <span>关于斯翠海文大书库茂典阁</span>
        </div>
      </template>

      <div class="about-content">
        <div class="section">
          <h3>📚 项目简介</h3>
          <p>
            斯翠海文大书库茂典阁是一个现代化的万智牌卡牌查询工具，灵感来源于万智牌中斯翠海文学院的宏伟图书馆。
            本网站致力于为MTGA（万智牌：竞技场）玩家提供便捷、快速的卡牌搜索和查询服务。
          </p>
        </div>

        <div class="section">
          <h3>🔮 技术栈</h3>
          <el-space wrap>
            <el-tag type="primary">Vue 3</el-tag>
            <el-tag type="success">Pinia</el-tag>
            <el-tag type="warning">Vue Router</el-tag>
            <el-tag type="info">Element Plus</el-tag>
            <el-tag type="danger">Vite</el-tag>
            <el-tag>Scryfall API</el-tag>
          </el-space>
        </div>

        <div class="section">
          <h3>🎯 主要功能</h3>
          <ul>
            <li><el-icon><Search /></el-icon> 智能卡牌搜索 - 支持中英文关键词</li>
            <li><el-icon><Filter /></el-icon> 高级筛选 - 颜色、费用、稀有度、系列、格式</li>
            <li><el-icon><Grid /></el-icon> 多视图展示 - 网格/列表双模式</li>
            <li><el-icon><MagicStick /></el-icon> 随机卡牌 - 探索未知</li>
            <li><el-icon><View /></el-icon> 详细信息 - 规则文本、价格、合法性</li>
          </ul>
        </div>

        <div class="section">
          <h3>📖 数据来源</h3>
          <p>
            本网站使用 <a href="https://scryfall.com/" target="_blank">Scryfall API</a> 获取卡牌数据。
            Scryfall 是万智牌社区最权威、最全面的卡牌数据库，提供免费、开放的API服务。
          </p>
        </div>

        <div class="section">
          <h3>⚖️ 免责声明</h3>
          <p>
            万智牌是威世智公司的注册商标。本网站仅供学习交流使用，不与威世智公司有任何关联。
            卡牌图片和数据版权归原作者所有。
          </p>
        </div>

        <div class="section">
          <h3>📧 联系我们</h3>
          <p>
            如果您有任何建议或发现问题，欢迎通过以下方式联系我们：
          </p>
          <el-space>
            <el-button type="primary" link>
              <el-icon><Message /></el-icon>
              发送邮件
            </el-button>
            <el-button type="primary" link>
              <el-icon><Link /></el-icon>
              GitHub
            </el-button>
          </el-space>
        </div>
      </div>
    </el-card>

    <el-card class="stats-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>网站统计</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">20,000+</div>
            <div class="stat-label">可查询卡牌</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">100+</div>
            <div class="stat-label">支持系列</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">9</div>
            <div class="stat-label">支持格式</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">5</div>
            <div class="stat-label">颜色组合</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-view {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.about-card,
.stats-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #3b82f6;
}

.header-icon {
  font-size: 24px;
  color: #3b82f6;
}

.about-content {
  line-height: 1.8;
}

.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

.section h3 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.section p {
  color: #4b5563;
  margin-bottom: 12px;
  font-size: 1rem;
  line-height: 1.8;
}

.section a {
  color: #3b82f6;
  text-decoration: none;
}

.section a:hover {
  text-decoration: underline;
}

.section ul {
  list-style: none;
  padding: 0;
}

.section li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #4b5563;
  font-size: 1rem;
}

.section li .el-icon {
  color: #3b82f6;
  font-size: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .section h3 {
    font-size: 1.1rem;
  }
}
</style>
