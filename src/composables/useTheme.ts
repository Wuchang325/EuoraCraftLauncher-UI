import { ref, computed, watch, type Ref } from 'vue'
import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui'
import { darkTheme, lightTheme } from 'naive-ui'
import { getBackgroundConfig, getBackgroundImage, getThemeConfig, updateThemeConfig } from '@/utils/api'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  followSystem: boolean
}

const THEME_KEY = 'euoracraft-theme'
const COLOR_KEY = 'euoracraft-primary-color'
const BG_IMAGE_KEY = 'euoracraft-bg-image'
const BLUR_KEY = 'euoracraft-blur-amount'

// 预设主题色
export const presetColors = [
  { name: '天蓝色', value: '#87CEEB' },
  { name: '樱花粉', value: '#FFB6C1' },
  { name: '薄荷绿', value: '#98E4D6' },
  //{ name: '薰衣草紫', value: '#E6E6FA' },
  { name: '默认蓝', value: '#0078d4' },
  { name: '极客绿', value: '#107c10' },
  { name: '活力橙', value: '#FF9F43' },
  { name: '热情红', value: '#FF6B6B' },
]

// 主题色配置
const themeColors = {
  light: {
    primary: '#87CEEB',
    primaryHover: '#5DADE2',
    primaryPressed: '#4A9FD4',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF6B6B',
    info: '#87CEEB',
    background: 'rgba(248, 250, 252, 0.65)',
    backgroundHover: 'rgba(255, 255, 255, 0.8)',
    surface: 'rgba(255, 255, 255, 0.9)',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: 'rgba(135, 206, 235, 0.3)',
    shadow: 'rgba(135, 206, 235, 0.2)',
  },
  dark: {
    primary: '#87CEEB',
    primaryHover: '#A8D8F0',
    primaryPressed: '#6BB9E0',
    success: '#6DD576',
    warning: '#FFD666',
    error: '#FF7875',
    info: '#87CEEB',
    background: 'rgba(15, 23, 42, 0.65)',
    backgroundHover: 'rgba(30, 41, 59, 0.8)',
    surface: 'rgba(30, 41, 59, 0.9)',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: 'rgba(135, 206, 235, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  }
}

// 创建主题配置
function createThemeOverrides(isDark: boolean, primary: string): GlobalThemeOverrides {
  const colors = isDark ? themeColors.dark : themeColors.light
  
  return {
    common: {
      primaryColor: colors.primary,
      primaryColorHover: colors.primaryHover,
      primaryColorPressed: colors.primaryPressed,
      primaryColorSuppl: colors.primaryHover,
      successColor: colors.success,
      warningColor: colors.warning,
      errorColor: colors.error,
      infoColor: colors.info,
      textColorBase: colors.text,
      textColor1: colors.text,
      textColor2: colors.textSecondary,
      textColor3: colors.textSecondary,
      bodyColor: 'transparent',
      cardColor: colors.background,
      modalColor: colors.surface,
      popoverColor: colors.surface,
      borderColor: colors.border,
      dividerColor: colors.border,
    },
    Button: {
      color: colors.background,
      colorHover: colors.backgroundHover,
      colorPressed: colors.backgroundHover,
      textColor: colors.text,
      textColorHover: colors.primary,
      border: `1px solid ${colors.border}`,
      borderHover: `1px solid ${colors.primary}`,
    },
    Card: {
      color: colors.background,
      borderColor: colors.border,
    },
    Input: {
      color: colors.surface,
      colorFocus: colors.surface,
      border: `1px solid ${colors.border}`,
      borderHover: `1px solid ${colors.primary}`,
      borderFocus: `1px solid ${colors.primary}`,
      textColor: colors.text,
      placeholderColor: colors.textSecondary,
    },
    Select: {
      color: colors.surface,
      colorActive: colors.backgroundHover,
      border: `1px solid ${colors.border}`,
      borderHover: `1px solid ${colors.primary}`,
      borderActive: `1px solid ${colors.primary}`,
    },
    Switch: {
      railColor: colors.textSecondary,
      railColorActive: colors.primary,
    },
    Slider: {
      fillColor: colors.primary,
      railColor: colors.border,
    },
    Tooltip: {
      color: colors.surface,
      textColor: colors.text,
    },
    Dropdown: {
      color: colors.surface,
      optionColorHover: colors.backgroundHover,
    },
    Menu: {
      color: colors.background,
      itemColorHover: colors.backgroundHover,
      itemTextColor: colors.text,
      itemTextColorHover: colors.primary,
    },
  }
}

// 状态
const themeMode = ref<ThemeMode>('system')
const primaryColor = ref('#87CEEB') // 默认天蓝色
const backgroundImage = ref('') // 默认无背景图
const backgroundImagePath = ref('') // 背景图路径
const blurAmount = ref(6)
const isDark = ref(false)
const systemDark = ref(false)

const naiveTheme = computed<GlobalTheme | null>(() => {
  return isDark.value ? darkTheme : null
})

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  return createThemeOverrides(isDark.value, primaryColor.value)
})

