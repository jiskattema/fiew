import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './components/Home.vue'
import Basic from './components/Basic.vue'
import Rain from './components/Rain.vue'
import DFT from './components/DFT.vue'

Vue.use(VueRouter)
const router = new VueRouter({ routes: [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/basic',
    name: 'basic',
    component: Basic
  },
  {
    path: '/rain',
    name: 'rain',
    component: Rain
  },
  {
    path: '/dft',
    name: 'DFT',
    component: DFT
  }
]})

export default router
