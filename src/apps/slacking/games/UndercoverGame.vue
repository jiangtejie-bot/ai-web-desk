<template>
  <div class="undercover-game">
    <div class="game-header">
      <h3>🕵️ 谁是卧底</h3>
      <div class="game-info">
        <span class="round-count">第 {{ round }} 轮</span>
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
              min="4" 
              max="10"
              class="number-input"
            />
          </div>
          <div class="category-select">
            <label>词语类别：</label>
            <select v-model="selectedCategory" class="category-input">
              <option value="all">全部</option>
              <option value="food">美食</option>
              <option value="animal">动物</option>
              <option value="item">物品</option>
              <option value="place">地点</option>
            </select>
          </div>
          <button class="start-btn" @click="startGame">开始游戏</button>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'view'">
        <div class="view-panel">
          <h4>查看你的词语</h4>
          <div class="word-card" :class="{ revealed: showWord }">
            <div class="word-card-inner">
              <div class="word-icon">{{ showWord ? '📝' : '❓' }}</div>
              <div class="word-text">{{ showWord ? currentWord : '???' }}</div>
            </div>
          </div>
          <button class="reveal-btn" @click="showWord = !showWord">
            {{ showWord ? '隐藏词语' : '查看词语' }}
          </button>
          <button class="confirm-btn" @click="confirmWord">确认词语</button>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'describe'">
        <div class="describe-panel">
          <h4>🗣️ 描述环节</h4>
          <p>请用一句话描述你的词语，不要直接说出词语本身</p>
          
          <div class="player-list">
            <div 
              v-for="(player, index) in players" 
              :key="index"
              class="player-item"
              :class="{ 
                current: currentPlayer === index,
                described: player.described,
                eliminated: player.eliminated
              }"
            >
              <div class="player-avatar">{{ player.avatar }}</div>
              <div class="player-info">
                <span class="player-number">{{ index + 1 }}号</span>
                <span class="player-status" v-if="player.described">已描述</span>
              </div>
              <button 
                v-if="currentPlayer === index && !player.described"
                class="describe-btn"
                @click="describePlayer(index)"
              >
                描述
              </button>
            </div>
          </div>

          <div class="description-input" v-if="showDescriptionInput">
            <input 
              v-model="descriptionText" 
              placeholder="输入你的描述..."
              @keypress.enter="submitDescription"
              class="description-field"
            />
            <button class="submit-btn" @click="submitDescription">提交</button>
          </div>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'vote'">
        <div class="vote-panel">
          <h4>🗳️ 投票环节</h4>
          <p>根据大家的描述，投票选出你认为的卧底</p>
          
          <div class="descriptions-list">
            <h5>描述汇总：</h5>
            <div 
              v-for="(player, index) in players" 
              :key="index"
              v-if="player.described && !player.eliminated"
              class="description-item"
            >
              <span class="player-number">{{ index + 1 }}号：</span>
              <span class="description-text">{{ player.description }}</span>
            </div>
          </div>

          <div class="vote-grid">
            <div 
              v-for="(player, index) in players" 
              :key="index"
              class="vote-card"
              :class="{ 
                selected: votePlayer === index,
                eliminated: player.eliminated
              }"
              @click="selectVote(index)"
            >
              <div class="player-avatar">{{ player.avatar }}</div>
              <div class="player-number">{{ index + 1 }}号</div>
              <div class="vote-count" v-if="player.votes > 0">{{ player.votes }}票</div>
            </div>
          </div>

          <button class="vote-btn" @click="confirmVote" :disabled="votePlayer === null">
            确认投票
          </button>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'reveal'">
        <div class="reveal-panel">
          <h4>🎭 揭晓环节</h4>
          <div class="eliminated-info">
            <div class="eliminated-player">
              <div class="player-avatar-large">{{ players[eliminatedPlayer].avatar }}</div>
              <div class="player-number-large">{{ eliminatedPlayer + 1 }}号玩家</div>
              <div class="player-word">词语：{{ players[eliminatedPlayer].word }}</div>
              <div class="player-role" :class="players[eliminatedPlayer].isUndercover ? 'undercover' : 'civilian'">
                {{ players[eliminatedPlayer].isUndercover ? '🕵️ 卧底' : '👤 平民' }}
              </div>
            </div>
          </div>

          <div class="result-message">
            <div v-if="players[eliminatedPlayer].isUndercover" class="success">
              🎉 恭喜！成功找出卧底！
            </div>
            <div v-else class="failure">
              😢 很遗憾，投错了！
            </div>
          </div>

          <div class="continue-options">
            <button class="continue-btn" @click="nextRound" v-if="!gameOver">
              继续下一轮
            </button>
            <button class="end-btn" @click="endGame">
              结束游戏
            </button>
          </div>
        </div>
      </div>

      <div class="game-phase" v-if="gamePhase === 'end'">
        <div class="end-panel">
          <div class="winner-announcement">
            <div class="winner-icon">{{ winner === 'undercover' ? '🕵️' : '👥' }}</div>
            <h4>{{ winner === 'undercover' ? '卧底胜利！' : '平民胜利！' }}</h4>
            <p>{{ winner === 'undercover' ? '卧底成功隐藏到了最后' : '平民成功找出了卧底' }}</p>
          </div>
          <div class="all-words">
            <h5>词语揭晓</h5>
            <div class="word-list">
              <div v-for="(player, index) in players" :key="index" class="word-item">
                <span class="player-avatar">{{ player.avatar }}</span>
                <span class="player-number">{{ index + 1 }}号</span>
                <span class="player-word">{{ player.word }}</span>
                <span class="player-role" :class="player.isUndercover ? 'undercover' : 'civilian'">
                  {{ player.isUndercover ? '卧底' : '平民' }}
                </span>
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
  name: 'UndercoverGame',
  data() {
    return {
      gamePhase: 'setup',
      playerCount: 6,
      round: 1,
      players: [],
      currentPlayer: 0,
      currentWord: '',
      showWord: false,
      selectedCategory: 'all',
      descriptionText: '',
      showDescriptionInput: false,
      votePlayer: null,
      eliminatedPlayer: null,
      gameOver: false,
      winner: null,
      wordPairs: {
        food: [
          { common: '汉堡包', special: '肉夹馍' },
          { common: '火锅', special: '麻辣烫' },
          { common: '饺子', special: '包子' },
          { common: '面条', special: '米粉' },
          { common: '蛋糕', special: '面包' },
          { common: '可乐', special: '雪碧' },
          { common: '咖啡', special: '奶茶' },
          { common: '披萨', special: '意面' }
        ],
        animal: [
          { common: '老虎', special: '狮子' },
          { common: '猫', special: '狗' },
          { common: '兔子', special: '松鼠' },
          { common: '大象', special: '犀牛' },
          { common: '企鹅', special: '海豚' },
          { common: '蝴蝶', special: '蜜蜂' },
          { common: '蛇', special: '蜥蜴' },
          { common: '鹰', special: '隼' }
        ],
        item: [
          { common: '手机', special: '平板' },
          { common: '手表', special: '闹钟' },
          { common: '雨伞', special: '雨衣' },
          { common: '眼镜', special: '墨镜' },
          { common: '书包', special: '背包' },
          { common: '钱包', special: '卡包' },
          { common: '钥匙', special: '门卡' },
          { common: '耳机', special: '音响' }
        ],
        place: [
          { common: '学校', special: '培训机构' },
          { common: '医院', special: '诊所' },
          { common: '超市', special: '便利店' },
          { common: '公园', special: '广场' },
          { common: '电影院', special: '剧院' },
          { common: '图书馆', special: '书店' },
          { common: '健身房', special: '游泳馆' },
          { common: '咖啡厅', special: '茶馆' }
        ]
      }
    }
  },
  computed: {
    phaseText() {
      if (this.gamePhase === 'setup') return '准备阶段'
      if (this.gamePhase === 'view') return '查看词语'
      if (this.gamePhase === 'describe') return '描述环节'
      if (this.gamePhase === 'vote') return '投票环节'
      if (this.gamePhase === 'reveal') return '揭晓环节'
      if (this.gamePhase === 'end') return '游戏结束'
      return ''
    }
  },
  methods: {
    startGame() {
      this.players = []
      const wordPair = this.getRandomWordPair()
      const undercoverIndex = Math.floor(Math.random() * this.playerCount)
      
      for (let i = 0; i < this.playerCount; i++) {
        this.players.push({
          id: i,
          avatar: ['👨', '👩', '👴', '👵', '👦', '👧', '🧑', '👱'][i % 8],
          word: i === undercoverIndex ? wordPair.special : wordPair.common,
          isUndercover: i === undercoverIndex,
          described: false,
          eliminated: false,
          description: '',
          votes: 0
        })
      }
      
      this.currentWord = this.players[0].word
      this.gamePhase = 'view'
    },
    getRandomWordPair() {
      let pairs = []
      
      if (this.selectedCategory === 'all') {
        Object.values(this.wordPairs).forEach(categoryPairs => {
          pairs = pairs.concat(categoryPairs)
        })
      } else {
        pairs = this.wordPairs[this.selectedCategory]
      }
      
      return pairs[Math.floor(Math.random() * pairs.length)]
    },
    confirmWord() {
      this.gamePhase = 'describe'
      this.currentPlayer = 0
    },
    describePlayer(index) {
      this.showDescriptionInput = true
    },
    submitDescription() {
      if (!this.descriptionText.trim()) return
      
      this.players[this.currentPlayer].description = this.descriptionText
      this.players[this.currentPlayer].described = true
      this.descriptionText = ''
      this.showDescriptionInput = false
      
      this.nextPlayer()
    },
    nextPlayer() {
      const remainingPlayers = this.players.filter(p => !p.described && !p.eliminated)
      
      if (remainingPlayers.length === 0) {
        this.gamePhase = 'vote'
        return
      }
      
      const nextIndex = this.players.findIndex(p => !p.described && !p.eliminated)
      this.currentPlayer = nextIndex
      this.currentWord = this.players[nextIndex].word
    },
    selectVote(index) {
      if (this.players[index].eliminated) return
      this.votePlayer = index
    },
    confirmVote() {
      if (this.votePlayer === null) return
      
      this.players.forEach(p => p.votes = 0)
      
      for (let i = 0; i < this.playerCount; i++) {
        if (!this.players[i].eliminated) {
          const randomVote = Math.floor(Math.random() * this.playerCount)
          if (!this.players[randomVote].eliminated) {
            this.players[randomVote].votes++
          }
        }
      }
      
      this.players[this.votePlayer].votes++
      
      const maxVotes = Math.max(...this.players.map(p => p.votes))
      const votedOut = this.players.find(p => p.votes === maxVotes && !p.eliminated)
      
      if (votedOut) {
        this.eliminatedPlayer = votedOut.id
        votedOut.eliminated = true
        this.gamePhase = 'reveal'
        
        if (votedOut.isUndercover) {
          this.winner = 'civilian'
          this.gameOver = true
        } else {
          this.checkGameEnd()
        }
      }
      
      this.votePlayer = null
    },
    checkGameEnd() {
      const aliveUndercover = this.players.filter(p => !p.eliminated && p.isUndercover).length
      const aliveCivilians = this.players.filter(p => !p.eliminated && !p.isUndercover).length
      
      if (aliveUndercover === 0) {
        this.winner = 'civilian'
        this.gameOver = true
      } else if (aliveUndercover >= aliveCivilians) {
        this.winner = 'undercover'
        this.gameOver = true
      }
    },
    nextRound() {
      this.round++
      this.players.forEach(p => {
        p.described = false
        p.description = ''
        p.votes = 0
      })
      this.currentPlayer = 0
      this.eliminatedPlayer = null
      this.gamePhase = 'describe'
      
      const nextPlayer = this.players.find(p => !p.eliminated)
      if (nextPlayer) {
        this.currentPlayer = nextPlayer.id
        this.currentWord = nextPlayer.word
      }
    },
    endGame() {
      this.gamePhase = 'end'
    },
    restartGame() {
      this.gamePhase = 'setup'
      this.round = 1
      this.players = []
      this.currentPlayer = 0
      this.currentWord = ''
      this.showWord = false
      this.descriptionText = ''
      this.showDescriptionInput = false
      this.votePlayer = null
      this.eliminatedPlayer = null
      this.gameOver = false
      this.winner = null
    }
  }
}
</script>

