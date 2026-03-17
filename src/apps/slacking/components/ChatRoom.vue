<template>
  <div class="chat-room">
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        class="message"
        :class="{ 'own-message': message.isOwn }"
      >
        <div class="message-avatar">
          <img :src="message.avatar" :alt="message.name" />
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-name">{{ message.name }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>
          <div class="message-text">{{ message.text }}</div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="input-actions">
        <button class="action-btn" title="表情">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>
        <button class="action-btn" title="图片">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
        <button class="action-btn" title="文件">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
        </button>
      </div>
      <div class="input-wrapper">
        <input 
          v-model="inputText" 
          @keypress.enter="sendMessage"
          placeholder="输入消息..."
          class="message-input"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatRoom',
  data() {
    return {
      inputText: '',
      messages: [
        {
          name: '摸鱼达人',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          text: '今天天气不错，适合摸鱼！🎣',
          time: '10:30',
          isOwn: false
        },
        {
          name: '工作狂',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
          text: '别摸鱼了，赶紧干活！',
          time: '10:32',
          isOwn: false
        },
        {
          name: '摸鱼达人',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          text: '工作是为了更好地摸鱼！😎',
          time: '10:33',
          isOwn: false
        },
        {
          name: '我',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
          text: '说得对！一起摸鱼吧！',
          time: '10:35',
          isOwn: true
        }
      ]
    }
  },
  mounted() {
    this.scrollToBottom()
  },
  methods: {
    sendMessage() {
      if (!this.inputText.trim()) return

      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      this.messages.push({
        name: '我',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
        text: this.inputText,
        time: time,
        isOwn: true
      })

      this.inputText = ''
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      setTimeout(() => {
        this.receiveAutoReply()
      }, 1000 + Math.random() * 2000)
    },
    receiveAutoReply() {
      const replies = [
        '哈哈，说得对！',
        '摸鱼万岁！🎉',
        '老板来了，快假装工作！',
        '今天摸鱼了吗？',
        '工作是为了更好地摸鱼！',
        '摸鱼也是一种工作态度！',
        '摸鱼使我快乐！',
        '摸鱼使我进步！'
      ]
      
      const names = ['摸鱼达人', '工作狂', '摸鱼小能手', '摸鱼专家']
      const avatars = ['Felix', 'Aneka', 'Bob', 'Charlie']
      
      const randomIndex = Math.floor(Math.random() * replies.length)
      const nameIndex = Math.floor(Math.random() * names.length)
      
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      this.messages.push({
        name: names[nameIndex],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatars[nameIndex]}`,
        text: replies[randomIndex],
        time: time,
        isOwn: false
      })

      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 70%;
}

.message.own-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.message.own-message .message-header {
  flex-direction: row-reverse;
}

.message-name {
  font-weight: 600;
  color: #333;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.own-message .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 12px;
}

.message:not(.own-message) .message-text {
  border-radius: 12px 12px 12px 0;
}

.chat-input-area {
  background: white;
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
  color: #666;
}

.action-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.message-input:focus {
  border-color: #667eea;
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
  transform: translateX(2px);
}
</style>
