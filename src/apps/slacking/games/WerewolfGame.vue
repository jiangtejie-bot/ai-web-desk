<template>
  <div class="werewolf-game">
    <div class="game-header">
      <h3>🐺 狼人杀</h3>
      <div class="game-info">
        <span class="day-count">第 {{ day }} 天</span>
        <span class="phase">{{ phaseText }}</span>
      </div>
    </div>

    <div class="game-content">
      <div class="game-phase" v-if="gamePhase === 'setup'">
        <div class="setup-panel">
          <h4>游戏设置</h4>
          <div class="player-input">
            <label>玩家数量：</label>
            <input 
              type="number" 
              v-model.number="playerCount" 
              min="6" 
              max="12"
              class="number-input"
            />
          </div>
          <div class="role-preview">
            <h5>角色分配预览：</h5>
            <div class="role-list">
              <div class="role-item" v-for="role in rolePreview" :key="role.name">
                <span class="role-icon">{{ role.icon }}</span>
                <span class="role-name">{{ role.name }}</span>
                <span class="role-count">x{{ role.count }}</span>
              </div>
            </div>
          </div>
          <button class="start-btn" @click="startGame">开始游戏</button>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'role'">
        <div class="role-panel">
          <h4>查看你的身份</h4>
          <div class="role-card" :class="showRole ? 'revealed' : ''">
            <div class="role-card-inner">
              <div class="role-icon-large">{{ currentRole.icon }}</div>
              <div class="role-name-large">{{ showRole ? currentRole.name : '???' }}</div>
              <div class="role-description" v-if="showRole">{{ currentRole.description }}</div>
            </div>
          </div>
          <button class="reveal-btn" @click="showRole = !showRole">
            {{ showRole ? '隐藏身份' : '查看身份' }}
          </button>
          <button class="confirm-btn" @click="confirmRole">确认身份</button>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'night'">
        <div class="night-panel">
          <div class="night-sky">
            <div class="moon">🌙</div>
            <div class="stars">
              <span v-for="i in 20" :key="i" class="star" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }">✨</span>
            </div>
          </div>
          <div class="night-content">
            <h4>🌙 天黑请闭眼</h4>
            <p v-if="nightAction === 'wolf'">狼人请睁眼，选择要杀的玩家</p>
            <p v-if="nightAction === 'seer'">预言家请睁眼，选择要查验的玩家</p>
            <p v-if="nightAction === 'witch'">女巫请睁眼</p>
            
            <div class="player-grid" v-if="nightAction === 'wolf' || nightAction === 'seer'">
              <div 
                v-for="(player, index) in players" 
                :key="index"
                class="player-card"
                :class="{ selected: selectedPlayer === index, dead: player.dead }"
                @click="selectPlayer(index)"
              >
                <div class="player-avatar">{{ player.avatar }}</div>
                <div class="player-number">{{ index + 1 }}号</div>
              </div>
            </div>

            <div class="witch-actions" v-if="nightAction === 'witch'">
              <div class="witch-potions">
                <div class="potion" :class="{ used: !witchHasAntidote }">
                  <span>💊 解药</span>
                  <span class="status">{{ witchHasAntidote ? '可用' : '已用' }}</span>
                </div>
                <div class="potion" :class="{ used: !witchHasPoison }">
                  <span>☠️ 毒药</span>
                  <span class="status">{{ witchHasPoison ? '可用' : '已用' }}</span>
                </div>
              </div>
              <div v-if="nightKillPlayer !== null" class="kill-info">
                今晚 {{ nightKillPlayer + 1 }}号玩家被杀
              </div>
            </div>

            <button class="action-btn" @click="confirmNightAction">确认</button>
          </div>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'day'">
        <div class="day-panel">
          <div class="day-sky">
            <div class="sun">☀️</div>
          </div>
          <div class="day-content">
            <h4>☀️ 天亮了</h4>
            <div class="announcement" v-if="announcement">
              {{ announcement }}
            </div>
            
            <div class="discussion-area">
              <h5>自由讨论</h5>
              <div class="chat-messages">
                <div v-for="(msg, index) in discussionMessages" :key="index" class="chat-message">
                  <span class="player-name">{{ msg.player }}:</span>
                  <span class="message-text">{{ msg.text }}</span>
                </div>
              </div>
              <div class="chat-input">
                <input v-model="discussionInput" placeholder="输入发言..." @keypress.enter="sendDiscussion" />
                <button @click="sendDiscussion">发送</button>
              </div>
            </div>

            <div class="voting-area">
              <h5>投票阶段</h5>
              <div class="player-grid">
                <div 
                  v-for="(player, index) in players" 
                  :key="index"
                  class="player-card"
                  :class="{ selected: votePlayer === index, dead: player.dead }"
                  @click="votePlayer = index"
                >
                  <div class="player-avatar">{{ player.avatar }}</div>
                  <div class="player-number">{{ index + 1 }}号</div>
                  <div class="vote-count" v-if="player.votes > 0">{{ player.votes }}票</div>
                </div>
              </div>
              <button class="vote-btn" @click="confirmVote" :disabled="votePlayer === null">投票</button>
            </div>
          </div>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'end'">
        <div class="end-panel">
          <div class="winner-announcement">
            <div class="winner-icon">{{ winner === 'wolf' ? '🐺' : '👥' }}</div>
            <h4>{{ winner === 'wolf' ? '狼人胜利！' : '好人胜利！' }}</h4>
            <p>{{ winner === 'wolf' ? '狼人成功消灭了所有村民' : '村民成功找出了所有狼人' }}</p>
          </div>
          <div class="role-reveal">
            <h5>身份揭晓</h5>
            <div class="all-roles">
              <div v-for="(player, index) in players" :key="index" class="player-role">
                <span class="player-avatar">{{ player.avatar }}</span>
                <span class="player-number">{{ index + 1 }}号</span>
                <span class="player-role-name">{{ player.role.name }}</span>
                <span class="player-status">{{ player.dead ? '已死亡' : '存活' }}</span>
              </div>
            </div>
          </div>
          <button class="restart-btn" @click="restartGame">再来一局</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WerewolfGame',
  data() {
    return {
      gamePhase: 'setup',
      playerCount: 8,
      day: 1,
      phase: 'night',
      players: [],
      currentRole: null,
      showRole: false,
      nightAction: 'wolf',
      selectedPlayer: null,
      votePlayer: null,
      nightKillPlayer: null,
      witchHasAntidote: true,
      witchHasPoison: true,
      announcement: '',
      discussionMessages: [],
      discussionInput: '',
      winner: null,
      roles: {
        wolf: { name: '狼人', icon: '🐺', description: '每晚可以杀死一名玩家' },
        villager: { name: '村民', icon: '👨‍🌾', description: '没有特殊能力，通过推理找出狼人' },
        seer: { name: '预言家', icon: '🔮', description: '每晚可以查验一名玩家的身份' },
        witch: { name: '女巫', icon: '🧙‍♀️', description: '拥有一瓶解药和一瓶毒药' },
        hunter: { name: '猎人', icon: '🏹', description: '死亡时可以带走一名玩家' }
      }
    }
  },
  computed: {
    phaseText() {
      if (this.gamePhase === 'setup') return '准备阶段'
      if (this.gamePhase === 'role') return '角色分配'
      if (this.gamePhase === 'night') return '夜晚'
      if (this.gamePhase === 'day') return '白天'
      if (this.gamePhase === 'end') return '游戏结束'
      return ''
    },
    rolePreview() {
      const count = this.playerCount
      const roles = []
      
      if (count >= 6) {
        roles.push({ name: '狼人', icon: '🐺', count: Math.floor(count / 3) })
        roles.push({ name: '村民', icon: '👨‍🌾', count: Math.floor(count / 3) })
        roles.push({ name: '预言家', icon: '🔮', count: 1 })
        roles.push({ name: '女巫', icon: '🧙‍♀️', count: 1 })
      }
      if (count >= 8) {
        roles.push({ name: '猎人', icon: '🏹', count: 1 })
      }
      if (count >= 10) {
        roles[1].count += 1
      }
      
      return roles
    }
  },
  methods: {
    startGame() {
      this.players = []
      const roleList = this.generateRoles()
      
      for (let i = 0; i < this.playerCount; i++) {
        this.players.push({
          id: i,
          avatar: ['👨', '👩', '👴', '👵', '👦', '👧', '🧑', '👱'][i % 8],
          role: roleList[i],
          dead: false,
          votes: 0
        })
      }
      
      this.currentRole = this.players[0].role
      this.gamePhase = 'role'
    },
    generateRoles() {
      const roles = []
      const preview = this.rolePreview
      
      preview.forEach(role => {
        for (let i = 0; i < role.count; i++) {
          roles.push(this.roles[role.name === '狼人' ? 'wolf' : 
                           role.name === '村民' ? 'villager' :
                           role.name === '预言家' ? 'seer' :
                           role.name === '女巫' ? 'witch' : 'hunter'])
        }
      })
      
      for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[roles[i], roles[j]] = [roles[j], roles[i]]
      }
      
      return roles
    },
    confirmRole() {
      this.gamePhase = 'night'
      this.nightAction = 'wolf'
    },
    selectPlayer(index) {
      if (this.players[index].dead) return
      this.selectedPlayer = index
    },
    confirmNightAction() {
      if (this.nightAction === 'wolf') {
        if (this.selectedPlayer !== null) {
          this.nightKillPlayer = this.selectedPlayer
          this.selectedPlayer = null
          this.nightAction = 'seer'
        }
      } else if (this.nightAction === 'seer') {
        this.nightAction = 'witch'
      } else if (this.nightAction === 'witch') {
        this.gamePhase = 'day'
        this.day = 1
        this.processNightResults()
      }
    },
    processNightResults() {
      if (this.nightKillPlayer !== null) {
        this.players[this.nightKillPlayer].dead = true
        this.announcement = `昨晚 ${this.nightKillPlayer + 1}号玩家死亡`
      } else {
        this.announcement = '昨晚是平安夜'
      }
      
      this.checkGameEnd()
    },
    sendDiscussion() {
      if (!this.discussionInput.trim()) return
      this.discussionMessages.push({
        player: `${Math.floor(Math.random() * this.playerCount) + 1}号`,
        text: this.discussionInput
      })
      this.discussionInput = ''
    },
    confirmVote() {
      if (this.votePlayer === null) return
      
      this.players.forEach(p => p.votes = 0)
      for (let i = 0; i < this.playerCount; i++) {
        if (!this.players[i].dead) {
          const randomVote = Math.floor(Math.random() * this.playerCount)
          if (!this.players[randomVote].dead) {
            this.players[randomVote].votes++
          }
        }
      }
      
      this.players[this.votePlayer].votes++
      
      const maxVotes = Math.max(...this.players.map(p => p.votes))
      const votedOut = this.players.find(p => p.votes === maxVotes && !p.dead)
      
      if (votedOut) {
        votedOut.dead = true
        this.announcement += `，${votedOut.id + 1}号玩家被投票出局`
      }
      
      this.votePlayer = null
      this.gamePhase = 'night'
      this.nightAction = 'wolf'
      this.day++
    },
    checkGameEnd() {
      const aliveWolves = this.players.filter(p => !p.dead && p.role.name === '狼人').length
      const aliveVillagers = this.players.filter(p => !p.dead && p.role.name !== '狼人').length
      
      if (aliveWolves === 0) {
        this.winner = 'villager'
        this.gamePhase = 'end'
      } else if (aliveWolves >= aliveVillagers) {
        this.winner = 'wolf'
        this.gamePhase = 'end'
      }
    },
    restartGame() {
      this.gamePhase = 'setup'
      this.day = 1
      this.players = []
      this.currentRole = null
      this.showRole = false
      this.nightAction = 'wolf'
      this.selectedPlayer = null
      this.votePlayer = null
      this.nightKillPlayer = null
      this.witchHasAntidote = true
      this.witchHasPoison = true
      this.announcement = ''
      this.discussionMessages = []
      this.winner = null
    }
  }
}
</script>

