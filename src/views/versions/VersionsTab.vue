<template>
  <div class="tab-pane">
    <div class="download-toolbar">
      <div class="left-actions">
        <UiButton
          variant="secondary"
          size="sm"
          icon="icon-refresh"
          @click="fetchVersions"
        >
          刷新列表
        </UiButton>
        <UiButton
          variant="primary"
          size="sm"
          icon="icon-download"
          @click="showInstallDialog = true"
        >
          安装新版本
        </UiButton>
      </div>
      <div class="right-actions">
        <UiInput
          v-model="searchQuery"
          placeholder="搜索版本..."
          icon="icon-search"
          clearable
          class="search-input"
        />
      </div>
    </div>

    <div class="versions-list-container">
      <div v-if="loading" class="loading-container">
        <i class="icon icon-spinner spin" style="font-size: 32px;"></i>
        <p>正在获取版本列表...</p>
      </div>

      <div v-else-if="filteredVersions.length === 0" class="empty-container">
        <i class="icon icon-cube" style="font-size: 48px; color: var(--text-disabled);" />
        <p>未找到版本</p>
      </div>

      <div v-else class="versions-grid">
        <div
          v-for="version in filteredVersions"
          :key="version.id"
          class="version-card"
        >
          <div class="version-header">
            <div class="version-icon">
              <i class="icon icon-cube" />
            </div>
            <div class="version-info">
              <h4 class="version-name">{{ version.id }}</h4>
              <p class="version-type">{{ version.type === 'release' ? '正式版' : '快照版' }}</p>
            </div>
            <div class="version-actions">
              <UiButton
                variant="primary"
                size="sm"
                icon="icon-download"
                @click="downloadVersion(version.id)"
                :loading="downloading === version.id"
              >
                下载
              </UiButton>
            </div>
          </div>

          <div class="version-details">
            <div class="detail-item">
              <span class="label">发布日期:</span>
              <span class="value">{{ formatDate(version.releaseTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">类型:</span>
              <span class="value type-badge" :class="version.type">
                {{ version.type === 'release' ? '正式版' : '快照版' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安装对话框 -->
    <UiModal
      v-model:visible="showInstallDialog"
      title="安装新版本"
      :closable="true"
    >
      <div class="install-form">
        <div class="form-group">
          <label>Minecraft 版本</label>
          <select v-model="installForm.mcVersion" class="form-select">
            <option value="">选择版本</option>
            <optgroup label="正式版">
              <option v-for="v in releaseVersions.slice(0, 20)" :key="v.id" :value="v.id">
                {{ v.id }}
              </option>
            </optgroup>
            <optgroup label="快照版">
              <option v-for="v in snapshotVersions.slice(0, 10)" :key="v.id" :value="v.id">
                {{ v.id }}
              </option>
            </optgroup>
          </select>
        </div>

        <div class="form-group">
          <label>加载器 (可选)</label>
          <select v-model="installForm.loader" class="form-select">
            <option value="">原版</option>
            <option value="fabric">Fabric</option>
          </select>
        </div>

        <div class="form-group" v-if="installForm.loader === 'fabric'">
          <label>Fabric Loader 版本</label>
          <select v-model="installForm.loaderVersion" class="form-select">
            <option value="">最新版</option>
            <option v-for="ver in fabricVersions" :key="ver" :value="ver">{{ ver }}</option>
          </select>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <UiButton variant="secondary" @click="showInstallDialog = false">取消</UiButton>
          <UiButton 
            variant="primary" 
            @click="startInstall"
            :loading="isInstalling"
            :disabled="!installForm.mcVersion"
          >
            开始安装
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/utils/api'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import UiModal from '@/components/ui/Modal.vue'
import { useGlassMessage } from '@/composables/useGlassMessage'

const glassMessage = useGlassMessage()

const loading = ref(false)
const downloading = ref<string | null>(null)
const searchQuery = ref('')
const allVersions = ref<any[]>([])
const fabricVersions = ref<string[]>([])

const showInstallDialog = ref(false)
const isInstalling = ref(false)
const installForm = ref({
  mcVersion: '',
  loader: '',
  loaderVersion: ''
})

const releaseVersions = computed(() => 
  allVersions.value.filter(v => v.type === 'release')
)

const snapshotVersions = computed(() => 
  allVersions.value.filter(v => v.type === 'snapshot')
)

const filteredVersions = computed(() => {
  if (!searchQuery.value.trim()) {
    return releaseVersions.value.slice(0, 30)
  }
  const query = searchQuery.value.toLowerCase()
  return allVersions.value.filter(v =>
    v.id.toLowerCase().includes(query)
  ).slice(0, 30)
})

const fetchVersions = async () => {
  loading.value = true
  try {
    const res = await api.getMinecraftVersions()
    if (res.success && res.data) {
      allVersions.value = res.data
    }
  } catch (e) {
    glassMessage.error('获取版本列表失败')
  } finally {
    loading.value = false
  }
}

const fetchFabricVersions = async () => {
  try {
    const res = await api.getFabricVersions()
    if (res.success && res.data) {
      fabricVersions.value = res.data.slice(0, 10)
    }
  } catch (e) {
    console.error('获取 Fabric 版本失败', e)
  }
}

const downloadVersion = async (versionId: string) => {
  downloading.value = versionId
  try {
    const res = await api.installVersion(versionId)
    if (res.success) {
      glassMessage.success(`已开始下载 ${versionId}`)
    } else {
      glassMessage.error(res.message || '下载失败')
    }
  } catch (e) {
    glassMessage.error('下载出错')
  } finally {
    downloading.value = null
  }
}

const startInstall = async () => {
  if (!installForm.value.mcVersion) return
  
  isInstalling.value = true
  try {
    const res = await api.installVersion(installForm.value.mcVersion, {
      loader: installForm.value.loader || undefined,
      loaderVersion: installForm.value.loaderVersion || undefined
    })
    
    if (res.success) {
      glassMessage.success('安装任务已创建')
      showInstallDialog.value = false
    } else {
      glassMessage.error(res.message || '安装失败')
    }
  } catch (e) {
    glassMessage.error('安装出错')
  } finally {
    isInstalling.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

watch(() => installForm.value.loader, (val) => {
  if (val === 'fabric' && fabricVersions.value.length === 0) {
    fetchFabricVersions()
  }
})

onMounted(() => {
  fetchVersions()
})
</script>

<style scoped>
.tab-pane {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.download-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--background-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 240px;
}

.versions-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
  color: var(--text-secondary);
}

.spin {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.versions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.version-card {
  background: var(--background-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 16px;
  transition: all 0.2s ease;
}

.version-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.version-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.version-icon {
  font-size: 24px;
  color: var(--primary-color);
  background: var(--background-tertiary);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.version-info {
  flex: 1;
}

.version-name {
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.version-type {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.version-actions {
  display: flex;
  gap: 4px;
}

.version-details {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.label {
  color: var(--text-secondary);
}

.value {
  font-weight: 500;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.type-badge.release {
  background: var(--success-background);
  color: var(--success-color);
}

.type-badge.snapshot {
  background: var(--warning-background);
  color: var(--warning-color);
}

.install-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
}
</style>
