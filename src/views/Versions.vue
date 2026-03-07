<template>
  <div class="versions-container">
    <div ref="tabsRef" class="tabs-wrapper">
      <UiTabs v-model="activeTab" :items="tabs" />
    </div>

    <div class="versions-content" ref="contentRef">
      <ManageTab v-if="activeTab === 'manage'" />
      <VersionsTab v-if="activeTab === 'versions'" />
      <ModsTab v-if="activeTab === 'mods'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import gsap from 'gsap'
import '@/style/views/Versions.css'
import UiTabs from '@/components/ui/Tabs.vue'

const ManageTab = defineAsyncComponent(() => import('./versions/ManageTab.vue'))
const VersionsTab = defineAsyncComponent(() => import('./versions/VersionsTab.vue'))
const ModsTab = defineAsyncComponent(() => import('./versions/ModsTab.vue'))

const tabsRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const activeTab = ref('manage')

const tabs = [
  { id: 'manage', label: '管理', icon: 'icon-settings' },
  { id: 'versions', label: '版本', icon: 'icon-cube' },
  { id: 'mods', label: '模组', icon: 'icon-cube' }
]

onMounted(() => {
  const tl = gsap.timeline()
  
  if (tabsRef.value) {
    tl.fromTo(tabsRef.value,
      { opacity: 0, y: -20, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
    )
  }

  if (contentRef.value) {
    tl.fromTo(contentRef.value,
      { opacity: 0, y: 20, scale: 0.98, filter: 'blur(10px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
      "-=0.4"
    )
  }
})
</script>
