<template>
  <div class="tab-pane">
    <div class="settings-group">
      <div class="group-title">
        <i class="icon icon-brush" />
        外观设置
      </div>

      <div class="setting-item theme-setting-item">
        <div class="setting-info">
          <div class="setting-label">主题模式</div>
          <div class="setting-desc">选择应用程序的外观风格</div>
        </div>
        <div class="setting-control">
          <div class="theme-options">
            <div
              class="theme-card"
              :class="{ active: currentSettings.mode === 'light' }"
              @click="handleThemeChange('light')"
            >
              <div class="theme-icon-wrapper">
                <i class="icon icon-sun" />
              </div>
              <span class="theme-label">浅色</span>
            </div>
            <div
              class="theme-card"
              :class="{ active: currentSettings.mode === 'dark' }"
              @click="handleThemeChange('dark')"
            >
              <div class="theme-icon-wrapper">
                <i class="icon icon-moon" />
              </div>
              <span class="theme-label">深色</span>
            </div>
            <div
              class="theme-card"
              :class="{ active: currentSettings.mode === 'system' }"
              @click="handleThemeChange('system')"
            >
              <div class="theme-icon-wrapper">
                <i class="icon icon-settings" />
              </div>
              <span class="theme-label">跟随系统</span>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">背景模糊</div>
          <div class="setting-desc">调整背景模糊程度（0-20px）</div>
        </div>
        <div class="setting-control">
          <div class="slider-container">
            <input 
              type="range" 
              :value="currentSettings.blurAmount"
              min="0" 
              max="20" 
              step="1"
              @change="handleBlurChange"
            />
            <span class="slider-value">{{ currentSettings.blurAmount }} px</span>
          </div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">主题色</div>
          <div class="setting-desc">选择全局主题颜色</div>
        </div>
        <div class="setting-control">
          <div class="color-presets">
            <div
              v-for="color in presetColors"
              :key="color.value"
              class="color-preset-item"
              :style="{ backgroundColor: color.value }"
              :class="{ active: currentSettings.primaryColor === color.value }"
              :title="color.name"
              @click="handleColorChange(color.value)"
            >
              <i v-if="currentSettings.primaryColor === color.value" class="icon icon-check" />
            </div>
            <div class="custom-color-picker">
              <input
                type="color"
                :value="currentSettings.primaryColor"
                @input="handleColorInput"
                class="color-input"
                title="自定义颜色"
              />
              <span class="custom-color-label">自定义</span>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">背景图片</div>
          <div class="setting-desc">设置启动器背景</div>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <UiInput 
              :model-value="currentSettings.backgroundImage"
              @update:model-value="handleBgImageInput"
              placeholder="输入图片路径或URL"
            />
            <UiButton variant="secondary" @click="selectLocalImage">浏览</UiButton>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <div class="group-title">
        <i class="icon icon-download" />
        下载设置
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">下载源</div>
          <div class="setting-desc">选择游戏资源下载来源</div>
        </div>
        <div class="setting-control">
          <div class="custom-select" :class="{ open: isOpen }" ref="selectRef">
            <div class="select-trigger" @click="toggleOpen">
              <span class="selected-text">{{ selectedDownloadSource?.label || '请选择' }}</span>
              <i class="icon icon-arrow-right select-arrow" :class="{ rotated: isOpen }" />
            </div>
            <transition name="select-dropdown">
              <div v-show="isOpen" class="select-dropdown">
                <div
                  v-for="option in downloadOptions"
                  :key="option.value"
                  class="select-option"
                  :class="{ active: currentSettings.downloadSource === option.value }"
                  @click="handleDownloadSourceChange(option.value)"
                >
                  <div class="option-content">
                    <span class="option-label">{{ option.label }}</span>
                    <span class="option-desc">{{ option.desc }}</span>
                  </div>
                  <i v-if="currentSettings.downloadSource === option.value" class="icon icon-check check-icon" />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">并发下载数</div>
        </div>
        <div class="setting-control">
          <div class="slider-container">
            <input 
              type="range" 
              :value="currentSettings.downloadThreads"
              min="1" 
              max="16" 
              step="1"
              @change="handleThreadsChange"
            />
            <span class="slider-value">{{ currentSettings.downloadThreads }} 线程</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGlassMessage } from '@/composables/useGlassMessage'
import { useTheme, type ThemeMode, presetColors } from '@/composables/useTheme'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import {
  getBackgroundConfig,
  getBackgroundImage,
  updateBackgroundImage,
  updateThemeConfig,
  updateDownloadConfig,
  selectLocalImage as apiSelectLocalImage,
  loadImageFromUrl
} from '@/utils/api'

