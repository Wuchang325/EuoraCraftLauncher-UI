<template>
  <div class="tab-pane">
    <div class="settings-group">
      <div class="group-title">
        <i class="icon icon-brush" />
        {{ t('settings.general') }}
      </div>

      <!-- 语言选择 -->
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">{{ t('settings.language') }}</div>
          <div class="setting-desc">Language / 语言</div>
        </div>
        <div class="setting-control">
          <div class="custom-select" :class="{ open: isLangOpen }" ref="langSelectRef">
            <div class="select-trigger" @click="toggleLangOpen">
              <span class="selected-text">
                <span class="lang-option">
                  <span class="lang-flag">{{ selectedLanguage?.flag }}</span>
                  <span class="lang-name">{{ selectedLanguage?.name }}</span>
                </span>
              </span>
              <i class="icon icon-arrow-right select-arrow" :class="{ rotated: isLangOpen }" />
            </div>
            <transition name="select-dropdown">
              <div v-show="isLangOpen" class="select-dropdown">
                <div
                  v-for="lang in supportedLocales"
                  :key="lang.code"
                  class="select-option"
                  :class="{ active: currentLocale === lang.code }"
                  @click="handleLanguageChange(lang.code)"
                >
                  <div class="option-content">
                    <span class="lang-flag">{{ lang.flag }}</span>
                    <span class="lang-name">{{ lang.name }}</span>
                  </div>
                  <i v-if="currentLocale === lang.code" class="icon icon-check check-icon" />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="setting-item theme-setting-item">
        <div class="setting-info">
          <div class="setting-label">{{ t('settings.theme') }}</div>
          <div class="setting-desc">{{ t('settings.theme') }}</div>
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
              <span class="theme-label">{{ t('settings.themeLight') }}</span>
            </div>
            <div
              class="theme-card"
              :class="{ active: currentSettings.mode === 'dark' }"
              @click="handleThemeChange('dark')"
            >
              <div class="theme-icon-wrapper">
                <i class="icon icon-moon" />
              </div>
              <span class="theme-label">{{ t('settings.themeDark') }}</span>
            </div>
            <div
              class="theme-card"
              :class="{ active: currentSettings.mode === 'system' }"
              @click="handleThemeChange('system')"
            >
              <div class="theme-icon-wrapper">
                <i class="icon icon-settings" />
              </div>
              <span class="theme-label">{{ t('settings.themeSystem') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">{{ t('settings.backgroundBlur') }}</div>
          <div class="setting-desc">{{ t('settings.backgroundBlur') }} (0-20px)</div>
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
          <div class="setting-label">{{ t('settings.primaryColor') }}</div>
          <div class="setting-desc">{{ t('settings.primaryColor') }}</div>
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
              <span class="custom-color-label">Custom</span>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">{{ t('settings.background') }}</div>
          <div class="setting-desc">{{ t('settings.background') }}</div>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <UiInput 
              :model-value="currentSettings.backgroundImage"
              @update:model-value="handleBgImageInput"
              :placeholder="t('settings.background') + ' URL'"
            />
            <UiButton variant="secondary" @click="selectLocalImage">{{ t('common.browse') }}</UiButton>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <div class="group-title">
        <i class="icon icon-download" />
        {{ t('settings.downloadSource') }}
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">{{ t('settings.downloadSource') }}</div>
          <div class="setting-desc">{{ t('settings.downloadSource') }}</div>
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
          <div class="setting-label">{{ t('settings.downloadThreads') }}</div>
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
            <span class="slider-value">{{ currentSettings.downloadThreads }} {{ t('settings.threads') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGlassMessage } from '@/composables/useGlassMessage'
import { supportedLocales, setLocale, getCurrentLocale, type LocaleCode } from '@/i18n'
import { useTheme, type ThemeMode, presetColors } from '@/composables/useTheme'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import { api } from '@/utils/api'

const props = defineProps<{
  settings: any
}>()

const emit = defineEmits<{
  (e: 'update:settings', value: any): void
}>()

const { t, locale } = useI18n()
const message = useGlassMessage()
const currentLocale = computed(() => locale.value as LocaleCode)
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

const isLangOpen = ref(false)
const langSelectRef = ref<HTMLElement | null>(null)

const downloadOptions = computed(() => [
  { value: 'official' as const, label: t('settings.sourceOfficial'), desc: 'Minecraft Official' },
  { value: 'bmclapi' as const, label: 'BMCLAPI', desc: t('settings.sourceBmclapiDesc') }
])

const selectedDownloadSource = computed(() => 
  downloadOptions.value.find(o => o.value === currentSettings.value.downloadSource)
)

const selectedLanguage = computed(() =>
  supportedLocales.find(l => l.code === currentLocale.value)
)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const toggleLangOpen = () => {
  isLangOpen.value = !isLangOpen.value
}

const updateField = (field: string, value: any) => {
  emit('update:settings', { ...props.settings, [field]: value })
}

const handleThemeChange = async (mode: ThemeMode) => {
  updateField('mode', mode)
  setThemeMode(mode)
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
    const result = await api.selectLocalImage()
    if (result.success && result.data?.path) {
      updateField('backgroundImage', result.data.path)
      await api.updateBackgroundImage('custom', result.data.path)
      
      const imgData = await api.getBackgroundImage()
      if (imgData.success && imgData.data?.base64) {
        setBackgroundImage(imgData.data.base64, result.data.path)
      }
      message.success(t('common.success'))
    } else {
      message.error(result.message || t('common.error'))
    }
  } catch (error: any) {
    message.error(error.message || t('common.error'))
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
      await api.updateBackgroundImage('none', '')
      return
    }
    
    if (strVal.startsWith('http')) {
      try {
        message.loading('Loading...')
        console.log('[Background] 开始下载图片:', strVal)
        // 1. 下载网络图片到本地
        const result = await api.loadImageFromUrl(strVal)
        if (result.success && result.data?.path) {
          const localPath = result.data.path
          console.log('[Background] 图片下载成功, 本地路径:', localPath)
          // 2. 先更新后端配置，设置新的背景图路径
          await api.updateBackgroundImage('custom', localPath)
          if (!updateResult.success) {
            console.error('[Background] 更新配置失败:', updateResult.message)
            message.error('更新配置失败: ' + updateResult.message)
            return
          }
          // 3. 更新前端输入框显示为本地路径
          updateField('backgroundImage', localPath)
          // 4. 获取背景图数据（此时配置已更新）
          console.log('[Background] 开始获取背景图数据...')
          const imgData = await api.getBackgroundImage()
          
          if (imgData.success && imgData.data?.base64) {
            console.log('[Background] Base64 数据长度:', imgData.data.base64.length)
            console.log('[Background] Base64 数据前100字符:', imgData.data.base64.substring(0, 100))
            // 5. 设置背景图显示
            setBackgroundImage(imgData.data.base64, localPath)
            console.log('[Background] setBackgroundImage 调用完成')
            // 检查 CSS 变量是否正确设置
            setTimeout(() => {
              const bgImage = getComputedStyle(document.documentElement).getPropertyValue('--bg-image')
              console.log('[Background] CSS --bg-image 值:', bgImage.substring(0, 100))
            }, 100)
            message.success(t('common.success'))
          } else {
            console.error('[Background] 获取背景图数据失败:', imgData.message)
            message.error('加载背景图失败: ' + imgData.message)
          }
        } else {
          console.error('[Background] 图片下载失败:', result.message)
          message.error(result.message || t('common.error'))
        }
      } catch (error: any) {
        console.error('[Background] 处理异常:', error)
        message.error(t('common.error'))
      }
    }
  }, 800)
}

const handleDownloadSourceChange = async (value: 'official' | 'bmclapi') => {
  updateField('downloadSource', value)
  isOpen.value = false
  
  try {
    await api.updateDownloadConfig({
      mirror_source: value,
      download_threads: currentSettings.value.downloadThreads
    })
  } catch (error) {
    message.error(t('common.error'))
  }
}

const handleThreadsChange = async (e: Event) => {
  const val = parseInt((e.target as HTMLInputElement).value)
  updateField('downloadThreads', val)
  
  try {
    await api.updateDownloadConfig({
      mirror_source: currentSettings.value.downloadSource,
      download_threads: val
    })
  } catch (error) {
    message.error(t('common.error'))
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
  if (langSelectRef.value && !langSelectRef.value.contains(e.target as Node)) {
    isLangOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (bgTimer) clearTimeout(bgTimer)
})

const handleLanguageChange = async (langCode: LocaleCode) => {
  isLangOpen.value = false
  await setLocale(langCode)
}
</script>

<style scoped src="@/style/views/Settings.css"></style>