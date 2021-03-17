import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import LoginPage from '../pages/Login.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/chatRoom',
    name: 'ChatRoom',
    component: () => import('../pages/ChatRoom.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;