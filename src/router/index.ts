import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'ChatRoom',
    component: () => import('../pages/ChatRoom.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;