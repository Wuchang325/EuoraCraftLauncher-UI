<template>
  <div class="settings-container" ref="mainRef">
    <UiTabs v-model="activeTab" :items="tabs" />
    
    <div class="settings-card">
      <div class="settings-content">
  
        <div v-show="activeTab === 'general'" class="tab-wrapper">
          <GeneralTab :settings="settings" @update:settings="handleUpdateSettings" />
        </div>
        <div v-show="activeTab === 'game'" class="tab-wrapper">
          <GameTab :settings="settings" @update:settings="handleUpdateSettings" />
        </div>
        <div v-show="activeTab === 'about'" class="tab-wrapper">
          <AboutTab />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import gsap from 'gsap'
import UiTabs from '@/components/ui/Tabs.vue'
import GeneralTab from './settings/GeneralTab.vue'
import GameTab from './settings/GameTab.vue'
import AboutTab from './settings/AboutTab.vue'
import {
  getThemeConfig,
  getBackgroundConfig,
  getGameConfig,
  getDownloadConfig
} from '@/utils/api'
import { useTheme } from '@/composables/useTheme'

const { themeMode, primaryColor, blurAmount, backgroundImage, backgroundImagePath, updateTheme, setBackgroundImage } = useTheme()

const mainRef = ref<HTMLElement | null>(null)
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: '通用', icon: 'icon-settings' },
  { id: 'game', label: '游戏设置', icon: 'icon-game' },
  { id: 'about', label: '关于', icon: 'icon-info' }
]

const settings = reactive({
  mode: 'system',
  primaryColor: '#87CEEB',
  blurAmount: 6,
  backgroundImage: '',
  javaAutoSelect: true,
  javaPath: '',
  memory: 4096,
  gamePath: './.minecraft',
  downloadSource: 'official',
  downloadThreads: 4,
  fullscreen: false,
  windowWidth: 1280,
  windowHeight: 720,
})

const handleUpdateSettings = (updates: any) => {
  Object.assign(settings, updates)
}

const initSettings = async () => {
  if (!window.pywebview?.api) return

  try {
    Object.assign(settings, {
      mode: themeMode.value,
      primaryColor: primaryColor.value,
      blurAmount: blurAmount.value,
      backgroundImage: backgroundImagePath.value
    })
    
    const [gameRes, downloadRes] = await Promise.all([
      getGameConfig().catch(() => null),
      getDownloadConfig().catch(() => null)
    ])

    if (gameRes && gameRes.success && gameRes.data) {
      const data = gameRes.data
      settings.javaAutoSelect = data.java_auto_select !== false
      settings.javaPath = data.java_path || ''
      settings.memory = data.memory_size || 4096
      if (data.minecraft_paths?.length) {
        settings.gamePath = data.minecraft_paths[0]
      }
    }

    if (downloadRes && downloadRes.success && downloadRes.data) {
      const data = downloadRes.data
      settings.downloadSource = data.mirror_source || 'official'
      settings.downloadThreads = data.download_threads || 4
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

onMounted(() => {
  gsap.fromTo(mainRef.value,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  )
  
  initSettings()
})
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 20px;
}

.settings-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  margin-top: 16px;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tab-wrapper {
  height: 100%;
}
</style>