// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Basic from './components/Basic.vue'

import * as THREE from 'three'
Object.defineProperty(Vue.prototype, '$THREE', {value: THREE})

Vue.config.productionTip = true
Vue.component('basic', Basic)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
