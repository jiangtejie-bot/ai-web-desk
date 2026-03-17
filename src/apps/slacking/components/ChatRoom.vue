<template>
  <div class="chat-room" ref="chatRoom">
    <vue-advanced-chat
      ref="chatComponent"
      :height="chatHeight"
      :current-user-id="currentUserId"
      :rooms="JSON.stringify(rooms)"
      :rooms-loaded="true"
      :messages="JSON.stringify(messages)"
      :messages-loaded="true"
      :text-messages="JSON.stringify(textMessages)"
      :room-id="roomId"
      :show-footer="true"
      :show-header="false"
      :show-send-icon="true"
      :show-rooms-list="false"
      :show-room-info="false"
      :show-user-names="true"
      :show-timestamp="true"
      :show-date="true"
      :show-reaction-emojis="false"
      :show-audio="false"
      :show-files="false"
      :show-new-messages-divider="false"
      :show-launcher="false"
      :show-message-status-icon="false"
      :show-avatar="true"
      :text-formatting="true"
      :link-options="JSON.stringify({ disabled: false, target: '_blank', rel: 'nofollow' })"
      @send-message="sendMessage($event.detail[0])"
      @fetch-messages="fetchMessages($event.detail[0])"
    />
  </div>
</template>

<script>
import { register } from 'vue-advanced-chat'
import { nextTick, onMounted } from 'vue'
register()

