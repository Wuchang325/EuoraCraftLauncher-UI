<template>
  <nav class="ui-tabs" @mouseleave="handleMouseLeave">
    <div class="active-background" ref="activeBgRef"></div>
    <div class="tabs-indicator" ref="indicatorRef"></div>
    <div
      v-for="(tab, index) in items"
      :key="tab.id"
      :ref="el => { if (el) tabRefs[index] = el as HTMLElement }"
      class="tab-item"
      :class="{ active: modelValue === tab.id }"
      @click="handleClick(tab.id)"
      @mouseenter="handleMouseEnter(index)"
    >
      <i v-if="tab.icon" :class="['icon', tab.icon]" />
      {{ tab.label }}
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

interface TabItem {
  id: string
  label: string
  icon?: string
}

const props = defineProps<{
  modelValue: string
  items: TabItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const indicatorRef = ref<HTMLElement | null>(null)
const activeBgRef = ref<HTMLElement | null>(null)
const tabRefs = ref<HTMLElement[]>([])

const updateIndicator = (index: number) => {
  if (!indicatorRef.value || !tabRefs.value[index]) return
  
  const tab = tabRefs.value[index]
  indicatorRef.value.style.left = `${tab.offsetLeft}px`
  indicatorRef.value.style.width = `${tab.offsetWidth}px`
  indicatorRef.value.style.opacity = '1'
}

const updateActiveBackground = (index: number) => {
  if (!activeBgRef.value || !tabRefs.value[index]) return
  
  const tab = tabRefs.value[index]
  activeBgRef.value.style.left = `${tab.offsetLeft}px`
  activeBgRef.value.style.width = `${tab.offsetWidth}px`
  activeBgRef.value.style.height = `${tab.offsetHeight}px`
  activeBgRef.value.style.top = `${tab.offsetTop}px`
  activeBgRef.value.style.opacity = '1'
}

const handleMouseEnter = (index: number) => {
  updateIndicator(index)
}

const handleMouseLeave = () => {
  const index = props.items.findIndex(t => t.id === props.modelValue)
  if (index !== -1) {
    updateIndicator(index)
  }
}

const handleClick = (id: string) => {
  emit('update:modelValue', id)
}

watch(() => props.modelValue, () => {
  const index = props.items.findIndex(t => t.id === props.modelValue)
  if (index !== -1) {
    nextTick(() => {
      updateIndicator(index)
      updateActiveBackground(index)
    })
  }
})

onMounted(() => {
  const index = props.items.findIndex(t => t.id === props.modelValue)
  if (index !== -1) {
    // 稍微延迟以确保 DOM 渲染完成
    setTimeout(() => {
      updateIndicator(index)
      updateActiveBackground(index)
    }, 100)
  }
})
</script>

<style scoped>
.ui-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  position: relative;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  width: fit-content;
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
}

.tabs-indicator {
  position: absolute;
  bottom: 0;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: 3px 3px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 -2px 8px rgba(59, 130, 246, 0.3);
  z-index: 2;
}

.active-background {
  position: absolute;
  background-color: var(--color-primary-light);
  border-radius: var(--radius-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  opacity: 0;
  z-index: 0;
}

.tab-item {
  position: relative;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  z-index: 1;
  user-select: none;
}

.tab-item:hover {
  color: var(--color-primary);
  background-color: var(--bg-surface-hover);
}

.tab-item.active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-item .icon {
  font-size: 16px;
}
</style>