const colors = computed(() => isDark.value ? themeColors.dark : themeColors.light)

// 监听系统主题
function initSystemThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mediaQuery.matches
  
  mediaQuery.addEventListener('change', (e) => {
    systemDark.value = e.matches
    if (themeMode.value === 'system') {
      updateTheme()
    }
  })
}

function updateTheme() {
  if (themeMode.value === 'system') {
    isDark.value = systemDark.value
  } else {
    isDark.value = themeMode.value === 'dark'
  }
  
  // 更新 HTML 属性
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  
  // 更新 CSS 变量
  document.documentElement.style.setProperty('--color-primary', primaryColor.value)
  document.documentElement.style.setProperty('--bg-image', backgroundImage.value ? `url(${backgroundImage.value})` : 'none')
  document.documentElement.style.setProperty('--bg-blur', `${blurAmount.value}px`)
  
  // 保存到本地存储
  localStorage.setItem(THEME_KEY, JSON.stringify({
    mode: themeMode.value,
    followSystem: themeMode.value === 'system'
  }))
  localStorage.setItem(COLOR_KEY, primaryColor.value)
  localStorage.setItem(BG_IMAGE_KEY, backgroundImage.value)
  localStorage.setItem(BLUR_KEY, blurAmount.value.toString())
}

function setThemeMode(mode: ThemeMode) {
  themeMode.value = mode
  updateTheme()
  // 同时保存到后端配置
  saveThemeConfig()
}

function setPrimaryColor(color: string) {
  primaryColor.value = color
  updateTheme()
  // 同时保存到后端配置
  saveThemeConfig()
}

function setBackgroundImage(url: string, path?: string) {
  backgroundImage.value = url
  if (path !== undefined) {
    backgroundImagePath.value = path
  }
  updateTheme()
  // 同时保存到后端配置
  saveThemeConfig()
}

function setBlurAmount(amount: number) {
  blurAmount.value = amount
  updateTheme()
  // 同时保存到后端配置
  saveThemeConfig()
}

// 保存到后端（防抖）
let saveTimer: any = null
async function saveThemeConfig() {
  // 清除之前的定时器
  if (saveTimer) clearTimeout(saveTimer)
  
  // 设置新的防抖定时器（100ms）
  saveTimer = setTimeout(async () => {
    if (window.pywebview && window.pywebview.api) {
      try {
        const themeConfig = {
          mode: themeMode.value,
          primary_color: primaryColor.value,
          blur_amount: blurAmount.value
        };
        
        await updateThemeConfig(themeConfig);
      } catch (error) {
        console.error('保存主题配置失败:', error);
      }
    }
    
    // 同时保存到localStorage作为备份
    localStorage.setItem(THEME_KEY, JSON.stringify({
      mode: themeMode.value,
      followSystem: themeMode.value === 'system'
    }))
    localStorage.setItem(COLOR_KEY, primaryColor.value)
    localStorage.setItem(BG_IMAGE_KEY, backgroundImage.value)
    localStorage.setItem(BLUR_KEY, blurAmount.value.toString())
  }, 100)
}

