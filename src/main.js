// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './store'
import router from './router'

import App from './App.vue'

Vue.config.productionTip = true

var app = new Vue({
  store,
  router,
  components: { App },
  template: '<App/>'
})
app.$mount('#app')

store.dispatch('connectToMidi')

var delay = 200
function tick () {
  Object.keys(store.state.players).forEach(name => {
    var player = store.state.players[name]
    if (player.tick) {
      player.tick.call(player.scope)
    }
  })
  setTimeout(tick, delay)
}

tick()

window.utils = require('./utils')
