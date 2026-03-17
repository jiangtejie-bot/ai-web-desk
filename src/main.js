import { createApp } from 'vue'
import router from './router'
import './style.css'
import AppMain from './AppMain.vue'

const app = createApp(AppMain)
app.use(router)
app.mount('#app')
