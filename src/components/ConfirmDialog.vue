<template>
  <div class="confirm-dialog-overlay" @click.self="$emit('cancel')">
    <div class="confirm-dialog">
      <div class="confirm-dialog-header">
        <div class="confirm-dialog-icon" :class="iconClass">
          <svg v-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else-if="type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <svg v-else-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
      </div>
      
      <div class="confirm-dialog-body">
        <h3 class="confirm-dialog-title">{{ title }}</h3>
        <p class="confirm-dialog-message">{{ message }}</p>
      </div>
      
      <div class="confirm-dialog-footer">
        <button class="confirm-dialog-btn cancel" @click="$emit('cancel')">
          {{ cancelText }}
        </button>
        <button class="confirm-dialog-btn confirm" :class="confirmClass" @click="$emit('confirm')">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    title: {
      type: String,
      default: '确认操作'
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'warning',
      validator: (value) => ['warning', 'info', 'success', 'danger'].includes(value)
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  computed: {
    iconClass() {
      return `icon-${this.type}`
    },
    confirmClass() {
      return `btn-${this.type}`
    }
  }
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.confirm-dialog-header {
  display: flex;
  justify-content: center;
  padding: 24px 24px 0;
}

.confirm-dialog-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog-icon svg {
  width: 28px;
  height: 28px;
}

.icon-warning {
  background: linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%);
  color: white;
}

.icon-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.icon-success {
  background: linear-gradient(135deg, #28c840 0%, #1ea632 100%);
  color: white;
}

.icon-danger {
  background: linear-gradient(135deg, #ff5f57 0%, #ff3b30 100%);
  color: white;
}

.confirm-dialog-body {
  padding: 20px 24px 24px;
  text-align: center;
}

.confirm-dialog-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.confirm-dialog-message {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.confirm-dialog-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.confirm-dialog-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.confirm-dialog-btn.cancel {
  background: #f5f5f7;
  color: #1a1a1a;
}

.confirm-dialog-btn.cancel:hover {
  background: #e8e8ed;
}

.confirm-dialog-btn.confirm {
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
}

.btn-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #28c840 0%, #1ea632 100%);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 200, 64, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #ff5f57 0%, #ff3b30 100%);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 95, 87, 0.3);
}
</style>
