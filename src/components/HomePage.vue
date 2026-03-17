<template>
  <div class="home-page">
    <div class="home-header">
      <div class="logo-section">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="title">WebAuto Studio</span>
          <span class="subtitle">网页自动化控制台</span>
        </div>
      </div>
      <div class="status-indicators">
        <div class="connection-status">
          <span class="signal-bar" v-for="i in 4" :key="i" :class="{ active: i <= signalStrength }"></span>
        </div>
      </div>
    </div>

    <div class="modules-grid">
      <div 
        v-for="module in modules" 
        :key="module.id"
        class="module-card"
        @click="navigateToModule(module)"
      >
        <div class="module-icon">
          <component :is="module.icon" />
        </div>
        <div class="module-info">
          <h3 class="module-title">{{ module.title }}</h3>
          <p class="module-description">{{ module.description }}</p>
          <div class="module-tags">
            <span v-for="tag in module.tags" :key="tag" class="module-tag">{{ tag }}</span>
          </div>
        </div>
        <div class="module-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 3 6"/>
            <polyline points="15 6 9 12 15 21"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="home-footer">
      <span class="footer-text">WebAuto Studio v1.0.0</span>
      <span class="footer-time">{{ currentTime }}</span>
    </div>
  </div>
</template>

<script>
import { modules } from '../config/modules.js'

export default {
  name: 'HomePage',
  data() {
    return {
      signalStrength: 4,
      currentTime: '',
      timerInterval: null,
      modules: modules
    }
  },
  mounted() {
    this.updateTime();
    this.timerInterval = setInterval(this.updateTime, 1000);
  },
  beforeDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('zh-CN', { hour12: false });
    },
    navigateToModule(module) {
      this.$emit('navigate', module.route);
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  color: var(--mint);
}

.logo-text .title {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.logo-text .subtitle {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-status {
  display: flex;
  gap: 4px;
}

.signal-bar {
  width: 4px;
  height: 16px;
  background: var(--border-color);
  border-radius: 2px;
  transition: all 0.3s;
}

.signal-bar.active {
  background: var(--mint);
  box-shadow: 0 0 6px var(--mint);
}

.modules-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 40px 32px;
  overflow-y: auto;
}

.module-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--mint-dim) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.module-card:hover {
  border-color: var(--mint);
  box-shadow: var(--glow-mint);
  transform: translateY(-4px);
}

.module-card:hover::before {
  opacity: 1;
}

.module-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mint);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.module-info {
  flex: 1;
  min-width: 0;
}

.module-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.module-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.module-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.module-tag {
  font-size: 0.75rem;
  padding: 4px 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.module-arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.3s;
}

.module-card:hover .module-arrow {
  color: var(--mint);
  transform: translateX(4px);
}

.home-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.footer-text {
  font-weight: 600;
}

.footer-time {
  font-family: 'JetBrains Mono', monospace;
}

@media (max-width: 768px) {
  .home-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
    padding: 24px 16px;
    gap: 16px;
  }
  
  .module-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .module-icon {
    width: 48px;
    height: 48px;
  }
  
  .module-arrow {
    display: none;
  }
}
</style>
