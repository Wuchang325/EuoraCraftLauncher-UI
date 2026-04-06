<template>
  <div class="home-container" ref="homeMainRef">
    <div class="home-left" ref="homeLeftRef">
    </div>

    <div class="home-right" ref="homeRightRef">
      <UiCard class="account-card" body-class="account-card-body">
        <div class="account-info">
          <img class="avatar" :src="currentAccountAvatarUrl" alt="avatar" />
          <div class="user-details">
            <div class="name">{{ currentAccount?.alias || 'Steve' }}</div>
            <div class="type">{{ accountTypeLabel }}</div>
          </div>
          <UiButton variant="text" size="sm" icon="icon-settings" @click="openAccountModal">
            {{ t('game.manage') }}
          </UiButton>
        </div>
      </UiCard>

      <UiCard class="version-card" :title="t('game.gameVersion')" icon="icon-cube" body-class="version-card-body">
        <div class="version-list" ref="versionListRef">
          <div v-if="loading" class="flex-center" style="padding: 20px;">
            <span class="text-secondary">{{ t('app.loading') }}</span>
          </div>
          
          <div v-else-if="versions.length === 0" class="flex-center" style="padding: 20px;">
            <span class="text-secondary">{{ t('game.noVersions') }}</span>
          </div>
          
          <div
            v-else
            v-for="(ver, index) in versions"
            :key="ver.id"
            @click="selectVersion(ver.id)"
            :class="['version-item', { active: selectedVersion === ver.id }]"
          >
            <span class="version-name">{{ ver.id }}</span>
            <span class="version-tag">{{ ver.type }}</span>
          </div>
        </div>

        <div class="launch-section">
          <UiButton
            class="launch-btn"
            @click="launchGame"
            :disabled="launching || !selectedVersion || !currentAccount"
            :loading="launching"
            size="lg"
            icon="icon-game"
          >
            {{ launching ? t('game.launching') : t('game.launch') }}
          </UiButton>
        </div>

        <div v-if="statusMsg" :class="['status-msg', `text-${statusType}`]">
          {{ statusMsg }}
        </div>
      </UiCard>
    </div>

    <!-- 账户管理全屏弹窗 -->
    <ContentModal
      v-model:visible="showAccountModal"
      :title="t('game.accountManagement')"
      fullscreen
    >
      <div class="account-manager">
        <!-- 左侧：账户列表 -->
        <div class="account-list-section">
          <h3 class="section-title">
            <i class="icon icon-folder" />
            {{ t('game.savedAccounts') }}
          </h3>
          <div class="account-list-card">
            <!-- 加载状态 -->
            <div v-if="accountsLoading" class="flex-center" style="padding: 40px;">
              <span class="text-secondary">{{ t('app.loading') }}</span>
            </div>
            
            <!-- 空状态 -->
            <div v-else-if="accounts.length === 0" class="empty-state">
              <i class="icon icon-user-x" />
              <p class="empty-state-text">{{ t('game.noAccounts') }}</p>
              <p class="text-secondary" style="font-size: 12px;">{{ t('game.noAccountsDesc') }}</p>
            </div>
            
            <!-- 账户列表 -->
            <div v-else class="account-items">
              <div 
                v-for="account in accounts" 
                :key="account.id"
                :class="['account-item', { active: account.isCurrent }]"
              >
                <img class="acc-avatar" :src="getAccountAvatarUrl(account)" :data-type="account.type" alt="avatar" />
                <div class="acc-info">
                  <div class="acc-name">{{ account.alias }}</div>
                  <div class="acc-type">
                    <span :class="['type-badge', account.type]">
                      {{ account.type === 'microsoft' ? t('game.accountTypeMicrosoft') : t('game.accountTypeOffline') }}
                    </span>
                    <span v-if="account.type === 'microsoft' && account.email" class="acc-email">{{ account.email }}</span>
                  </div>
                </div>
                <div class="acc-actions">
                  <span v-if="account.isCurrent" class="acc-status">{{ t('game.current') }}</span>
                  <UiButton 
                    v-else
                    variant="secondary" 
                    size="sm"
                    @click="switchAccount(account.id)"
                  >
                    {{ t('game.switch') }}
                  </UiButton>
                  <UiButton 
                    variant="ghost" 
                    size="sm"
                    icon="icon-delete"
                    @click="removeAccount(account.id, account.alias)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧：添加账户 -->
        <div class="account-add-section">
          <!-- 添加离线账户 -->
          <h3 class="section-title">
            <i class="icon icon-add" />
            {{ t('game.addOfflineAccount') }}
          </h3>
          <div class="add-account-card">
            <div class="add-form">
              <div class="form-group">
                <label class="form-label">{{ t('game.username') }}</label>
                <UiInput 
                  v-model="newOfflineUsername" 
                  :placeholder="t('game.enterUsername')" 
                  @keyup.enter="addOfflineAccount"
                />
                <span class="form-hint">{{ t('game.offlineNoPassword') }}</span>
              </div>
              <UiButton 
                variant="primary" 
                icon="icon-add"
                :loading="addingOffline"
                :disabled="!newOfflineUsername.trim()"
                @click="addOfflineAccount"
              >
                {{ t('game.addOfflineAccount') }}
              </UiButton>
            </div>
          </div>

          <!-- 添加微软账户 -->
          <h3 class="section-title" style="margin-top: 20px;">
            <i class="icon icon-microsoft" />
            {{ t('game.addMicrosoftAccount') }}
          </h3>
          <div class="add-account-card">
            <div class="add-form">
              <p class="form-hint" style="margin-bottom: 12px;">
                {{ t('game.login.step1') }}
              </p>
              <UiButton 
                variant="primary" 
                icon="icon-log-in"
                :loading="startingMicrosoftLogin"
                @click="startMicrosoftLogin"
              >
                {{ t('game.addMicrosoftAccount') }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <UiButton variant="secondary" @click="showAccountModal = false">{{ t('game.close') }}</UiButton>
      </template>
    </ContentModal>

    <!-- 微软登录弹窗 -->
    <ContentModal
      v-model:visible="showMicrosoftLoginModal"
      :title="t('game.login.title')"
      :closable="false"
    >
      <div class="microsoft-login-content">
        <div v-if="microsoftLoginStatus === 'pending'" class="login-pending">
          <div class="login-step">
            <p class="step-label">{{ t('game.login.step1') }}</p>
            <a :href="microsoftLoginData.verificationUri" target="_blank" class="login-link">
              {{ microsoftLoginData.verificationUri }}
            </a>
          </div>
          <div class="login-step">
            <p class="step-label">{{ t('game.login.step2') }}</p>
            <div class="user-code-box">
              <code class="user-code">{{ microsoftLoginData.userCode }}</code>
              <UiButton 
                variant="secondary" 
                size="sm"
                @click="copyUserCode"
              >
                {{ copiedUserCode ? t('game.login.copied') : t('game.login.copyCode') }}
              </UiButton>
            </div>
          </div>
          <p class="login-waiting">{{ t('game.login.waiting') }}</p>
        </div>
        
        <div v-else-if="microsoftLoginStatus === 'loading'" class="login-loading">
          <span class="text-secondary">{{ t('game.login.waiting') }}</span>
        </div>
        
        <div v-else-if="microsoftLoginStatus === 'error'" class="login-error">
          <p class="text-error">{{ microsoftLoginError }}</p>
        </div>
      </div>
      
      <template #footer>
        <UiButton variant="secondary" @click="cancelMicrosoftLogin">{{ t('common.cancel') }}</UiButton>
        <UiButton 
          variant="primary" 
          :loading="completingMicrosoftLogin"
          @click="completeMicrosoftLogin"
        >
          {{ t('game.login.complete') }}
        </UiButton>
      </template>
    </ContentModal>

    <!-- 删除确认弹窗 -->
    <ContentModal
      v-model:visible="showDeleteConfirmModal"
      type="confirm"
      :title="t('common.confirm')"
      show-backdrop
    >
      <p>{{ deleteConfirmMessage }}</p>
      
      <template #footer>
        <UiButton variant="secondary" @click="showDeleteConfirmModal = false">
          {{ t('common.cancel') }}
        </UiButton>
        <UiButton variant="danger" :loading="deletingAccount" @click="confirmRemoveAccount">
          {{ t('common.delete') }}
        </UiButton>
      </template>
    </ContentModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useGlassMessage } from '@/composables/useGlassMessage'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import '@/style/views/Game.css'
