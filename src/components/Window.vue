<template>
  <div 
    class="window"
    :class="{ minimized, maximized }"
    :style="maximized ? { zIndex } : { 
      zIndex,
      width: width + 'px',
      height: height + 'px'
    }"
    @mousedown="$emit('mousedown')"
  >
    <div class="window-header" @mousedown="startDrag">
      <div class="window-controls">
        <button class="control-btn close" @click.stop="$emit('close')">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="1" y1="1" x2="11" y2="11"/>
            <line x1="1" y1="11" x2="11" y2="1"/>
          </svg>
        </button>
        <button class="control-btn minimize" @click.stop="$emit('minimize')">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="1" y1="6" x2="11" y2="6"/>
          </svg>
        </button>
        <button class="control-btn maximize" @click.stop="$emit('maximize')">
          <svg v-if="!maximized" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="1" width="10" height="10"/>
          </svg>
          <svg v-else viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="2" width="8" height="8"/>
            <rect x="4" y="4" width="8" height="8"/>
          </svg>
        </button>
      </div>
      <div class="window-title">
        <span>{{ title }}</span>
      </div>
      <div class="window-spacer"></div>
    </div>
    
    <div class="window-content">
      <slot></slot>
    </div>
    
    <div class="resize-handle" @mousedown="startResize"></div>
  </div>
</template>

<script>
export default {
  name: 'Window',
  props: {
    title: {
      type: String,
      default: 'Window'
    },
    minimized: {
      type: Boolean,
      default: false
    },
    maximized: {
      type: Boolean,
      default: false
    },
    zIndex: {
      type: Number,
      default: 100
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    }
  },
  data() {
    return {
      isDragging: false,
      isResizing: false,
      dragOffset: { x: 0, y: 0 },
      resizeStart: { x: 0, y: 0, width: 0, height: 0 },
      dragPosition: { x: 0, y: 0 },
      resizeSize: { width: 0, height: 0 },
      animationFrameId: null
    }
  },
  methods: {
    startDrag(event) {
      if (event.target.closest('.window-controls')) return
      
      this.isDragging = true
      
      const style = window.getComputedStyle(this.$el)
      const rect = this.$el.getBoundingClientRect()
      
      const currentLeft = parseFloat(style.left) || 0
      const currentTop = parseFloat(style.top) || 0
      
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      
      this.dragPosition = {
        x: currentLeft,
        y: currentTop
      }
      
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)
    },
    onDrag(event) {
      if (!this.isDragging || this.maximized) return
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      
      this.animationFrameId = requestAnimationFrame(() => {
        const x = event.clientX - this.dragOffset.x
        const y = event.clientY - this.dragOffset.y
        
        this.$el.style.left = x + 'px'
        this.$el.style.top = y + 'px'
      })
    },
    stopDrag() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    },
    startResize(event) {
      this.isResizing = true
      const rect = this.$el.getBoundingClientRect()
      this.resizeStart = {
        x: event.clientX,
        y: event.clientY,
        width: rect.width,
        height: rect.height
      }
      
      document.addEventListener('mousemove', this.onResize)
      document.addEventListener('mouseup', this.stopResize)
    },
    onResize(event) {
      if (!this.isResizing || this.maximized) return
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      
      this.animationFrameId = requestAnimationFrame(() => {
        const dx = event.clientX - this.resizeStart.x
        const dy = event.clientY - this.resizeStart.y
        
        const newWidth = Math.max(400, this.resizeStart.width + dx)
        const newHeight = Math.max(300, this.resizeStart.height + dy)
        
        this.$el.style.width = newWidth + 'px'
        this.$el.style.height = newHeight + 'px'
      })
    },
    stopResize() {
      this.isResizing = false
      document.removeEventListener('mousemove', this.onResize)
      document.removeEventListener('mouseup', this.stopResize)
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    }
  }
}
</script>

<style scoped>
.window {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.window.minimized {
  display: none;
}

.window.maximized {
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: calc(100% - 48px) !important;
  border-radius: 0;
}

.window.maximized .resize-handle {
  display: none;
}

.window-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: move;
  user-select: none;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
}

.control-btn svg {
  width: 8px;
  height: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.control-btn:hover svg {
  opacity: 1;
}

.control-btn.close {
  background: #ff5f57;
}

.control-btn.minimize {
  background: #febc2e;
}

.control-btn.maximize {
  background: #28c840;
}

.window-title {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.window-spacer {
  width: 44px;
}

.window-content {
  flex: 1;
  overflow: hidden;
  background: white;
  position: relative;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-handle::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-right: 2px solid rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(0, 0, 0, 0.3);
}
</style>
