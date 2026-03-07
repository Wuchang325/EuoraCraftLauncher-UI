<template>
  <div class="blank-modal">
    <slot name="header">
      <!-- 头部内容插槽 -->
    </slot>
    
    <slot 
      name="content" 
      :formData="formData || {}" 
      :updateData="updateData"
    >
      <!-- 内容插槽 - 默认空白 -->
    </slot>
    
    <slot 
      name="footer" 
      :confirm="handleConfirm" 
      :cancel="handleCancel" 
      :isValid="isValid"
    >
      <!-- 底部操作插槽 -->
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  initialData?: Record<string, any>
  validationRules?: Record<string, (value: any) => boolean>
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  validationRules: () => ({})
})

const emit = defineEmits<{
  (e: 'confirm', data: Record<string, any>): void
  (e: 'cancel'): void
  (e: 'update:data', data: Record<string, any>): void
}>()

// 表单数据 - 确保初始数据有效
const formData = ref<Record<string, any>>({})

// 监听初始数据变化
watch(() => props.initialData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    formData.value = { ...newData }
  }
}, { immediate: true })

// 更新数据 - 添加安全检查
const updateData = (key: string, value: any) => {
  if (!formData.value) {
    formData.value = {}
  }
  formData.value[key] = value
  emit('update:data', { ...formData.value })
}

// 验证 - 添加空值检查
const isValid = computed(() => {
  if (!props.validationRules || !formData.value) {
    return true
  }
  
  const rules = props.validationRules
  const data = formData.value
  
  return Object.keys(rules).every(key => {
    const rule = rules[key]
    const value = data[key]
    // 如果规则存在但值为undefined，视为无效
    if (rule && value === undefined) {
      return false
    }
    // 检查rule是否是函数，如果是则调用，否则返回true
    return typeof rule === 'function' ? rule(value) : true
  })
})

// 确认 - 添加安全检查
const handleConfirm = () => {
  if (isValid.value && formData.value) {
    emit('confirm', { ...formData.value })
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.blank-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>

<style scoped>
.path-input-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.path-input-header {
  margin-bottom: 24px;
}

.path-input-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.path-input-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.path-input-form {
  width: 100%;
  max-width: 500px;
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.path-preview {
  margin-top: 8px;
  padding: 8px;
  background: var(--hover-bg);
  border-radius: 4px;
  color: var(--text-secondary);
}

.path-input-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
</style>