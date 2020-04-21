import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/sandbox',
    name: 'Sandbox',
    // route level code-splitting
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "sandbox" */ '../views/Sandbox.vue')
  },
  {
    path: '/maps',
    name: 'Maps',
    component: () => import('../views/Maps.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
