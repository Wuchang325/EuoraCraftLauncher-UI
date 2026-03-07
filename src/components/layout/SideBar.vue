<template>
  <aside class="sidebar" :class="{ expanded: isExpanded }">
    <button class="toggle-btn" @click="toggleSidebar" title="切换侧边栏">
      <i class="icon icon-menu" />
    </button>
    
    <nav class="sidebar-nav" @mouseleave="handleMouseLeave">
      <div class="active-background" ref="backgroundRef"></div>
      <div class="active-indicator" ref="indicatorRef"></div>
      
      <router-link 
        v-for="(item, index) in menuItems" 
        :key="item.path"
        :to="item.path"
        class="menu-item"
        active-class="active"
        @mouseenter="handleMouseEnter(index)"
        @click="handleItemClick"
      >
        <i :class="['icon', item.icon]" />
        <span class="text">{{ item.label }}</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <button class="menu-item" @click="openHelp" title="帮助">
        <i class="icon icon-help" />
        <span class="text">帮助</span>
      </button>
    </div>
  </aside>
  
  <div class="sidebar-overlay" @click="isExpanded = false"></div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import '@/style/components/SideBar.css'

const isExpanded = ref(false)
const route = useRoute()
const message = useMessage()
const indicatorRef = ref<HTMLElement | null>(null)
const backgroundRef = ref<HTMLElement | null>(null)

const menuItems = [
  { path: '/', label: '游戏', icon: 'icon-game' },
  { path: '/versions', label: '版本', icon: 'icon-cube' },
  { path: '/instances', label: '实例管理', icon: 'icon-folder' },
  { path: '/settings', label: '设置', icon: 'icon-settings' }
]

const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
}

const handleItemClick = () => {
}

const openHelp = () => {
  message.info('帮助文档正在编写中...')
}

const updateIndicator = (index: number) => {
  const top = index * 52
  if (indicatorRef.value) {
    indicatorRef.value.style.top = `${top + 10}px`
    indicatorRef.value.style.opacity = '1'
  }
}

const updateBackground = (index: number) => {
  const top = index * 52
  if (backgroundRef.value) {
    backgroundRef.value.style.top = `${top}px`
    backgroundRef.value.style.opacity = '1'
  }
}

const getActiveIndex = (path: string) => {
  let index = menuItems.findIndex(item => item.path === path)
  if (index !== -1) return index
  
  if (path !== '/') {
    index = menuItems.findIndex(item => item.path !== '/' && path.startsWith(item.path))
    if (index !== -1) return index
  }
  
  return -1
}

const handleMouseEnter = (index: number) => {
  updateIndicator(index)
}

const handleMouseLeave = () => {
  const index = getActiveIndex(route.path)
  if (index !== -1) {
    updateIndicator(index)
  } else {
    if (indicatorRef.value) indicatorRef.value.style.opacity = '0'
  }
}

watch(
  () => route.path,
  (newPath) => {
    const index = getActiveIndex(newPath)
    if (index !== -1) {
      nextTick(() => {
        updateIndicator(index)
        updateBackground(index)
      })
    } else {
      if (indicatorRef.value) indicatorRef.value.style.opacity = '0'
      if (backgroundRef.value) backgroundRef.value.style.opacity = '0'
    }
  },
  { immediate: true }
)

onMounted(() => {
  const index = getActiveIndex(route.path)
  if (index !== -1) {
    setTimeout(() => {
      updateIndicator(index)
      updateBackground(index)
    }, 100)
  }
})
</script>
