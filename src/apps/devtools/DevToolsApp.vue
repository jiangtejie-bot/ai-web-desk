<template>
  <div class="devtools-app">
    <div class="tools-sidebar">
      <div 
        v-for="tool in tools" 
        :key="tool.id"
        class="tool-item"
        :class="{ 'active': activeTool === tool.id }"
        @click="selectTool(tool.id)"
      >
        <div class="tool-icon">
          <Icon :icon="tool.icon" :width="24" :height="24" />
        </div>
        <span class="tool-name">{{ tool.name }}</span>
      </div>
    </div>

    <div class="tools-content">
      <component :is="currentToolComponent" />
    </div>
  </div>
</template>

<script>
import EncryptionTool from './components/EncryptionTool.vue'
import ImageConverterTool from './components/ImageConverterTool.vue'
import IPLocationTool from './components/IPLocationTool.vue'
import { Icon } from '@iconify/vue'

export default {
  name: 'DevToolsApp',
  components: {
    EncryptionTool,
    ImageConverterTool,
    IPLocationTool,
    Icon
  },
  data() {
    return {
      activeTool: 'encryption',
      tools: [
        {
          id: 'encryption',
          name: '加解密工具',
          icon: 'lucide:lock',
          component: 'EncryptionTool'
        },
        {
          id: 'image-converter',
          name: '图片转换',
          icon: 'lucide:image',
          component: 'ImageConverterTool'
        },
        {
          id: 'ip-location',
          name: 'IP属地查询',
          icon: 'lucide:globe',
          component: 'IPLocationTool'
        }
      ]
    }
  },
  computed: {
    currentToolComponent() {
      const tool = this.tools.find(t => t.id === this.activeTool)
      return tool ? tool.component : null
    }
  },
  methods: {
    selectTool(toolId) {
      this.activeTool = toolId
    }
  }
}
</script>

<style scoped>
.devtools-app {
  width: 100%;
  height: 100%;
  display: flex;
  background: #f5f5f5;
}

.tools-sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.tool-item:hover {
  background: #f8f9fa;
}

.tool-item.active {
  background: #e8f4ff;
  border-left-color: #667eea;
}

.tool-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.tool-item.active .tool-icon {
  color: #667eea;
}

.tool-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.tool-item.active .tool-name {
  color: #667eea;
  font-weight: 600;
}

.tools-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