import UiCard from '@/components/ui/Card.vue'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import ContentModal from '@/components/modals/ContentModal.vue'
import { api } from '@/utils/api'

const message = useGlassMessage()
const { t } = useI18n()

// ========== 版本管理 ==========
const versions = ref<any[]>([])
const selectedVersion = ref<string>('')
const loading = ref(false)
const launching = ref(false)
const statusMsg = ref<string>('')
const statusType = ref<'info' | 'success' | 'error'>('info')

// ========== 账户管理 ==========
const showAccountModal = ref(false)
const accounts = ref<any[]>([])
const currentAccount = ref<any>(null)
const accountsLoading = ref(false)

// 添加离线账户
const newOfflineUsername = ref('')
const addingOffline = ref(false)

// 微软登录
const showMicrosoftLoginModal = ref(false)
const startingMicrosoftLogin = ref(false)
const completingMicrosoftLogin = ref(false)
const microsoftLoginStatus = ref<'pending' | 'loading' | 'error'>('pending')
const microsoftLoginData = ref<{ userCode: string; verificationUri: string }>({ userCode: '', verificationUri: '' })
const microsoftLoginError = ref('')
const copiedUserCode = ref(false)

// 删除确认
const showDeleteConfirmModal = ref(false)
const deletingAccount = ref(false)
const accountToDelete = ref<{ id: string; alias: string } | null>(null)
const deleteConfirmMessage = computed(() => {
  if (!accountToDelete.value) return ''
  return t('game.deleteConfirm', { name: accountToDelete.value.alias })
})

