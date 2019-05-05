// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router'
import WebAudioTinySynth from 'webaudio-tinysynth'
import WebMidi from 'webmidi'

import * as THREE from 'three'
import * as tonal from 'tonal'
import * as detect from 'tonal-detect'

import App from './App.vue'
import Home from './components/Home.vue'
import Basic from './components/Basic.vue'
import Rain from './components/Rain.vue'
import utils from './utils'

Object.defineProperty(Vue.prototype, '$THREE', {value: THREE})
Object.defineProperty(Vue.prototype, '$tonal', {value: tonal})
Object.defineProperty(Vue.prototype, '$detect', {value: detect})

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
  }
]})

Vue.config.productionTip = true

var app = new Vue({
  router,
  components: { App },
  template: '<App/>'
})
app.$mount('#app')

var synth = new WebAudioTinySynth({
  quality: 1,
  useReverb: 0,
  voices: 32
})

function noteOn (evt) {
  synth.noteOn(evt.channel, evt.note.number, evt.rawVelocity)
  utils.noteOn(evt)
}

function noteOff (evt) {
  synth.noteOff(evt.channel, evt.note.number)
  utils.noteOff(evt)
}

WebMidi.enable(function (err) {
  if (err) {
    console.error('WebMidi enable error:', err)
  } else {
    alert('Input:' + WebMidi.inputs[0].name)
    var input = WebMidi.inputs[0]
    input.addListener('noteon', 'all', noteOn)
    input.addListener('noteoff', 'all', noteOff)
  }
})

utils.tick()
