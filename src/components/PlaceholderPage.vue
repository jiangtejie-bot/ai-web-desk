<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 class="placeholder-title">{{ title }}</h2>
      <p class="placeholder-message">此功能正在开发中，敬请期待...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaceholderPage',
  props: {
    title: {
      type: String,
      default: '功能开发中'
    }
  }
}
</script>

<style scoped>
.placeholder-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 40px;
}

.placeholder-content {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: var(--text-muted);
}

.placeholder-icon svg {
  width: 100%;
  height: 100%;
}

.placeholder-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.placeholder-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