import { getAvatarUrlByUuid, getMCCAGAvatarUrl } from '@/utils/skinRenderer'

// 当前账户头像 URL
const currentAccountAvatarUrl = computed(() => {
  return getAvatarUrlByUuid(currentAccount.value?.uuid, { size: 64, showHat: true })
})

// 获取账户头像 URL - MCCAG 风格（无背景、仅头部带帽子）
function getAccountAvatarUrl(account: { uuid?: string; alias?: string; type?: string }): string {
  // 微软账户使用 MCCAG API 获取更美观的渲染
  if (account.type === 'microsoft' && account.alias) {
    return getMCCAGAvatarUrl(account.alias, { type: 'head' })
  }
  // 离线账户或其他使用 Crafatar
  return getAvatarUrlByUuid(account.uuid, { size: 64, showHat: true })
}

// 账户类型标签
const accountTypeLabel = computed(() => {
  if (!currentAccount.value) return t('game.offlineAccount')
  return currentAccount.value.type === 'microsoft' 
    ? t('game.microsoftAccount') 
    : t('game.offlineAccount')
})

const homeMainRef = ref<HTMLElement | null>(null)
const homeLeftRef = ref<HTMLElement | null>(null)
const homeRightRef = ref<HTMLElement | null>(null)

// ========== 版本管理方法 ==========
async function loadVersions() {
  loading.value = true
  try {
    const configRes = await api.getGameConfig()
    if (!configRes.success || !configRes.data?.minecraft_paths?.length) {
      showStatus(t('game.status.noGameDir'), 'error')
      return
    }
    
    const scanRes = await api.scanVersions(configRes.data.minecraft_paths)
    if (scanRes.success && scanRes.data) {
      versions.value = scanRes.data
        .filter((v: any) => v.status === 'success')
        .map((v: any) => ({ id: v.folder, type: v.loader_type || 'Vanilla' }))
      
      if (versions.value.length > 0 && !selectedVersion.value) {
        selectedVersion.value = versions.value[0].id
      }
      showStatus(t('game.status.foundVersions', { count: versions.value.length }), 'success')
    } else {
      showStatus(t('game.status.scanFailed'), 'error')
    }
  } catch (e) {
    showStatus(t('game.status.fetchFailed'), 'error')
  } finally {
    loading.value = false
  }
}

function selectVersion(id: string) {
  selectedVersion.value = id
}

