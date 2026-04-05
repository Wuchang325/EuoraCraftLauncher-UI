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
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import UiTabs from '@/components/ui/Tabs.vue'
import GeneralTab from './settings/GeneralTab.vue'
import GameTab from './settings/GameTab.vue'
import AboutTab from './settings/AboutTab.vue'
import { api } from '@/utils/api'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { themeMode, primaryColor, blurAmount, backgroundImage, backgroundImagePath, updateTheme, setBackgroundImage } = useTheme()

const mainRef = ref<HTMLElement | null>(null)
const activeTab = ref('general')

const tabs = computed(() => [
  { id: 'general', label: t('settings.general'), icon: 'icon-settings' },
  { id: 'game', label: t('settings.game'), icon: 'icon-game' },
  { id: 'about', label: t('settings.about'), icon: 'icon-info' }
])

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
      api.getGameConfig().catch(() => null),
      api.getDownloadConfig().catch(() => null)
    ])

    

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
  padding: 0;
}

.settings-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  margin-top: 10px;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tab-wrapper {
  height: 100%;
}
</style>