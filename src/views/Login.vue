<template>
  <div class="lock-screen">
    <div class="lock-background"></div>
    <div class="lock-content">
      <div class="lock-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h1 class="lock-title">欢迎使用 AI Web Desk</h1>
      <p class="lock-subtitle">请输入您的账户名称和密码登录</p>
      
      <div class="login-form">
        <div class="input-group">
          <input 
            v-model="username" 
            type="text" 
            placeholder="账户名称"
            class="username-input"
            @keyup.enter="handleLogin"
            ref="usernameInput"
          />
        </div>
        <div class="input-group">
          <input 
            v-model="password" 
            type="password" 
            placeholder="密码"
            class="username-input"
            @keyup.enter="handleLogin"
          />
        </div>
        <button class="login-btn" @click="handleLogin" :disabled="!username.trim() || !password">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 12 19"/>
          </svg>
          登录
        </button>
      </div>
      
      <p class="lock-footer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 4v2a15.3 15.3 0 0 1-4 4v-2a15.3 15.3 0 0 1 4-4z"/>
        </svg>
        AI Web Desk
      </p>
    </div>
    
    <!-- 错误弹框 -->
    <ConfirmDialog
      v-if="showErrorDialog"
      title="登录失败"
      :message="errorMessage"
      type="danger"
      confirm-text="确定"
      @confirm="showErrorDialog = false"
    />
  </div>
</template>

<script>
import { storage } from '../utils/crypto'
import ConfirmDialog from '../components/ConfirmDialog.vue'

export default {
  name: 'LoginPage',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      username: '',
      password: '',
      showErrorDialog: false,
      errorMessage: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.usernameInput) {
        this.$refs.usernameInput.focus()
      }
    })
  },
  methods: {
    handleLogin() {
      if (!this.username.trim() || !this.password) return
      
      // 密码验证，暂时写死为 12138
      if (this.password !== '12138') {
        this.errorMessage = '密码错误，请输入 12138'
        this.showErrorDialog = true
        return
      }
      
      storage.setItem('currentUser', this.username.trim())
      storage.setItem('isLoggedIn', true)
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.lock-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lock-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.lock-content {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.lock-icon svg {
  width: 40px;
  height: 40px;
}

.lock-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.lock-subtitle {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 0 0 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  position: relative;
}

.username-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.username-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.username-input::placeholder {
  color: #999;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.login-btn svg {
  width: 20px;
  height: 20px;
}

.lock-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  font-size: 14px;
  color: #999;
}

.lock-footer svg {
  width: 18px;
  height: 18px;
}
</style>