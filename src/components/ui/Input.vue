<template>
  <div class="ui-input-wrapper" :class="{ 'is-focused': isFocused, 'is-disabled': disabled }">
    <i v-if="prefixIcon" :class="['icon', prefixIcon, 'prefix-icon']" />
    
    <input
      ref="inputRef"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="ui-input"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown.enter="$emit('enter')"
    />
    
    <i 
      v-if="clearable && modelValue" 
      class="icon icon-close clear-icon" 
      @click="handleClear"
    />
    
    <i v-if="suffixIcon" :class="['icon', suffixIcon, 'suffix-icon']" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  prefixIcon?: string
  suffixIcon?: string
}>(), {
  type: 'text',
  modelValue: '',
  disabled: false,
  readonly: false,
  clearable: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'enter'): void
  (e: 'clear'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}
</script>

<style scoped>
.ui-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  width: 100%;
  position: relative;
}

.ui-input-wrapper:hover:not(.is-disabled) {
  border-color: var(--text-secondary);
  background-color: var(--bg-surface);
}

.ui-input-wrapper.is-focused {
  border-color: var(--color-primary);
  background-color: var(--bg-surface);
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

.ui-input-wrapper.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--bg-surface-hover);
}

.ui-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  width: 100%;
  padding: 0;
}

.ui-input::placeholder {
  color: var(--text-disabled);
}

.icon {
  font-size: 16px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-icon {
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-icon:hover {
  background-color: var(--bg-surface-active);
  color: var(--text-primary);
}

.prefix-icon {
  margin-right: 4px;
}

.suffix-icon {
  margin-left: 4px;
}
</style>