// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/',        name: 'game',    component: () => import('@/views/Game.vue') },
  { path: '/versions', name: 'versions', component: () => import('@/views/Versions.vue') },
  { path: '/instances', name: 'instances', component: () => import('@/views/Instances.vue') },
  { path: '/settings',name:'settings', component: () => import('@/views/Settings.vue') },
]

export default createRouter({ history: createWebHashHistory(), routes })