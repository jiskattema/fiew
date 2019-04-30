// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Basic from './components/Basic.vue'
import WebAudioTinySynth from 'webaudio-tinysynth'
import WebMidi from 'webmidi'

import * as THREE from 'three'
Object.defineProperty(Vue.prototype, '$THREE', {value: THREE})

Vue.component('basic', Basic)

var notes = {}

function midiNumberToNote (number) {
  // midi note 60 is C4, and 72 is C5
  var names = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'
  ]

  number = 1 * number
  var octave = Math.floor(number / 12)
  var key = names[number - octave * 12]
  return {
    octave: octave,
    key: key
  }
}

Object.defineProperty(Vue.prototype, '$notes', {value: notes})

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
  console.log(evt.note.name + evt.note.octave)
  synth.noteOn(evt.channel, evt.note.number, evt.rawVelocity)
  notes[evt.note.number] = evt.rawVelocity
}

function noteOff (evt) {
  synth.noteOff(evt.channel, evt.note.number)
  notes[evt.note.number] = 0
}

WebMidi.enable(function (err) {
  if (err) {
    console.error('WebMidi enable error:', err)
  } else {
    // console.log(WebMidi.inputs)
    // console.log(WebMidi.outputs)

    var input = WebMidi.getInputByName('Midi Through Port-0')
    input.addListener('noteon', 'all', noteOn)
    input.addListener('noteoff', 'all', noteOff)
  }
})