function toggleTheme() {
  if (themeMode.value === 'system') {
    setThemeMode(isDark.value ? 'light' : 'dark')
  } else {
    setThemeMode(themeMode.value === 'dark' ? 'light' : 'dark')
  }
}

export async function initTheme() {
  try {
    // 尝试从后端API获取主题配置
    if (window.pywebview && window.pywebview.api) {
      const config = await getThemeConfig()
      
      if (config.success && config.data) {
        themeMode.value = config.data.mode as ThemeMode || 'system'
        primaryColor.value = config.data.primary_color || '#87CEEB'
        blurAmount.value = config.data.blur_amount || 6
      } else {
        themeMode.value = 'system'
        primaryColor.value = '#87CEEB'
        blurAmount.value = 6
      }
      
      // 从后端配置加载后，需要重新加载背景图片
      if (window.pywebview && window.pywebview.api) {
        // 获取背景图配置
        const bgConfig = await getBackgroundConfig()
        if (bgConfig.success && bgConfig.data) {
          // 如果有背景图路径，加载背景图片数据
          if (bgConfig.data.path) {
            backgroundImagePath.value = bgConfig.data.path
            const imgData = await getBackgroundImage()
            if (imgData.success && imgData.data?.base64) {
              backgroundImage.value = imgData.data.base64
            }
          } else {
            backgroundImage.value = ''
            backgroundImagePath.value = ''
          }
          // 如果背景配置中有模糊值，覆盖主题配置中的模糊值
          if (typeof bgConfig.data.blur === 'number') {
            blurAmount.value = bgConfig.data.blur
            console.log('从背景配置中读取模糊值:', bgConfig.data.blur)
          }
        }
      }
    } else {
      // 如果没有后端API，则从localStorage加载（向后兼容）
      const saved = localStorage.getItem(THEME_KEY)
      if (saved) {
        const state: ThemeState = JSON.parse(saved)
        themeMode.value = state.mode
      }
      
      const savedColor = localStorage.getItem(COLOR_KEY)
      if (savedColor) {
        primaryColor.value = savedColor
      } else {
        primaryColor.value = '#87CEEB' // 默认天蓝色
      }

      const savedBgImage = localStorage.getItem(BG_IMAGE_KEY)
      if (savedBgImage) {
        backgroundImage.value = savedBgImage
      } else {
        backgroundImage.value = '' // 默认无背景图
      }

      const savedBlur = localStorage.getItem(BLUR_KEY)
      if (savedBlur) {
        blurAmount.value = parseInt(savedBlur)
      }
    }
  } catch (error) {
    console.error('初始化主题失败:', error)
    themeMode.value = 'system'
    primaryColor.value = '#87CEEB'
    backgroundImage.value = '' // 默认无背景图
    blurAmount.value = 6
  }
  
  initSystemThemeListener()
  updateTheme()
}

export function useTheme() {
  return {
    themeMode,
    primaryColor,
    backgroundImage,
    backgroundImagePath,
    blurAmount,
    isDark,
    naiveTheme,
    themeOverrides,
    colors,
    setThemeMode,
    setPrimaryColor,
    setBackgroundImage,
    setBlurAmount,
    toggleTheme,
    initTheme,
    updateTheme, // 导出updateTheme以便直接调用而不触发保存
  }
}

// 全局状态
export const globalThemeState = {
  themeMode,
  primaryColor,
  backgroundImage,
  backgroundImagePath,
  blurAmount,
  isDark,
  naiveTheme,
  themeOverrides,
  colors,
  setThemeMode,
  setPrimaryColor,
  setBackgroundImage,
  setBlurAmount,
  toggleTheme,
  initTheme,
}