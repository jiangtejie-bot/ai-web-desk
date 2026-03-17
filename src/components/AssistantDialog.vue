<template>
  <div class="assistant-overlay" @click="$emit('close')">
    <div class="assistant-dialog" @click.stop>
      <div class="dialog-header">
        <div class="dialog-title">
          <svg class="assistant-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
            <path d="M12 10c-3.3 0-6 2.7-6 6v4h12v-4c0-3.3-2.7-6-6-6z"/>
            <path d="M19 10v-2c0-3.9-3.1-7-7-7s-7 3.1-7 7v2"/>
            <path d="M12 18v4"/>
            <path d="M8 22h8"/>
          </svg>
          <span>智能助手</span>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="1" y1="1" x2="15" y2="15"/>
            <line x1="1" y1="15" x2="15" y2="1"/>
          </svg>
        </button>
      </div>

      <div class="dialog-content" ref="chatContainer">
        <div class="chat-messages">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-avatar">
              <svg v-if="message.role === 'assistant'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
                <path d="M12 10c-3.3 0-6 2.7-6 6v4h12v-4c0-3.3-2.7-6-6-6z"/>
                <path d="M19 10v-2c0-3.9-3.1-7-7-7s-7 3.1-7 7v2"/>
                <path d="M12 18v4"/>
                <path d="M8 22h8"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>

          <div v-if="isTyping" class="message assistant typing">
            <div class="message-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
                <path d="M12 10c-3.3 0-6 2.7-6 6v4h12v-4c0-3.3-2.7-6-6-6z"/>
                <path d="M19 10v-2c0-3.9-3.1-7-7-7s-7 3.1-7 7v2"/>
                <path d="M12 18v4"/>
                <path d="M8 22h8"/>
              </svg>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <div class="input-container">
          <input 
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="输入消息..."
            class="message-input"
          />
          <button 
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isSending"
            class="send-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getConfig } from '../config/pageagent.js'

export default {
  name: 'AssistantDialog',
  data() {
    return {
      messages: [
        {
          role: 'assistant',
          content: '你好！我是智能助手，有什么可以帮助你的吗？',
          time: this.getCurrentTime()
        }
      ],
      inputMessage: '',
      isTyping: false,
      isSending: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  },
  methods: {
    getCurrentTime() {
      const now = new Date()
      return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    },
    scrollToBottom() {
      const container = this.$refs.chatContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isSending) return

      const userMessage = this.inputMessage.trim()
      this.messages.push({
        role: 'user',
        content: userMessage,
        time: this.getCurrentTime()
      })

      this.inputMessage = ''
      this.isSending = true
      this.isTyping = true

      this.$nextTick(() => {
        this.scrollToBottom()
      })

      try {
        const config = getConfig()
        const response = await this.callAI(userMessage, config)
        
        this.isTyping = false
        this.messages.push({
          role: 'assistant',
          content: response,
          time: this.getCurrentTime()
        })

        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        this.isTyping = false
        this.messages.push({
          role: 'assistant',
          content: '抱歉，我遇到了一些问题：' + error.message,
          time: this.getCurrentTime()
        })

        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }

      this.isSending = false
    },
    async callAI(message, config) {
      try {
        const response = await fetch(config.baseURL + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: '你是一个智能助手，帮助用户解答问题和提供建议。' },
              ...this.messages.map(m => ({
                role: m.role,
                content: m.content
              }))
            ]
          })
        })

        if (!response.ok) {
          throw new Error('API 请求失败')
        }

        const data = await response.json()
        return data.choices[0].message.content
      } catch (error) {
        console.error('AI 调用失败:', error)
        throw new Error('无法连接到 AI 服务，请检查配置。')
      }
    }
  }
}
</script>

<style scoped>
.assistant-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.assistant-dialog {
  width: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.assistant-icon {
  width: 20px;
  height: 20px;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn svg {
  width: 14px;
  height: 14px;
  color: white;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9f9f9;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #3b82f6;
}

.message-avatar svg {
  width: 18px;
  height: 18px;
  color: white;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-text {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.message.assistant .message-text {
  background: white;
  border: 1px solid #e0e0e0;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-time {
  font-size: 11px;
  color: #999;
  padding: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

.message.typing {
  align-items: center;
}

.typing-indicator {
  padding: 10px 14px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}

.dialog-footer {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.input-container {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
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
  width: 18px;
  height: 18px;
  color: white;
}
</style>
