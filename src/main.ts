import { createApp } from 'vue'
import { create as createNaiveUI } from 'naive-ui'
import router from '@/router'
import App from '@/App.vue'
import { initTheme } from '@/composables/useTheme'
import '@/style/main.css'

// 初始化主题
initTheme()

// 创建 Naive UI 实例
const naive = createNaiveUI()

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')