<style scoped>
.undercover-game {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.game-header {
  background: rgba(0, 0, 0, 0.2);
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

.round-count {
  background: rgba(255, 255, 255, 0.2);
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

.player-input,
.category-select {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.number-input,
.category-input {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 16px;
}

.category-input {
  flex: 1;
}

.start-btn,
.restart-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.start-btn:hover,
.restart-btn:hover {
  transform: scale(1.02);
}

.view-panel {
  text-align: center;
}

.word-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.word-card.revealed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(240, 147, 251, 0.4);
}

.word-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.word-text {
  font-size: 32px;
  font-weight: 600;
}

.reveal-btn,
.confirm-btn,
.continue-btn,
.end-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  cursor: pointer;
  margin-right: 12px;
  transition: background 0.2s ease;
}

.reveal-btn:hover,
.confirm-btn:hover,
.continue-btn:hover,
.end-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.describe-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.describe-panel h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.describe-panel > p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.player-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.player-item.current {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #ffd700;
}

.player-item.described {
  opacity: 0.6;
}

.player-item.eliminated {
  opacity: 0.3;
  text-decoration: line-through;
}

.player-avatar {
  font-size: 32px;
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-number {
  font-weight: 600;
}

.player-status {
  font-size: 12px;
  color: #ffd700;
}

.describe-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.description-input {
  display: flex;
  gap: 8px;
}

.description-field {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.submit-btn {
  background: #667eea;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.vote-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.vote-panel h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.vote-panel > p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.descriptions-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.descriptions-list h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #ffd700;
}

.description-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
}

.description-item:last-child {
  border-bottom: none;
}

.player-number {
  font-weight: 600;
  margin-right: 8px;
}

.description-text {
  color: rgba(255, 255, 255, 0.9);
}

.vote-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.vote-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  text-align: center;
}

.vote-card:hover:not(.eliminated) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.vote-card.selected {
  border-color: #f5576c;
  background: rgba(245, 87, 108, 0.2);
}

.vote-card.eliminated {
  opacity: 0.3;
  cursor: not-allowed;
}

.vote-card .player-avatar {
  font-size: 28px;
  margin-bottom: 8px;
}

.vote-count {
  color: #f5576c;
  font-size: 12px;
  margin-top: 4px;
}

.vote-btn {
  width: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.vote-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reveal-panel {
  text-align: center;
}

.reveal-panel h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.eliminated-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 20px;
}

.player-avatar-large {
  font-size: 64px;
  margin-bottom: 12px;
}

.player-number-large {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.player-word {
  font-size: 24px;
  margin-bottom: 12px;
}

.player-role {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
}

.player-role.undercover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.player-role.civilian {
  background: rgba(255, 255, 255, 0.2);
}

.result-message {
  margin-bottom: 20px;
}

.success {
  background: rgba(46, 204, 113, 0.2);
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
}

.failure {
  background: rgba(231, 76, 60, 0.2);
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
}

.continue-options {
  display: flex;
  gap: 12px;
}

.continue-btn,
.end-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
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

.all-words {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.all-words h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #ffd700;
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.word-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.word-item .player-avatar {
  font-size: 24px;
}

.word-item .player-word {
  flex: 1;
  font-weight: 600;
}

.word-item .player-role {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
</style>
