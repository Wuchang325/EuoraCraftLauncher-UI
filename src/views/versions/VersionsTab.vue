<template>
  <div class="tab-pane">
    <div class="toolbar">
      <div class="toolbar-left">
        <h3 class="toolbar-title">
          <UiIcon name="cube" />
          {{ t('versions.download.installNew') }}
        </h3>
      </div>
      <div class="toolbar-right">
        <UiButton
          variant="secondary"
          size="sm"
          icon="icon-refresh"
          @click="fetchVersions"
        >
          {{ t('versions.download.refreshList') }}
        </UiButton>
        <UiButton
          variant="primary"
          size="sm"
          icon="icon-download"
          @click="showInstallDialog = true"
        >
          {{ t('versions.download.installNew') }}
        </UiButton>
        <UiInput
          v-model="searchQuery"
          :placeholder="t('versions.download.searchVersion')"
          icon="icon-search"
          clearable
          class="search-input"
        />
      </div>
    </div>

    <div class="panel versions-list-container">
      <div v-if="loading" class="loading-container">
        <UiIcon name="spinner" class="spin" style="font-size: 32px;" />
        <p>{{ t('versions.download.fetchingList') }}</p>
      </div>

      <div v-else-if="filteredVersions.length === 0" class="empty-state">
        <UiIcon name="cube" />
        <p>{{ t('versions.download.noVersions') }}</p>
      </div>

      <div v-else class="versions-grid">
        <div
          v-for="version in filteredVersions"
          :key="version.id"
          class="version-card"
        >
          <div class="version-card-header">
            <div class="version-icon">
              <UiIcon name="cube" />
            </div>
            <div class="version-info">
              <h4 class="version-name">{{ version.id }}</h4>
              <p class="version-id">{{ version.type === 'release' ? t('versions.download.release') : t('versions.download.snapshot') }}</p>
            </div>
            <div class="version-actions">
              <UiButton
                variant="primary"
                size="sm"
                icon="icon-download"
                @click="downloadVersion(version.id)"
                :loading="downloading === version.id"
              >
                {{ t('common.download') }}
              </UiButton>
            </div>
          </div>

          <div class="version-details">
            <div class="detail-row">
              <span class="detail-label">{{ t('versions.download.releaseDate') }}</span>
              <span class="detail-value">{{ formatDate(version.releaseTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('versions.download.type') }}</span>
              <span class="badge" :class="version.type === 'release' ? 'badge-success' : 'badge-vanilla'">
                {{ version.type === 'release' ? t('versions.download.release') : t('versions.download.snapshot') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安装对话框 -->
    <UiModal
      v-model:visible="showInstallDialog"
      :title="t('versions.download.installNew')"
      :closable="true"
    >
      <div class="path-form">
        <div class="form-group">
          <label>{{ t('versions.download.mcVersion') }}</label>
          <select v-model="installForm.mcVersion" class="form-select">
            <option value="">{{ t('versions.download.selectVersion') }}</option>
            <optgroup :label="t('versions.download.release')">
              <option v-for="v in releaseVersions.slice(0, 20)" :key="v.id" :value="v.id">
                {{ v.id }}
              </option>
            </optgroup>
            <optgroup :label="t('versions.download.snapshot')">
              <option v-for="v in snapshotVersions.slice(0, 10)" :key="v.id" :value="v.id">
                {{ v.id }}
              </option>
            </optgroup>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('versions.download.loader') }}</label>
          <select v-model="installForm.loader" class="form-select">
            <option value="">{{ t('versions.download.vanilla') }}</option>
            <option value="fabric">Fabric</option>
          </select>
        </div>

        <div class="form-group" v-if="installForm.loader === 'fabric'">
          <label>{{ t('versions.download.fabricLoaderVersion') }}</label>
          <select v-model="installForm.loaderVersion" class="form-select">
            <option value="">{{ t('versions.download.latest') }}</option>
            <option v-for="ver in fabricVersions" :key="ver" :value="ver">{{ ver }}</option>
          </select>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <UiButton variant="secondary" @click="showInstallDialog = false">{{ t('common.cancel') }}</UiButton>
          <UiButton 
            variant="primary" 
            @click="startInstall"
            :loading="isInstalling"
            :disabled="!installForm.mcVersion"
          >
            {{ t('versions.download.startInstall') }}
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import UiModal from '@/components/ui/Modal.vue'
import { useGlassMessage } from '@/composables/useGlassMessage'

const { t } = useI18n()
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
    glassMessage.error(t('versions.download.fetchFailed'))
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
    console.error(t('versions.download.fetchFabricFailed'), e)
  }
}

const downloadVersion = async (versionId: string) => {
  downloading.value = versionId
  try {
    const res = await api.installVersion(versionId)
    if (res.success) {
      glassMessage.success(t('versions.download.downloadStarted', { version: versionId }))
    } else {
      glassMessage.error(res.message || t('versions.download.downloadFailed'))
    }
  } catch (e) {
    glassMessage.error(t('versions.download.downloadError'))
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
      glassMessage.success(t('versions.download.installTaskCreated'))
      showInstallDialog.value = false
    } else {
      glassMessage.error(res.message || t('versions.download.installFailed'))
    }
  } catch (e) {
    glassMessage.error(t('versions.download.installError'))
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
