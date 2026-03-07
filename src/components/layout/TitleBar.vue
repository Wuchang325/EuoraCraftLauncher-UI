<template>
  <div class="pywebview-drag-region">
  <header class="title-bar">
    <div class="title-bar-left">
      <img src="/favicon.ico" alt="Logo" class="app-logo" />
      <span class="app-name">EuoraCraft Launcher</span>
    </div>
    
    <div class="title-bar-right">
      <button class="theme-toggle-btn" @click="toggleTheme" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
        <i class="icon icon-moon" v-if="isDark" />
        <i class="icon icon-sun" v-else />
      </button>
      
      <button class="control-btn" @click="minimize" title="最小化">
        <i class="icon icon-minimize" />
      </button>
      <button class="control-btn close-btn" @click="close" title="关闭">
        <i class="icon icon-close" />
      </button>
    </div>
  </header>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import '@/style/components/TitleBar.css'

const { isDark, toggleTheme } = useTheme()

declare global {
  interface Window { pywebview: any }
}

const minimize = () => window.pywebview?.api.minimize_window()
const close = () => window.pywebview?.api.close_window()
</script>
