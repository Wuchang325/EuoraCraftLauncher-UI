<template>
  <div class="instances-container">
    <div class="header">
      <h2 class="title">
        <i class="icon icon-folder" />
        实例管理
      </h2>
      <UiButton icon="icon-add">新建实例</UiButton>
    </div>
    
    <div class="content">
      <div class="placeholder-content">
        <i class="icon icon-folder" style="font-size: 48px; color: var(--text-disabled);" />
        <p>实例管理功能开发中...</p>
        <UiButton variant="secondary" @click="createInstance">创建一个？</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import UiButton from '@/components/ui/Button.vue'

const message = useMessage()

const createInstance = () => {
  message.info('创建实例功能待实现')
}
</script>

<style scoped>
.instances-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--text-primary);
}

.content {
  flex: 1;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 20px;
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
  gap: 16px;
}
</style>