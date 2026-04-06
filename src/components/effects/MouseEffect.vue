<template>
  <iframe
    v-if="enabled"
    ref="iframeRef"
    src="/mouse-effect.html"
    class="mouse-effect-iframe"
    frameborder="0"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  enabled: boolean
  color?: string
  scale?: number
  opacity?: number
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  enabled: false,
  color: '45,175,255',
  scale: 1.5,
  opacity: 1.0,
  speed: 1.0
})

const iframeRef = ref<HTMLIFrameElement | null>(null)

const updateEffect = () => {
  if (!iframeRef.value?.contentWindow) return
  const win = iframeRef.value.contentWindow as any
  
  if (win.updateColor) {
    win.updateColor(props.color)
  }
  if (win.updateEffectSettings) {
    win.updateEffectSettings(props.scale, props.opacity, props.speed)
  }
}

watch(() => props.enabled, (val) => {
  if (val) {
    setTimeout(updateEffect, 100)
  }
})

watch(() => [props.color, props.scale, props.opacity, props.speed], () => {
  updateEffect()
}, { deep: true })

onMounted(() => {
  if (props.enabled) {
    setTimeout(updateEffect, 100)
  }
})
</script>

<style scoped>
.mouse-effect-iframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  background: transparent;
}
</style>
