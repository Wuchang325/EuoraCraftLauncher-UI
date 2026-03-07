<template>
  <div class="glass-message-container">
    <transition-group name="message-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="glass-message"
        :class="[msg.type, { 'closable': msg.closable }]"
        @mouseenter="pauseTimer(msg)"
        @mouseleave="resumeTimer(msg)"
      >
        <div class="message-icon">
          <n-icon size="20" :color="getIconColor(msg.type)">
            <component :is="getIcon(msg.type)" />
          </n-icon>
        </div>

        <div class="message-content">
          <div v-if="msg.title" class="message-title">{{ msg.title }}</div>
          <div class="message-body">{{ msg.content }}</div>
        </div>

        <button v-if="msg.closable" class="close-btn" @click="remove(msg.id)">
          <n-icon size="14"><CloseOutline /></n-icon>
        </button>

        <div v-if="msg.duration > 0" class="message-progress">
          <div 
            class="progress-bar" 
            :style="{ 
              width: `${progressMap[msg.id] || 100}%`,
              backgroundColor: getProgressColor(msg.type)
            }"
          />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NIcon } from 'naive-ui'
import {
  CheckmarkCircleOutline,
  CloseCircleOutline,
  WarningOutline,
  InformationCircleOutline,
  CloseOutline
} from '@vicons/ionicons5'

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface MessageOptions {
  type?: MessageType
  content: string
  title?: string
  duration?: number
  closable?: boolean
  onClose?: () => void
}

interface MessageItem extends MessageOptions {
  id: string
  type: MessageType
  duration: number
  closable: boolean
  startTime: number
  remaining: number
}

const messages = ref<MessageItem[]>([])
const progressMap = ref<Record<string, number>>({})
const timerMap = ref<Record<string, any>>({})

const getIcon = (type: MessageType) => ({
  success: CheckmarkCircleOutline,
  error: CloseCircleOutline,
  warning: WarningOutline,
  info: InformationCircleOutline,
  loading: InformationCircleOutline
}[type])

const getIconColor = (type: MessageType) => ({
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  loading: '#3b82f6'
}[type])

const getProgressColor = (type: MessageType) => getIconColor(type)

const add = (options: MessageOptions) => {
  const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const duration = options.duration ?? 3000
  
  const message: MessageItem = {
    type: 'info',
    closable: true,
    ...options,
    id,
    duration,
    startTime: Date.now(),
    remaining: duration
  }

  messages.value.push(message)
  progressMap.value[id] = 100
  
  if (duration > 0) {
    startTimer(message)
  }
  
  return id
}

const startTimer = (msg: MessageItem) => {
  if (timerMap.value[msg.id]) {
    clearTimeout(timerMap.value[msg.id].timeout)
    clearInterval(timerMap.value[msg.id].interval)
  }
  
  const endTime = Date.now() + msg.remaining
  
  const interval = setInterval(() => {
    const left = Math.max(0, endTime - Date.now())
    progressMap.value[msg.id] = (left / msg.duration) * 100
  }, 50)
  
  const timeout = setTimeout(() => {
    clearInterval(interval)
    remove(msg.id)
  }, msg.remaining)
  
  timerMap.value[msg.id] = { interval, timeout }
}

const pauseTimer = (msg: MessageItem) => {
  const timer = timerMap.value[msg.id]
  if (!timer) return
  
  clearTimeout(timer.timeout)
  clearInterval(timer.interval)
  
  msg.remaining = Math.max(0, msg.duration - (Date.now() - msg.startTime))
}

const resumeTimer = (msg: MessageItem) => {
  if (msg.remaining <= 0) return
  msg.startTime = Date.now()
  startTimer(msg)
}

const remove = (id: string) => {
  const idx = messages.value.findIndex(m => m.id === id)
  if (idx === -1) return
  
  const msg = messages.value[idx]
  const timer = timerMap.value[id]
  if (timer) {
    clearTimeout(timer.timeout)
    clearInterval(timer.interval)
    delete timerMap.value[id]
  }
  
  messages.value.splice(idx, 1)
  delete progressMap.value[id]
  msg.onClose?.()
}

defineExpose({
  add,
  remove,
  success: (content: string, duration?: number) => add({ type: 'success', content, duration }),
  error: (content: string, duration?: number) => add({ type: 'error', content, duration }),
  warning: (content: string, duration?: number) => add({ type: 'warning', content, duration }),
  info: (content: string, duration?: number) => add({ type: 'info', content, duration }),
  loading: (content: string, duration?: number) => add({ type: 'loading', content, duration }),
  clear: () => messages.value.forEach(m => remove(m.id))
})
</script>

<style scoped>
.glass-message-container {
  position: fixed;
  bottom: 24px;
  left: 84px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  width: 320px;
}

:global(.sidebar.expanded) ~ .main-content .glass-message-container {
  left: 260px;
}

.glass-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg-surface);
  backdrop-filter: blur(var(--blur-xl));
  -webkit-backdrop-filter: blur(var(--blur-xl));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  pointer-events: all;
  position: relative;
  overflow: hidden;
  transition: all 0.3s var(--ease-spring);
}

.glass-message.success { border-left: 4px solid #10b981; }
.glass-message.error { border-left: 4px solid #ef4444; }
.glass-message.warning { border-left: 4px solid #f59e0b; }
.glass-message.info { border-left: 4px solid #3b82f6; }
.glass-message.loading { border-left: 4px solid #3b82f6; }

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.message-content {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.message-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-body {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  word-break: break-word;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-disabled);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: all 0.2s ease;
  padding: 0;
}

.glass-message:hover .close-btn {
  opacity: 1;
}

.close-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.message-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--bg-surface-active);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.1s linear;
}

.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.4s var(--ease-spring);
}

.message-list-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.9);
}

.message-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
  margin-top: -76px;
}

.message-list-move {
  transition: transform 0.3s ease;
}

[data-theme="dark"] .glass-message {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .glass-message:hover {
  background: rgba(45, 55, 75, 0.95);
}
</style>