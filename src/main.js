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
window.utils = require('./utils')

var delay = 30 // desired interval in miliseconds
var previousTimestamp = Date.now()

function tick () {
  var currentTimestamp = Date.now()
  var elapsed = currentTimestamp - previousTimestamp
  var nextDelay = Math.max(delay - elapsed, 20)

  Object.keys(store.state.players).forEach(name => {
    var player = store.state.players[name]
    if (player.tick) {
      player.tick.call(player.scope, elapsed)
    }
  })
  previousTimestamp = currentTimestamp
  setTimeout(tick, nextDelay)
}

tick()
