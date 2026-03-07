<template>
  <div class="tab-pane">
    <div class="settings-group">
      <div class="group-title">
        <i class="icon icon-game" />
        运行设置
      </div>
      
      <!--<div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">游戏目录</div>
          <div class="setting-desc">Minecraft 游戏文件存储路径</div>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <UiInput v-model="localSettings.gamePath" readonly placeholder="选择游戏目录" />
            <UiButton variant="secondary" @click="selectGamePath">浏览</UiButton>
          </div>
        </div>
      </div>-->

      <!--<div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">Java 路径</div>
          <div class="setting-desc">Java 运行时环境的可执行文件路径</div>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <UiInput v-model="localSettings.javaPath" readonly placeholder="选择 Java 路径" />
            <UiButton variant="secondary" @click="selectJavaPath">浏览</UiButton>
          </div>
        </div>
      </div>-->

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">分配内存</div>
          <div class="setting-desc">分配给游戏的内存大小 (MB)</div>
        </div>
        <div class="setting-control">
          <div class="slider-container">
            <input type="range" v-model.number="localSettings.memory" min="1024" max="16384" step="512" />
            <span class="slider-value">{{ localSettings.memory }} MB</span>
          </div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">全屏启动</div>
          <div class="setting-desc">启动游戏时自动全屏</div>
        </div>
        <div class="setting-control">
          <UiSwitch v-model="localSettings.fullscreen" />
        </div>
      </div>
      
      <!--<div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">保存配置</div>
          <div class="setting-desc">应用当前设置</div>
        </div>
        <div class="setting-control">
          <UiButton variant="primary" @click="saveGameConfig">保存</UiButton>
        </div>
      </div>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import UiSwitch from '@/components/ui/Switch.vue'
import {
  getGameConfig,
  updateGameConfig,
  getDownloadConfig,
  updateDownloadConfig,
  selectDirectory
} from '@/utils/api'

const props = defineProps<{
  settings: any
}>()

const emit = defineEmits<{
  (e: 'update:settings', value: any): void
}>()

const localSettings = computed({
  get: () => props.settings,
  set: (val) => emit('update:settings', val)
})

const message = useMessage()

const originalGameConfig = ref<any>(null)
const originalDownloadConfig = ref<any>(null)

const initOriginalConfigs = () => {
  if (props.settings) {
    originalGameConfig.value = {
      java_auto_select: props.settings.javaAutoSelect,
      java_path: props.settings.javaPath,
      memory_size: props.settings.memory,
      minecraft_paths: [props.settings.gamePath || './.minecraft']
    }
    originalDownloadConfig.value = {
      mirror_source: props.settings.downloadSource,
      download_threads: props.settings.downloadThreads
    }
  }
}

watch(() => props.settings, () => {
  initOriginalConfigs()
}, { immediate: true })

const selectGamePath = async () => {
  try {
    const result = await selectDirectory()
    if (result.success && result.data?.path) {
      localSettings.value.gamePath = result.data.path
      message.success(`已选择游戏目录: ${result.data.path}`)
    } else {
      message.warning('用户取消选择目录')
    }
  } catch (error) {
    console.error('选择游戏目录失败:', error)
    message.error('选择游戏目录失败')
  }
}

const selectJavaPath = async () => {
  try {
    const result = await selectDirectory()
    if (result.success && result.data?.path) {
      localSettings.value.javaPath = result.data.path
      message.success(`已选择Java路径: ${result.data.path}`)
    } else {
      message.warning('用户取消选择目录')
    }
  } catch (error) {
    console.error('选择Java路径失败:', error)
    message.error('选择Java路径失败')
  }
}

const hasGameConfigChanged = (): boolean => {
  if (!originalGameConfig.value) return true
  
  const currentConfig = {
    java_auto_select: localSettings.value.javaAutoSelect,
    java_path: localSettings.value.javaPath,
    memory_size: localSettings.value.memory,
    minecraft_paths: [localSettings.value.gamePath || './.minecraft']
  }
  
  return JSON.stringify(currentConfig) !== JSON.stringify({
    java_auto_select: originalGameConfig.value.java_auto_select,
    java_path: originalGameConfig.value.java_path,
    memory_size: originalGameConfig.value.memory_size,
    minecraft_paths: originalGameConfig.value.minecraft_paths
  })
}

const hasDownloadConfigChanged = (): boolean => {
  if (!originalDownloadConfig.value) return true
  
  return localSettings.value.downloadSource !== originalDownloadConfig.value.mirror_source ||
         localSettings.value.downloadThreads !== originalDownloadConfig.value.download_threads
}

const saveGameConfig = async () => {
  try {
    if (window.pywebview && window.pywebview.api) {
      let hasChanges = false
      
      if (hasGameConfigChanged()) {
        const gameConfig = {
          java_auto_select: localSettings.value.javaAutoSelect,
          java_path: localSettings.value.javaPath,
          memory_size: localSettings.value.memory,
          minecraft_paths: [localSettings.value.gamePath || './.minecraft']
        }
        
        const gameResult = await updateGameConfig(gameConfig)
        if (!gameResult.success) {
          throw new Error(gameResult.message || '更新游戏配置失败')
        }
        hasChanges = true
      }
      
      if (hasDownloadConfigChanged()) {
        const downloadConfig = {
          mirror_source: localSettings.value.downloadSource,
          download_threads: localSettings.value.downloadThreads
        };
        
        const downloadResult = await updateDownloadConfig(downloadConfig);
        if (!downloadResult.success) {
          throw new Error(downloadResult.message || '更新下载配置失败');
        }
        hasChanges = true
      }
      
      if (hasChanges) {
        message.success('配置已保存')
        initOriginalConfigs()
      } else {
        message.info('配置未发生变化')
      }
    }
  } catch (error: any) {
    console.error('保存游戏配置失败:', error)
    message.error(`保存游戏配置失败: ${error.message}`)
  }
}



</script>

<style scoped src="@/style/views/Settings.css"></style>

<style scoped>
.tab-pane {
  max-width: 800px;
  margin: 0 auto;
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.input-group :deep(.ui-input-wrapper) {
  flex: 1;
  width: auto;
}

.input-group :deep(.ui-btn) {
  flex-shrink: 0;
}
</style>