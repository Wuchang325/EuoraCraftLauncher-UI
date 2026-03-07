<template>
  <div class="tab-pane">
    <div class="mods-header">
      <h2 class="mods-title">
        <i class="icon icon-cube" />
        模组管理
      </h2>
      <div class="mods-actions">
        <div class="input-group">
          <UiInput
            v-model="searchQuery"
            placeholder="搜索模组..."
            prefix-icon="icon-search"
            clearable
          />
        </div>
        <UiButton variant="secondary" icon="icon-add" @click="addMod">
          添加模组
        </UiButton>
      </div>
    </div>

    <div class="mods-grid" ref="gridRef">
      <div v-if="loading" class="flex-center" style="padding: 20px; grid-column: 1 / -1;">
        <span class="text-secondary">加载中...</span>
      </div>
      
      <div v-else-if="filteredMods.length === 0" class="flex-center" style="padding: 20px; grid-column: 1 / -1; flex-direction: column; gap: 12px;">
        <span class="text-secondary">暂无模组</span>
        <UiButton variant="secondary" @click="addMod">添加一个？</UiButton>
      </div>
      
      <UiCard
        v-for="(mod, index) in filteredMods"
        :key="mod.id"
        class="mod-card"
        hoverable
        @click="showModDetails(mod)"
        body-class="mod-card-body"
      >
        <div class="mod-content-wrapper">
          <div class="mod-icon">
            <img v-if="mod.icon" :src="mod.icon" :alt="mod.name" style="width: 100%; height: 100%; object-fit: cover;" />
            <i v-else class="icon icon-cube" />
          </div>
          <div class="mod-info">
            <div class="mod-header">
              <h3 class="mod-name">{{ mod.name }}</h3>
              <UiSwitch v-model="mod.enabled" @click.stop />
            </div>
            <p class="mod-desc" :title="mod.description">{{ mod.description }}</p>
            <div class="mod-meta">
              <span class="mod-version">{{ mod.version }}</span>
              <span class="mod-author">by {{ mod.author }}</span>
            </div>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import gsap from 'gsap'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import UiSwitch from '@/components/ui/Switch.vue'
import UiCard from '@/components/ui/Card.vue'

interface Mod {
  id: string
  name: string
  description: string
  version: string
  author: string
  enabled: boolean
  icon?: string
}

const message = useMessage()
const gridRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const searchQuery = ref('')

const mods = ref<Mod[]>([
  {
    id: 'jei',
    name: 'Just Enough Items',
    description: '查看物品合成表和用途的基础模组。',
    version: '11.6.0',
    author: 'mezz',
    enabled: true
  },
])

const filteredMods = computed(() => {
  if (!searchQuery.value) return mods.value
  const query = searchQuery.value.toLowerCase()
  return mods.value.filter(mod => 
    mod.name.toLowerCase().includes(query) || 
    mod.description.toLowerCase().includes(query)
  )
})

const addMod = () => {
  message.info('添加模组功能待实现')
}

const showModDetails = (mod: Mod) => {
  message.info(`查看模组详情: ${mod.name}`)
}

onMounted(() => {
  nextTick(() => {
    if (gridRef.value) {
      gsap.fromTo(gridRef.value.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      )
    }
  })
})
</script>

<style scoped>
.tab-pane {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.mods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.mods-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.mods-actions {
  display: flex;
  gap: 12px;
}

.mods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  overflow-y: auto;
  padding-bottom: 24px;
  flex: 1;
}

.mod-card {
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  gap: 16px;
  border: 1px solid var(--border-color);
  transition: all 0.2s var(--ease-spring);
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(var(--blur-lg));
  -webkit-backdrop-filter: blur(var(--blur-lg));
}

.mod-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.mod-content-wrapper {
  display: flex;
  gap: 16px;
  width: 100%;
}

.mod-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--bg-app);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-secondary);
  flex-shrink: 0;
  border: 1px solid var(--border-color);
}

.mod-info {
  flex: 1;
  min-width: 0;
}

.mod-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.mod-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mod-desc {
  font-size: 12px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
  line-height: 1.4;
}

.mod-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.mod-version {
  background-color: var(--bg-app);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.mod-author {
  color: var(--text-disabled);
}
</style>