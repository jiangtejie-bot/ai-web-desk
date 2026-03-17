<template>
  <div class="game-center">
    <div class="game-grid">
      <div 
        v-for="game in games" 
        :key="game.id"
        class="game-card"
        @click="selectGame(game)"
      >
        <div class="game-icon" :style="{ background: game.color }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="game.iconPath"/>
          </svg>
        </div>
        <div class="game-info">
          <h4 class="game-name">{{ game.name }}</h4>
          <p class="game-description">{{ game.description }}</p>
          <div class="game-meta">
            <span class="game-players">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ game.minPlayers }}-{{ game.maxPlayers }}人
            </span>
            <span class="game-popularity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ game.popularity }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameCenter',
  data() {
    return {
      games: [
        {
          id: 'werewolf',
          name: '狼人杀',
          description: '经典的推理游戏，找出隐藏的狼人',
          iconPath: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z',
          color: '#e74c3c',
          minPlayers: 6,
          maxPlayers: 12,
          popularity: '热门'
        },
        {
          id: 'undercover',
          name: '谁是卧底',
          description: '通过描述找出与众不同的卧底',
          iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          color: '#9b59b6',
          minPlayers: 4,
          maxPlayers: 10,
          popularity: '推荐'
        },
        {
          id: 'truth',
          name: '真心话大冒险',
          description: '增进友谊的经典聚会游戏',
          iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          color: '#3498db',
          minPlayers: 2,
          maxPlayers: 20,
          popularity: '经典'
        },
        {
          id: 'guess',
          name: '你画我猜',
          description: '发挥创意，猜出对方画的是什么',
          iconPath: 'M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M7 7l.5.5M12 12l.5.5',
          color: '#f39c12',
          minPlayers: 2,
          maxPlayers: 8,
          popularity: '趣味'
        },
        {
          id: 'word',
          name: '成语接龙',
          description: '考验词汇量的文字游戏',
          iconPath: 'M4 7V4h16v3M9 20h6M12 4v16M4 7h16v13H4V7z',
          color: '#1abc9c',
          minPlayers: 2,
          maxPlayers: 10,
          popularity: '益智'
        },
        {
          id: 'number',
          name: '数字炸弹',
          description: '刺激的数字猜测游戏',
          iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z',
          color: '#e91e63',
          minPlayers: 2,
          maxPlayers: 20,
          popularity: '刺激'
        }
      ]
    }
  },
  methods: {
    selectGame(game) {
      this.$emit('openGame', game.id)
    }
  }
}
</script>

<style scoped>
.game-center {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.game-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 16px;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.game-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.game-icon svg {
  width: 32px;
  height: 32px;
}

.game-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.game-description {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.game-meta {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.game-players,
.game-popularity {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.game-players svg,
.game-popularity svg {
  width: 14px;
  height: 14px;
}

.game-popularity {
  color: #f39c12;
}
</style>
