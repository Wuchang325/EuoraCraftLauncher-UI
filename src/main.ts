import { createApp } from 'vue'
import { create as createNaiveUI } from 'naive-ui'
import router from '@/router'
import App from '@/App.vue'
import { initTheme } from '@/composables/useTheme'
import { i18n, loadLocaleFromBackend, getCurrentLocale } from '@/i18n'
import '@/style/main.css'

initTheme()
document.documentElement.setAttribute('lang', getCurrentLocale())

const naive = createNaiveUI()
const app = createApp(App)
app.use(router)
app.use(naive)
app.use(i18n)
app.mount('#app')

if (window.pywebview?.api) {
  loadLocaleFromBackend()
} else {
  window.addEventListener('pywebviewready', loadLocaleFromBackend)
}