<style scoped>
.werewolf-game {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

.game-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-header h3 {
  margin: 0;
  font-size: 20px;
}

.game-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.day-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.phase {
  color: #ffd700;
}

.game-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.game-phase {
  max-width: 600px;
  margin: 0 auto;
}

.setup-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.setup-panel h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.player-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.number-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  width: 80px;
  font-size: 16px;
}

.role-preview {
  margin-bottom: 24px;
}

.role-preview h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #aaa;
}

.role-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.role-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-icon {
  font-size: 20px;
}

.role-name {
  flex: 1;
  font-size: 14px;
}

.role-count {
  color: #ffd700;
  font-weight: 600;
}

.start-btn,
.confirm-btn,
.restart-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border: none;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.start-btn:hover,
.confirm-btn:hover,
.restart-btn:hover {
  transform: scale(1.02);
}

.role-panel {
  text-align: center;
}

.role-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.role-card.revealed {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  box-shadow: 0 8px 32px rgba(155, 89, 182, 0.4);
}

.role-icon-large {
  font-size: 64px;
  margin-bottom: 16px;
}

.role-name-large {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.role-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.reveal-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  cursor: pointer;
  margin-right: 12px;
  transition: background 0.2s ease;
}

.reveal-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.night-panel {
  text-align: center;
}