const props = defineProps<{
  settings: any
}>()

const emit = defineEmits<{
  (e: 'update:settings', value: any): void
}>()

const message = useGlassMessage()
const {
  setThemeMode,
  setPrimaryColor,
  setBackgroundImage,
  setBlurAmount,
} = useTheme()

const currentSettings = computed(() => ({
  mode: props.settings?.mode || 'system',
  primaryColor: props.settings?.primaryColor || '#87CEEB',
  blurAmount: props.settings?.blurAmount ?? 6,
  backgroundImage: props.settings?.backgroundImage || '',
  downloadSource: props.settings?.downloadSource || 'official',
  downloadThreads: props.settings?.downloadThreads ?? 4
}))

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const downloadOptions: Array<{value: 'official' | 'bmclapi' | 'mcbbs', label: string, desc: string}> = [
  { value: 'official', label: '官方源', desc: 'Minecraft 官方下载源' },
  { value: 'bmclapi', label: 'BMCLAPI', desc: '国内镜像，速度较快' },
  { value: 'mcbbs', label: 'MCBBS', desc: '国内镜像，稳定可靠' }
]

const selectedDownloadSource = computed(() => 
  downloadOptions.find(o => o.value === currentSettings.value.downloadSource)
)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const updateField = (field: string, value: any) => {
  emit('update:settings', { ...props.settings, [field]: value })
}

const handleThemeChange = async (mode: ThemeMode) => {
  updateField('mode', mode)
  setThemeMode(mode)
  
  message.success(`已切换到${mode === 'light' ? '浅色' : mode === 'dark' ? '深色' : '跟随系统'}模式`)
}

const handleColorChange = async (color: string) => {
  updateField('primaryColor', color)
  setPrimaryColor(color)
  
}

const handleColorInput = (e: Event) => {
  handleColorChange((e.target as HTMLInputElement).value)
}

const handleBlurChange = async (e: Event) => {
  const val = parseInt((e.target as HTMLInputElement).value)
  updateField('blurAmount', val)
  setBlurAmount(val)
  
}

const selectLocalImage = async () => {
  try {
    const result = await apiSelectLocalImage()
    if (result.success && result.data?.path) {
      updateField('backgroundImage', result.data.path)
      await updateBackgroundImage('custom', result.data.path)
      
      const imgData = await getBackgroundImage()
      if (imgData.success && imgData.data?.base64) {
        setBackgroundImage(imgData.data.base64, result.data.path)
      }
      message.success('背景图片设置成功')
    } else {
      message.error(result.message || '选择图片失败')
    }
  } catch (error: any) {
    message.error(error.message || '选择图片失败')
  }
}

// 防抖
let bgTimer: any = null
const handleBgImageInput = (val: string | number) => {
  const strVal = String(val)
  updateField('backgroundImage', strVal)
  
  if (bgTimer) clearTimeout(bgTimer)
  bgTimer = setTimeout(async () => {
    if (!strVal) {
      setBackgroundImage('', '')
      await updateBackgroundImage('none', '')
      return
    }
    
    if (strVal.startsWith('http')) {
      try {
        message.loading('正在加载网络图片...')
        const result = await loadImageFromUrl(strVal)
        if (result.success && result.data?.path) {
          updateField('backgroundImage', result.data.path)
          const imgData = await getBackgroundImage()
          if (imgData.success && imgData.data?.base64) {
            setBackgroundImage(imgData.data.base64, result.data.path)
          }
          message.success('网络图片加载成功')
        } else {
          message.error(result.message || '加载网络图片失败')
        }
      } catch (error) {
        message.error('加载网络图片失败')
      }
    }
  }, 800)
}

const handleDownloadSourceChange = async (value: 'official' | 'bmclapi' | 'mcbbs') => {
  updateField('downloadSource', value)
  isOpen.value = false
  
  try {
    await updateDownloadConfig({
      mirror_source: value,
      download_threads: currentSettings.value.downloadThreads
    })
  } catch (error) {
    message.error('保存下载源设置失败')
  }
}

const handleThreadsChange = async (e: Event) => {
  const val = parseInt((e.target as HTMLInputElement).value)
  updateField('downloadThreads', val)
  
  try {
    await updateDownloadConfig({
      mirror_source: currentSettings.value.downloadSource,
      download_threads: val
    })
  } catch (error) {
    message.error('保存下载设置失败')
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (bgTimer) clearTimeout(bgTimer)
})
</script>

<style scoped src="@/style/views/Settings.css"></style>