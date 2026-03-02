import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue')
  },
  {
    path: '/card/:id',
    name: 'card-detail',
    component: () => import('../views/CardDetailView.vue')
  },
  {
    path: '/random',
    name: 'random',
    component: () => import('../views/RandomView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/sets',
    name: 'sets',
    component: () => import('../views/SetsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