async function launchGame() {
  if (!selectedVersion.value) {
    showStatus(t('game.status.selectVersionFirst'), 'error')
    return
  }
  
  if (!currentAccount.value) {
    showStatus(t('game.status.noAccount'), 'error')
    message.error(t('game.status.noAccount'))
    return
  }
  
  launching.value = true
  showStatus(t('game.status.launching'), 'info')
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    showStatus(t('game.status.launchSuccess'), 'success')
    message.success(t('game.status.launchSuccess'))
  } catch (e) {
    showStatus(t('game.status.launchError'), 'error')
    message.error(t('game.status.launchError'))
  } finally {
    launching.value = false
  }
}

function showStatus(msg: string, type: 'info' | 'success' | 'error' = 'info') {
  statusMsg.value = msg
  statusType.value = type
  setTimeout(() => {
    if (statusMsg.value === msg) {
      statusMsg.value = ''
    }
  }, 5000)
}

// ========== 账户管理方法 ==========
async function loadAccounts() {
  accountsLoading.value = true
  try {
    const res = await api.getAccounts()
    if (res.success && res.data) {
      accounts.value = res.data.accounts || []
      currentAccount.value = res.data.current
    }
  } catch (e) {
    console.error('加载账户失败:', e)
    message.error('加载账户失败')
  } finally {
    accountsLoading.value = false
  }
}

function openAccountModal() {
  showAccountModal.value = true
  loadAccounts()
}

async function addOfflineAccount() {
  const username = newOfflineUsername.value.trim()
  if (!username) {
    message.error(t('game.status.emptyUsername'))
    return
  }
  
  addingOffline.value = true
  try {
    const res = await api.addOfflineAccount(username)
    if (res.success) {
      message.success(t('game.status.accountAdded'))
      newOfflineUsername.value = ''
      await loadAccounts()
    } else {
      message.error(res.message || t('game.status.accountAddFailed'))
    }
  } catch (e) {
    message.error(t('game.status.accountAddFailed'))
  } finally {
    addingOffline.value = false
  }
}

async function switchAccount(accountId: string) {
  try {
    const res = await api.switchAccount(accountId)
    if (res.success) {
      message.success(t('game.status.accountSwitched'))
      await loadAccounts()
      // 更新主页面的当前账户显示
      const accountsRes = await api.getAccounts()
      if (accountsRes.success && accountsRes.data) {
        currentAccount.value = accountsRes.data.current
      }
    } else {
      message.error(res.message || t('game.status.accountSwitchFailed'))
    }
  } catch (e) {
    message.error(t('game.status.accountSwitchFailed'))
  }
}

function removeAccount(accountId: string, alias: string) {
  accountToDelete.value = { id: accountId, alias }
  showDeleteConfirmModal.value = true
}

async function confirmRemoveAccount() {
  if (!accountToDelete.value) return
  
  deletingAccount.value = true
  try {
    const res = await api.removeAccount(accountToDelete.value.id)
    if (res.success) {
      message.success(t('game.status.accountRemoved'))
      showDeleteConfirmModal.value = false
      await loadAccounts()
      // 更新主页面的当前账户显示
      const accountsRes = await api.getAccounts()
      if (accountsRes.success && accountsRes.data) {
        currentAccount.value = accountsRes.data.current
      }
    } else {
      message.error(res.message || t('game.status.accountRemoveFailed'))
    }
  } catch (e) {
    message.error(t('game.status.accountRemoveFailed'))
  } finally {
    deletingAccount.value = false
    accountToDelete.value = null
  }
}

// ========== 微软登录方法 ==========
async function startMicrosoftLogin() {
  startingMicrosoftLogin.value = true
  try {
    const res = await api.startMicrosoftLogin()
    if (res.success) {
      if (res.data?.status === 'completed') {
        // 已经有缓存，直接完成
        message.success(t('game.login.success'))
        await loadAccounts()
      } else if (res.data?.status === 'pending') {
        // 需要用户到浏览器授权
        microsoftLoginData.value = {
          userCode: res.data.userCode || '',
          verificationUri: res.data.verificationUri || ''
        }
        microsoftLoginStatus.value = 'pending'
        showMicrosoftLoginModal.value = true
      } else {
        message.error(res.data?.message || t('game.login.failed'))
      }
    } else {
      message.error(res.message || t('game.login.failed'))
    }
  } catch (e) {
    message.error(t('game.login.failed'))
  } finally {
    startingMicrosoftLogin.value = false
  }
}

