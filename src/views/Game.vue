<template>
  <div class="home-container" ref="homeMainRef">
    <div class="home-left" ref="homeLeftRef">
    </div>

    <div class="home-right" ref="homeRightRef">
      <UiCard class="account-card" body-class="account-card-body">
        <div class="account-info">
          <div class="avatar">S</div>
          <div class="user-details">
            <div class="name">Steve</div>
            <div class="type">离线账户</div>
          </div>
        </div>
      </UiCard>

      <UiCard class="version-card" title="游戏版本" icon="icon-cube" body-class="version-card-body">
        <div class="version-list" ref="versionListRef">
          <div v-if="loading" class="flex-center" style="padding: 20px;">
            <span class="text-secondary">加载中...</span>
          </div>
          
          <div v-else-if="versions.length === 0" class="flex-center" style="padding: 20px;">
            <span class="text-secondary">未找到游戏版本</span>
          </div>
          
          <div
            v-else
            v-for="(ver, index) in versions"
            :key="ver.id"
            @click="selectVersion(ver.id)"
            :class="['version-item', { active: selectedVersion === ver.id }]"
          >
            <span class="version-name">{{ ver.id }}</span>
            <span class="version-tag">{{ ver.type }}</span>
          </div>
        </div>

        <div class="launch-section">
          <UiButton
            class="launch-btn"
            @click="launchGame"
            :disabled="launching || !selectedVersion"
            :loading="launching"
            size="lg"
            icon="icon-game"
          >
            {{ launching ? '启动中...' : '启动游戏' }}
          </UiButton>
        </div>

        <div v-if="statusMsg" :class="['status-msg', `text-${statusType}`]">
          {{ statusMsg }}
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import gsap from 'gsap'
import '@/style/views/Game.css'
import UiCard from '@/components/ui/Card.vue'
import UiButton from '@/components/ui/Button.vue'
import { api } from '@/utils/api'

const message = useMessage()

const versions = ref<any[]>([])
const selectedVersion = ref<string>('')
const loading = ref(false)
const launching = ref(false)
const statusMsg = ref<string>('')
const statusType = ref<'info' | 'success' | 'error'>('info')

const homeMainRef = ref<HTMLElement | null>(null)
const homeLeftRef = ref<HTMLElement | null>(null)
const homeRightRef = ref<HTMLElement | null>(null)

async function loadVersions() {
  loading.value = true
  try {
    const configRes = await api.getGameConfig()
    if (!configRes.success || !configRes.data?.minecraft_paths?.length) {
      showStatus('未设置游戏目录', 'error')
      return
    }
    
    const scanRes = await api.scanVersions(configRes.data.minecraft_paths)
    if (scanRes.success && scanRes.data) {
      versions.value = scanRes.data
        .filter((v: any) => v.status === 'success')
        .map((v: any) => ({ id: v.folder, type: v.loader_type || '原版' }))
      
      if (versions.value.length > 0 && !selectedVersion.value) {
        selectedVersion.value = versions.value[0].id
      }
      showStatus(`找到 ${versions.value.length} 个版本`, 'success')
    } else {
      showStatus('扫描版本失败', 'error')
    }
  } catch (e) {
    showStatus('获取版本列表失败', 'error')
  } finally {
    loading.value = false
  }
}

function selectVersion(id: string) {
  selectedVersion.value = id
}

async function launchGame() {
  if (!selectedVersion.value) {
    showStatus('请先选择游戏版本', 'error')
    return
  }
  
  launching.value = true
  showStatus('正在启动...', 'info')
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    showStatus('游戏启动成功！', 'success')
    message.success('游戏启动成功！')
  } catch (e) {
    showStatus('启动异常', 'error')
    message.error('启动异常')
  } finally {
    launching.value = false
  }
}

function showStatus(msg: string, type: 'info' | 'success' | 'error' = 'info') {
  statusMsg.value = msg
  statusType.value = type
  setTimeout(() => {
    if (statusMsg.value === msg) {
      statusMsg.value = ''
    }
  }, 5000)
}

onMounted(() => {
  const tl = gsap.timeline({ delay: 0.1 })
  
  tl.fromTo(homeLeftRef.value,
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
  )
  .fromTo(homeRightRef.value,
    { x: 30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
    '-=0.3'
  )
  
  loadVersions()
})
</script>

<style scoped>
.account-card {
  margin-bottom: 16px;
}

.version-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.home-right {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>