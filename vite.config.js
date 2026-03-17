import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tagName => {
            return tagName === 'vue-advanced-chat' || tagName === 'emoji-picker'
          }
        }
      }
    })
  ],
  server: {
    proxy: {
      '/iptv-proxy': {
        target: '*',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const url = req.url
            const targetUrl = url.replace('/iptv-proxy/', '')
            
            if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
              const urlObj = new URL(targetUrl)
              proxyReq.path = urlObj.pathname + urlObj.search
              proxyReq.setHeader('Host', urlObj.host)
            } else {
              proxyReq.path = targetUrl
            }
          })
          
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err)
          })
        }
      }
    }
  }
})
