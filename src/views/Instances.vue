<template>
  <div class="instances-container">
    <div class="header">
      <h2 class="title">
        <UiIcon name="folder" />
        {{ t('instances.title') }}
      </h2>
      <UiButton icon="icon-add">{{ t('common.add') }}</UiButton>
    </div>
    
    <div class="content">
      <div class="placeholder-content">
        <UiIcon name="folder" class="placeholder-icon" style="font-size: 48px; color: var(--text-disabled);" />
        <p>{{ t('common.loading') }}</p>
        <UiButton variant="secondary" @click="createInstance">{{ t('common.add') }}</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useGlassMessage } from '@/composables/useGlassMessage'
import UiButton from '@/components/ui/Button.vue'

const { t } = useI18n()
const message = useGlassMessage()

const createInstance = () => {
  message.info('创建实例功能待实现')
}
</script>

<style scoped>
.instances-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--text-primary);
}

.content {
  flex: 1;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-content {
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
</style>