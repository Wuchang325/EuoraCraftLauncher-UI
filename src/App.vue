 <template>
  <n-config-provider 
    :theme="naiveTheme" 
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-dialog-provider>
      <n-message-provider>
        <n-notification-provider>
          <div id="app">
            <div class="app-background"></div>
            <TitleBar class="app-layer" />
            <div class="app-container app-layer">
              <SideBar />
              <main class="main-content">
                <router-view v-slot="{ Component }">
                  <transition 
                    name="page" 
                    mode="out-in"
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @leave="leave"
                  >
                    <component :is="Component" />
                  </transition>
                </router-view>
              </main>
            </div>
            
            <GlassMessage ref="messageRef" />
          </div>
        </n-notification-provider>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  NConfigProvider, 
  NDialogProvider, 
  NMessageProvider, 
  NNotificationProvider,
  zhCN,
  dateZhCN 
} from 'naive-ui'
import TitleBar from '@/components/layout/TitleBar.vue'
import SideBar  from '@/components/layout/SideBar.vue'
import GlassMessage from '@/components/ui/GlassMessage.vue'
import { useTheme } from '@/composables/useTheme'
import { usePageTransition } from '@/composables/useAnimation'
import { setMessageRef } from '@/composables/useGlassMessage'

const { naiveTheme, themeOverrides, initTheme } = useTheme()
const { beforeEnter, enter, leave } = usePageTransition()

const messageRef = ref<InstanceType<typeof GlassMessage> | null>(null)

onMounted(async () => {
  if (messageRef.value) {
    setMessageRef(messageRef.value)
  }
  
  const initializeApp = async () => {
    console.log('[App] 开始初始化应用配置...')
    try {
      await initTheme()
      console.log('[App] 应用配置初始化完成')
    } catch (e) {
      console.error('[App] 初始化失败:', e)
    }
  }
  
  if (window.pywebview?.api) {
    await initializeApp()
  } else {
    window.addEventListener('pywebviewready', initializeApp)
  }
})
</script>

<style>
.app-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f3f3f3;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(var(--bg-blur));
  transform: scale(1.1);
  z-index: 0;
  transition: background-image 0.5s ease, filter 0.5s ease, background-color 0.5s ease;
}

.app-background::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

[data-theme="dark"] .app-background {
  background-color: #202020;
}

[data-theme="dark"] .app-background::after {
  background-color: rgba(0, 0, 0, 0.4);
}

.app-layer {
  position: relative;
  z-index: 1;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s var(--ease-spring);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.main-content {
  position: relative;
}
</style>