export default {
  name: 'ChatRoom',
  data() {
    const currentUser = localStorage.getItem('currentUser') || 'Guest'
    
    return {
      currentUserId: currentUser,
      currentUser: currentUser,
      roomId: 'slacking-room',
      chatHeight: '100%',
      textMessages: {
        TEXTAREA_PLACEHOLDER: '输入消息...',
        TEXTAREA_SEND_BUTTON: '发送'
      },
      rooms: [
        {
          roomId: 'slacking-room',
          roomName: '摸鱼群',
          avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=slacking',
          users: [
            { _id: currentUser, username: currentUser },
            { _id: 'felix', username: '摸鱼达人' },
            { _id: 'workaholic', username: '工作狂' },
            { _id: 'expert', username: '摸鱼专家' }
          ],
          unread: 0
        }
      ],
      messages: [
        {
          _id: 1,
          content: '今天天气不错，适合摸鱼！🎣',
          senderId: 'felix',
          username: '摸鱼达人',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          date: '今天',
          timestamp: '10:30',
          system: false,
          saved: true
        },
        {
          _id: 2,
          content: '别摸鱼了，赶紧干活！',
          senderId: 'workaholic',
          username: '工作狂',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
          date: '今天',
          timestamp: '10:35',
          system: false,
          saved: true
        },
        {
          _id: 3,
          content: '工作是为了更好地摸鱼！😎',
          senderId: 'felix',
          username: '摸鱼达人',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          date: '今天',
          timestamp: '10:36',
          system: false,
          saved: true
        },
        {
          _id: 4,
          content: '说得对！一起摸鱼吧！',
          senderId: currentUser,
          username: currentUser,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser}`,
          date: '今天',
          timestamp: '10:37',
          system: false,
          saved: true
        }
      ]
    }
  },

  mounted() {
    this.updateChatHeight()
    window.addEventListener('resize', this.updateChatHeight)
    
    if (this.$refs.chatRoom) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateChatHeight()
      })
      this.resizeObserver.observe(this.$refs.chatRoom)
    }

    this.$el.addEventListener('window-resize', this.handleWindowResize)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateChatHeight)
    if (this.resizeObserver && this.$refs.chatRoom) {
      this.resizeObserver.unobserve(this.$refs.chatRoom)
    }
    this.$el.removeEventListener('window-resize', this.handleWindowResize)
  },

  methods: {
    handleWindowResize(event) {
      if (event.detail && event.detail.height) {
        this.chatHeight = `${event.detail.height}px`
      }
    },

    updateChatHeight() {
      if (this.$refs.chatRoom) {
        const height = this.$refs.chatRoom.clientHeight
        this.chatHeight = `${height}px`
      }
    },

    fetchMessages({ options = {} }) {
      if (options.reset) {
        this.messages = this.addMessages(true)
      } else {
        this.messages = [...this.addMessages(), ...this.messages]
        this.messagesLoaded = true
      }
    },

    addMessages(reset) {
      const messages = []

      if (reset) {
        const initialMessages = [
          {
            _id: 1,
            content: '今天天气不错，适合摸鱼！🎣',
            senderId: 'felix',
            username: '摸鱼达人',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            date: '今天',
            timestamp: '10:30',
            system: false,
            saved: true
          },
          {
            _id: 2,
            content: '别摸鱼了，赶紧干活！',
            senderId: 'workaholic',
            username: '工作狂',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
            date: '今天',
            timestamp: '10:35',
            system: false,
            saved: true
          },
          {
            _id: 3,
            content: '工作是为了更好地摸鱼！😎',
            senderId: 'felix',
            username: '摸鱼达人',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            date: '今天',
            timestamp: '10:36',
            system: false,
            saved: true
          },
          {
            _id: 4,
            content: '说得对！一起摸鱼吧！',
            senderId: this.currentUser,
            username: this.currentUser,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.currentUser}`,
            date: '今天',
            timestamp: '10:37',
            system: false,
            saved: true
          }
        ]
        messages.push(...initialMessages)
      } else {
        for (let i = 0; i < 10; i++) {
          messages.push({
            _id: this.messages.length + i,
            content: `历史消息 ${i + 1}`,
            senderId: 'felix',
            username: '摸鱼达人',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            date: '昨天',
            timestamp: '09:00',
            system: false,
            saved: true
          })
        }
      }

      return messages
    },

    sendMessage(message) {
      const newMessage = {
        _id: Date.now(),
        content: message.content,
        senderId: this.currentUserId,
        username: this.currentUser,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.currentUser}`,
        timestamp: new Date().toString().substring(16, 21),
        date: new Date().toDateString(),
        system: false,
        distributed: true
      }
      
      this.messages = [
        ...this.messages,
        newMessage
      ]

      nextTick(() => {
        this.scrollToBottom()
      })

      setTimeout(() => {
        this.receiveAutoReply()
      }, 1000 + Math.random() * 2000)
    },

    receiveAutoReply() {
      const replies = [
        { content: '哈哈，说得对！', senderId: 'felix', username: '摸鱼达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
        { content: '摸鱼万岁！🎉', senderId: 'expert', username: '摸鱼专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        { content: '老板来了，快假装工作！', senderId: 'workaholic', username: '工作狂', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
        { content: '今天摸鱼了吗？', senderId: 'felix', username: '摸鱼达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
        { content: '工作是为了更好地摸鱼！', senderId: 'expert', username: '摸鱼专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        { content: '摸鱼也是一种工作态度！', senderId: 'felix', username: '摸鱼达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
        { content: '摸鱼使我快乐！', senderId: 'expert', username: '摸鱼专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        { content: '摸鱼使我进步！', senderId: 'felix', username: '摸鱼达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }
      ]
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)]
      
      this.messages = [
        ...this.messages,
        {
          _id: Date.now(),
          content: randomReply.content,
          senderId: randomReply.senderId,
          username: randomReply.username,
          avatar: randomReply.avatar,
          timestamp: new Date().toString().substring(16, 21),
          date: new Date().toDateString(),
          system: false
        }
      ]

      nextTick(() => {
        this.scrollToBottom()
      })
    },

    scrollToBottom() {
      try {
        const chatElement = this.$refs.chatComponent
        if (chatElement) {
          const messagesContainer = chatElement.shadowRoot?.querySelector('.vac-room-messages')
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
          }
        }
      } catch (error) {
        console.error('Failed to scroll to bottom:', error)
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
  width: 100%;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
}

.chat-room :deep(.vac-room-container) {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.chat-room :deep(.vac-room-messages) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  overflow-x: hidden;
}

.chat-room :deep(.vac-room-footer) {
  flex-shrink: 0;
  flex-grow: 0;
  position: relative;
  z-index: 10;
}

.chat-room :deep(.vac-box-footer) {
  flex-shrink: 0;
  flex-grow: 0;
}

.chat-room :deep(.vac-message-container) {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.chat-room :deep(.vac-avatar) {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  align-self: flex-start;
}

.chat-room :deep(.vac-avatar img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-room :deep(.vac-message-box) {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin-left: 12px;
  align-self: flex-start;
}

.chat-room :deep(.vac-message-box.vac-message-current) {
  flex-direction: row-reverse;
  margin-left: 0;
  margin-right: 12px;
  align-self: flex-end;
}

.chat-room :deep(.vac-message-box.vac-message-current .vac-avatar) {
  margin-left: 12px;
  margin-right: 0;
}

.chat-room :deep(.vac-message-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  min-height: 20px;
}

.chat-room :deep(.vac-message-header .vac-message-username) {
  font-weight: 600;
  color: #333;
}

.chat-room :deep(.vac-message-header .vac-message-time) {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.chat-room :deep(.vac-message-box.vac-message-current .vac-message-header) {
  flex-direction: row-reverse;
}

.chat-room :deep(.vac-message-box.vac-message-current .vac-message-header .vac-message-username) {
  color: #667eea;
}

.chat-room :deep(.vac-message-content) {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 12px 12px 12px 0;
}

.chat-room :deep(.vac-message-box.vac-message-current .vac-message-content) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 12px;
}

.chat-room :deep(.vac-message-box .vac-avatar) {
  align-self: flex-start;
}

.chat-room :deep(.vac-message-box.vac-message-current .vac-avatar) {
  align-self: flex-start;
}
</style>