async function completeMicrosoftLogin() {
  completingMicrosoftLogin.value = true
  microsoftLoginStatus.value = 'loading'
  try {
    const res = await api.completeMicrosoftLogin()
    if (res.success) {
      message.success(t('game.login.success'))
      showMicrosoftLoginModal.value = false
      await loadAccounts()
      // 更新主页面的当前账户显示
      const accountsRes = await api.getAccounts()
      if (accountsRes.success && accountsRes.data) {
        currentAccount.value = accountsRes.data.current
      }
    } else {
      microsoftLoginStatus.value = 'error'
      microsoftLoginError.value = res.message || t('game.login.failed')
    }
  } catch (e) {
    microsoftLoginStatus.value = 'error'
    microsoftLoginError.value = t('game.login.failed')
  } finally {
    completingMicrosoftLogin.value = false
  }
}

function cancelMicrosoftLogin() {
  showMicrosoftLoginModal.value = false
  microsoftLoginStatus.value = 'pending'
  microsoftLoginError.value = ''
}

async function copyUserCode() {
  try {
    await navigator.clipboard.writeText(microsoftLoginData.value.userCode)
    copiedUserCode.value = true
    setTimeout(() => {
      copiedUserCode.value = false
    }, 2000)
  } catch (e) {
    console.error('复制失败:', e)
  }
}

onMounted(() => {
  const tl = gsap.timeline({ delay: 0.1 })
  
  tl.fromTo(homeLeftRef.value,
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
  )
  .fromTo(homeRightRef.value,
    { x: 30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
    '-=0.25'
  )
  
  loadVersions()
  // 加载当前账户
  api.getCurrentAccount().then(res => {
    if (res.success && res.data) {
      currentAccount.value = res.data
    }
  })
})

// 离开页面时关闭弹窗
onBeforeUnmount(() => {
  showAccountModal.value = false
  showMicrosoftLoginModal.value = false
  showDeleteConfirmModal.value = false
})
</script>

<style scoped>
.account-card {
  margin-bottom: 12px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.account-info .user-details {
  flex: 1;
}

.version-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.home-right {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ==================== 账户管理弹窗内容 ==================== */
.account-manager {
  display: flex;
  gap: 20px;
  padding: 16px;
  height: 100%;
}

/* 左侧：已保存账户列表 */
.account-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title .icon {
  color: var(--color-primary);
  font-size: 16px;
}

.account-list-card {
  flex: 1;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 12px;
  overflow-y: auto;
}

.account-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-app);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

.account-item:hover {
  border-color: var(--color-primary);
  background: var(--bg-surface-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.account-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.acc-avatar {
  width: 48px;
  height: 48px;
  border-radius: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  overflow: hidden;
  /* 像素化渲染 */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
}

.acc-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.acc-avatar[data-type="offline"] {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
}

.acc-avatar span {
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.acc-info {
  flex: 1;
  min-width: 0;
}

.acc-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.acc-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.type-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 10px;
}

.type-badge.microsoft {
  background: rgba(0, 120, 212, 0.15);
  color: #0078d4;
}

.type-badge.offline {
  background: rgba(100, 116, 139, 0.15);
  color: #64748b;
}

.acc-email {
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.acc-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.acc-status {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-primary);
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-sm);
}

[data-theme="dark"] .acc-status {
  background: rgba(255, 255, 255, 0.1);
}

/* 右侧：添加账户 */
.account-add-section {
  width: 300px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.add-account-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 16px;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-hint {
  font-size: 11px;
  color: var(--text-disabled);
  margin-top: 2px;
  line-height: 1.4;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  text-align: center;
}

.empty-state .icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state-text {
  font-size: 14px;
  margin-bottom: 4px;
}

/* 微软登录弹窗 */
.microsoft-login-content {
  padding: 8px;
}

.login-pending {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-step {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.login-link {
  font-size: 14px;
  color: var(--color-primary);
  word-break: break-all;
  padding: 10px 14px;
  background: var(--bg-app);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  text-decoration: none;
}

.login-link:hover {
  background: var(--bg-surface-hover);
}

.user-code-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-app);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.user-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
  flex: 1;
}

.login-waiting {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.login-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}
</style>