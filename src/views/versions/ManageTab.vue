<template>
  <div class="tab-pane">
    <div class="management-layout">
      <!-- 左侧路径列表 -->
      <div class="paths-panel">
        <div class="panel-header">
          <h3>游戏路径</h3>
          <UiButton
            variant="secondary"
            size="sm"
            icon="icon-plus"
            @click="addNewPath"
          >
            添加
          </UiButton>
        </div>
        
        <div class="paths-list">
          <div
            v-for="(item, index) in gamePaths"
            :key="index"
            :class="['path-item', { active: selectedPathIndex === index }]"
            @click="selectPath(index)"
          >
            <div class="path-info">
              <i class="icon icon-folder"></i>
              <div class="path-text-wrapper">
                <span class="path-name">{{ item.name || '未命名路径' }}</span>
                <span class="path-location" :title="item.path">{{ item.path }}</span>
              </div>
            </div>
            <div class="path-actions">
              <button class="btn-edit" @click.stop="editPath(index)" title="编辑">
                <i class="icon icon-edit"></i>
              </button>
              <button class="btn-remove" @click.stop="removePath(index)" title="删除">
                <i class="icon icon-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="panel-footer">
          <span class="path-count">共 {{ gamePaths.length }} 个路径</span>
        </div>
      </div>
      
      <!-- 右侧版本列表 -->
      <div class="versions-panel">
        <div class="panel-header">
          <div class="header-left">
            <h3>{{ currentPathName }}</h3>
            <span class="version-count" v-if="currentPathVersions.length > 0">
              {{ currentPathVersions.length }} 个版本
            </span>
          </div>
          <div class="right-actions">
            <UiButton
              variant="secondary"
              size="sm"
              :icon="refreshLoading ? 'icon-spinner' : 'icon-refresh'"
              :loading="refreshLoading"
              @click="handleRefresh"
            >
              刷新
            </UiButton>
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
          <!-- 未选择路径 -->
          <div v-if="selectedPathIndex === -1" class="empty-container">
            <i class="icon icon-folder" style="font-size: 48px; color: var(--text-disabled);" />
            <p>请选择左侧的游戏路径</p>
          </div>
          
          <!-- 加载中 -->
          <div v-else-if="loading" class="loading-container">
            <i class="icon icon-spinner spin" style="font-size: 32px;"></i>
            <p>正在扫描版本...</p>
          </div>

          <!-- 空状态 -->
          <div v-else-if="currentPathVersions.length === 0" class="empty-container">
            <i class="icon icon-cube" style="font-size: 48px; color: var(--text-disabled);" />
            <p>该路径下未找到版本</p>
            <p class="hint">路径: {{ currentPath?.path }}</p>
          </div>

          <!-- 版本列表 -->
          <div v-else class="versions-grid">
            <div
              v-for="version in filteredVersions"
              :key="version.folder"
              class="version-card"
              :class="{
                'status-success': version.status === 'success',
                'status-failure': version.status === 'failure'
              }"
            >
              <div class="version-header">
                <div class="version-icon">
                  <i class="icon" :class="getLoaderIcon(version.loader_type)" />
                </div>
                <div class="version-info">
                  <h4 class="version-name">{{ version.folder }}</h4>
                  <p class="version-id">{{ version.version || '未知版本' }}</p>
                </div>
                <div class="version-actions">
                  <UiButton
                    v-if="version.status === 'success'"
                    variant="primary"
                    size="sm"
                    icon="icon-play"
                    @click="handleLaunch(version)"
                  >
                    启动
                  </UiButton>
                  <UiButton
                    variant="text"
                    size="sm"
                    icon="icon-trash"
                    @click="handleDelete(version)"
                  >
                    删除
                  </UiButton>
                </div>
              </div>

              <div class="version-details">
                <div class="detail-item">
                  <span class="label">加载器:</span>
                  <span class="value loader-badge" :class="getLoaderClass(version.loader_type)">
                    {{ getLoaderName(version.loader_type) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">状态:</span>
                  <span class="value status-badge" :class="'status-' + version.status">
                    {{ version.status === 'success' ? '可用' : '损坏' }}
                  </span>
                </div>
                <div v-if="version.error" class="error-message">
                  <i class="icon icon-warning" />
                  <span>{{ version.error }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑路径对话框 -->
    <UiModal
      v-model:visible="showPathModal"
      :title="isEditing ? '编辑路径' : '添加游戏路径'"
      :closable="true"
    >
      <div class="path-form">
        <div class="form-group">
          <label>路径名称</label>
          <UiInput
            v-model="pathForm.name"
            placeholder="例如：正式版、测试服、Fabric整合包"
          />
        </div>
        
        <div class="form-group">
          <label>路径位置</label>
          <div class="input-with-button">
            <UiInput
              v-model="pathForm.path"
              placeholder="请选择或输入Minecraft安装路径"
              readonly
            />
            <UiButton variant="secondary" @click="browseForPath">
              浏览
            </UiButton>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <UiButton variant="secondary" @click="showPathModal = false">取消</UiButton>
          <UiButton 
            variant="primary" 
            @click="savePath"
            :disabled="!pathForm.name || !pathForm.path"
          >
            {{ isEditing ? '保存' : '添加' }}
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGlassMessage } from '@/composables/useGlassMessage'
import { api } from '@/utils/api'
import type { ScannedVersion } from '@/types/api'
import UiModal from '@/components/ui/Modal.vue'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

interface GamePath {
  name: string
  path: string
}

const message = useGlassMessage()

const gamePaths = ref<GamePath[]>([])
const selectedPathIndex = ref<number>(-1)
const showPathModal = ref(false)
const isEditing = ref(false)
const editingIndex = ref(-1)

const pathForm = ref<GamePath>({ name: '', path: '' })

const loading = ref(false)
const refreshLoading = ref(false)
const searchQuery = ref('')
const scannedVersions = ref<ScannedVersion[]>([])

const currentPath = computed(() => 
  selectedPathIndex.value >= 0 ? gamePaths.value[selectedPathIndex.value] : null
)

const currentPathName = computed(() => 
  currentPath.value?.name || '版本列表'
)

const currentPathVersions = computed(() => {
  if (!currentPath.value) return []
  return scannedVersions.value.filter(v => v.path === currentPath.value?.path)
})

const filteredVersions = computed(() => {
  const versions = currentPathVersions.value
  if (!searchQuery.value.trim()) return versions
  const query = searchQuery.value.toLowerCase()
  return versions.filter(v =>
    v.folder.toLowerCase().includes(query) ||
    (v.version && v.version.toLowerCase().includes(query))
  )
})

onMounted(async () => {
  await fetchGamePaths()
})

const fetchGamePaths = async () => {
  try {
    const response = await api.getGameConfig()
    if (response.success && response.data) {
      const paths = response.data.minecraft_paths || []
      // 兼容旧格式（字符串数组）
      gamePaths.value = paths.map((p: any) => {
        if (typeof p === 'string') {
          return { name: getPathNameFromPath(p), path: p }
        }
        return p
      })
      // 默认选中第一个
      if (gamePaths.value.length > 0 && selectedPathIndex.value === -1) {
        selectedPathIndex.value = 0
        await scanCurrentPath()
      }
    }
  } catch (error) {
    console.error('获取游戏配置失败:', error)
  }
}

const getPathNameFromPath = (path: string): string => {
  const parts = path.split(/[\\/]/)
  return parts[parts.length - 1] || '游戏路径'
}

const scanCurrentPath = async () => {
  if (!currentPath.value) return
  
  loading.value = true
  try {
    const response = await api.scanVersions([currentPath.value.path])
    if (response.success) {
      // 为每个版本标记所属路径
      scannedVersions.value = (response.data || []).map((v: ScannedVersion) => ({
        ...v,
        path: currentPath.value?.path
      }))
    }
  } catch (error) {
    console.error('扫描版本失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  refreshLoading.value = true
  await scanCurrentPath()
  refreshLoading.value = false
}

const selectPath = async (index: number) => {
  selectedPathIndex.value = index
  await scanCurrentPath()
}

const addNewPath = () => {
  isEditing.value = false
  editingIndex.value = -1
  pathForm.value = { name: '', path: '' }
  showPathModal.value = true
}

const editPath = (index: number) => {
  isEditing.value = true
  editingIndex.value = index
  pathForm.value = { ...gamePaths.value[index] }
  showPathModal.value = true
}

const browseForPath = async () => {
  try {
    const response = await api.selectDirectory()
    if (response.success && response.data?.path) {
      pathForm.value.path = response.data.path
      // 如果名称未填写，自动生成
      if (!pathForm.value.name) {
        pathForm.value.name = getPathNameFromPath(response.data.path)
      }
    }
  } catch (error) {
    console.error('选择目录失败:', error)
  }
}

const savePath = async () => {
  if (!pathForm.value.name || !pathForm.value.path) return
  
  try {
    const configResponse = await api.getGameConfig()
    if (configResponse.success && configResponse.data) {
      let updatedPaths = [...gamePaths.value]
      
      if (isEditing.value && editingIndex.value >= 0) {
        // 编辑模式
        updatedPaths[editingIndex.value] = { ...pathForm.value }
      } else {
        // 添加模式
        updatedPaths.push({ ...pathForm.value })
      }
      
      await api.updateGameConfig({ 
        ...configResponse.data, 
        minecraft_paths: updatedPaths 
      })
      
      gamePaths.value = updatedPaths
      message.success(isEditing.value ? '路径已更新' : '路径已添加', 2000)
      
      // 如果是新添加的，选中它
      if (!isEditing.value) {
        selectedPathIndex.value = updatedPaths.length - 1
        await scanCurrentPath()
      }
    }
  } catch (error) {
    console.error('保存路径失败:', error)
    message.error('保存失败', 3000)
  }
  
  showPathModal.value = false
}

const removePath = async (index: number) => {
  if (gamePaths.value.length <= 1) {
    message.warning('至少需要保留一个路径')
    return
  }
  
  const removed = gamePaths.value[index]
  gamePaths.value.splice(index, 1)
  
  try {
    const configResponse = await api.getGameConfig()
    if (configResponse.success && configResponse.data) {
      await api.updateGameConfig({ 
        ...configResponse.data, 
        minecraft_paths: gamePaths.value 
      })
    }
  } catch (error) {
    console.error('更新配置失败:', error)
  }
  
  // 调整选中索引
  if (index === selectedPathIndex.value) {
    selectedPathIndex.value = Math.min(index, gamePaths.value.length - 1)
    await scanCurrentPath()
  } else if (index < selectedPathIndex.value) {
    selectedPathIndex.value--
  }
  
  message.info(`已移除: ${removed.name}`)
}

const handleLaunch = (version: ScannedVersion) => {
  message.info(`准备启动 ${version.folder}...`, 2000)
  console.log('启动版本:', version)
}

const handleDelete = (version: ScannedVersion) => {
  console.log('删除版本:', version)
}

const getLoaderIcon = (loaderType: string | null) => {
  switch (loaderType?.toLowerCase()) {
    case 'fabric': return 'icon-lab'
    case 'forge': return 'icon-fire'
    case 'quilt': return 'icon-grid'
    default: return 'icon-cube'
  }
}

const getLoaderName = (loaderType: string | null) => {
  if (!loaderType || loaderType === 'Unknown' || loaderType === 'release' || loaderType === 'snapshot') {
    return '原版'
  }
  return loaderType.charAt(0).toUpperCase() + loaderType.slice(1)
}

const getLoaderClass = (loaderType: string | null) => {
  switch (loaderType?.toLowerCase()) {
    case 'fabric': return 'loader-fabric'
    case 'forge': return 'loader-forge'
    case 'quilt': return 'loader-quilt'
    default: return 'loader-vanilla'
  }
}
</script>

<style scoped>
.tab-pane {
  height: 100%;
  width: 100%;
  padding: 16px;
}

.management-layout {
  display: flex;
  height: 100%;
  gap: 16px;
}

/* 左侧路径面板 */
.paths-panel {
  width: 280px;
  background: var(--background-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.paths-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.path-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.path-item:hover {
  background: var(--background-tertiary);
}

.path-item.active {
  background: var(--primary-color-alpha);
  border: 1px solid var(--primary-color);
}

.path-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  overflow: hidden;
}

.path-info .icon {
  font-size: 20px;
  color: var(--primary-color);
  margin-top: 2px;
}

.path-text-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

.path-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.path-location {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.path-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.path-item:hover .path-actions {
  opacity: 1;
}

.btn-edit,
.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.btn-edit:hover {
  background: var(--background-tertiary);
  color: var(--primary-color);
}

.btn-remove:hover {
  background: var(--error-background);
  color: var(--error-color);
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
}

/* 右侧版本面板 */
.versions-panel {
  flex: 1;
  background: var(--background-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.versions-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.version-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--background-tertiary);
  padding: 2px 10px;
  border-radius: 12px;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 180px;
}

.versions-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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

.hint {
  font-size: 12px;
  opacity: 0.7;
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.version-card {
  background: var(--background-primary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  padding: 16px;
  transition: all 0.2s ease;
}

.version-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.version-card.status-failure {
  opacity: 0.7;
  border-color: var(--error-color);
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

.version-id {
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

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  color: var(--text-secondary);
}

.value {
  font-weight: 500;
}

.loader-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.loader-vanilla {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.loader-fabric {
  background: #0091ea;
  color: white;
}

.loader-forge {
  background: #f57c00;
  color: white;
}

.loader-quilt {
  background: #7b1fa2;
  color: white;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.status-success {
  background: var(--success-background);
  color: var(--success-color);
}

.status-failure {
  background: var(--error-background);
  color: var(--error-color);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--error-color);
  margin-top: 8px;
  padding: 8px;
  background: var(--error-background);
  border-radius: 4px;
}

/* 对话框样式 */
.path-form {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}
</style>