.night-sky {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.moon {
  font-size: 64px;
  margin-bottom: 20px;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.star {
  position: absolute;
  font-size: 12px;
  animation: twinkle 2s infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.night-content h4 {
  margin: 0 0 16px 0;
  font-size: 20px;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.player-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.player-card:hover:not(.dead) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.player-card.selected {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.2);
}

.player-card.dead {
  opacity: 0.4;
  cursor: not-allowed;
}

.player-avatar {
  font-size: 32px;
  margin-bottom: 8px;
}

.player-number {
  font-size: 14px;
  font-weight: 600;
}

.vote-count {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
}

.action-btn,
.vote-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border: none;
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-btn:hover,
.vote-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.witch-potions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 20px 0;
}

.potion {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.potion.used {
  opacity: 0.4;
}

.potion .status {
  font-size: 12px;
  color: #aaa;
}

.kill-info {
  color: #e74c3c;
  font-size: 14px;
  margin: 16px 0;
}

.day-panel {
  text-align: center;
}

.day-sky {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 20px;
}

.sun {
  font-size: 64px;
}

.day-content h4 {
  margin: 0 0 16px 0;
  font-size: 20px;
}

.announcement {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 16px;
}

.discussion-area,
.voting-area {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: left;
}

.discussion-area h5,
.voting-area h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #ffd700;
}

.chat-messages {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.chat-message {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.player-name {
  color: #ffd700;
  font-weight: 600;
  margin-right: 8px;
}

.chat-input {
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.chat-input button {
  background: #667eea;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.end-panel {
  text-align: center;
}

.winner-announcement {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 20px;
}

.winner-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.winner-announcement h4 {
  margin: 0 0 8px 0;
  font-size: 28px;
}

.role-reveal {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.role-reveal h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #ffd700;
}

.all-roles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.player-role {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.player-role-name {
  flex: 1;
  font-weight: 600;
}

.player-status {
  color: #e74c3c;
}
</style>
