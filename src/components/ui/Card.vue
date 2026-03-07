<template>
  <div class="ui-card" :class="{ 'hoverable': hoverable }">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="header-content">
          <i v-if="icon" :class="['icon', icon]" />
          <span class="title-text">{{ title }}</span>
        </div>
        <div v-if="$slots.actions" class="header-actions">
          <slot name="actions" />
        </div>
      </slot>
    </div>
    
    <div class="card-body" :class="bodyClass">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  icon?: string
  hoverable?: boolean
  bodyClass?: string
}>()
</script>

<style scoped>
.ui-card {
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ui-card.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--divider-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.title-text {
  line-height: 1.2;
}

.card-body {
  padding: 20px;
  flex: 1;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--divider-color);
  background-color: var(--bg-surface-hover);
}
</style>