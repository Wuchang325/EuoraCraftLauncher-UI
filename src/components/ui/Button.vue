<template>
  <button
    class="ui-btn"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      { 'is-loading': loading, 'is-disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner">
      <i class="icon icon-loading spin" />
    </span>
    <span v-else-if="icon" class="btn-icon">
      <i :class="['icon', icon]" />
    </span>
    <span class="btn-content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { useButtonFeedback } from '@/composables/useAnimation'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const { onClick } = useButtonFeedback()

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  onClick(event)
  emit('click', event)
}
</script>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  user-select: none;
  white-space: nowrap;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 120, 212, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  box-shadow: 0 4px 8px rgba(0, 120, 212, 0.3);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--bg-surface-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-surface-active);
  border-color: var(--text-secondary);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: rgba(0, 120, 212, 0.1);
}

.btn-text {
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-text:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #d13438;
  box-shadow: 0 4px 8px rgba(216, 59, 1, 0.3);
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
  height: 28px;
}

.btn-md {
  padding: 8px 16px;
  font-size: 14px;
  height: 36px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
  height: 48px;
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.is-loading {
  cursor: wait;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>