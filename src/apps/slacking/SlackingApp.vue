<template>
  <div class="slacking-app">
    <div class="slacking-container">
      <div class="slacking-header">
        <h3>上班摸鱼</h3>
        <div class="tab-selector">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'chat' }"
            @click="activeTab = 'chat'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            摸鱼聊天
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'games' }"
            @click="activeTab = 'games'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 12h4m-2-2v4m14-2h-6"/>
            </svg>
            游戏中心
          </button>
        </div>
      </div>

      <div class="slacking-content">
        <ChatRoom v-if="activeTab === 'chat'" />
        <GameCenter v-if="activeTab === 'games'" @openGame="openGame" />
      </div>
    </div>
  </div>
</template>

<script>
import ChatRoom from './components/ChatRoom.vue'
import GameCenter from './components/GameCenter.vue'

export default {
  name: 'SlackingApp',
  components: {
    ChatRoom,
    GameCenter
  },
  data() {
    return {
      activeTab: 'chat'
    }
  },
  methods: {
    openGame(gameId) {
      this.$emit('openGame', gameId)
    }
  }
}
</script>

<style scoped>
.slacking-app {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.slacking-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.slacking-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slacking-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.tab-selector {
  display: flex;
  gap: 10px;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tab-btn.active {
  background: white;
  color: #667eea;
  font-weight: 600;
}

.tab-btn svg {
  width: 18px;
  height: 18px;
}

.slacking-content {
  flex: 1;
  overflow: hidden;
}
</style>
