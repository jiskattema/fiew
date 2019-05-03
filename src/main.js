// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import * as tonal from 'tonal'
import * as detect from 'tonal-detect'
import Basic from './components/Basic.vue'
import Rain from './components/Rain.vue'
import WebAudioTinySynth from 'webaudio-tinysynth'
import WebMidi from 'webmidi'
import utils from './utils'
import * as THREE from 'three'

Object.defineProperty(Vue.prototype, '$THREE', {value: THREE})
Object.defineProperty(Vue.prototype, '$tonal', {value: tonal})
Object.defineProperty(Vue.prototype, '$detect', {value: detect})

Vue.component('basic', Basic)
Vue.component('rain', Rain)

Vue.config.productionTip = true

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})

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
