import Vue from 'vue'
import Vuex from 'vuex'

import WebMidi from 'webmidi'
import { Jukebox } from './jukebox'
import { Piano } from './piano'

const DEVICE_OFF = 'OFF'

Vue.use(Vuex)

var jukebox = new Jukebox()
var piano = new Piano()

var input
var output

window.jukebox = jukebox
jukebox.setInstrument(piano)

var store = new Vuex.Store({
  state: {
    inputdevice: -1,
    outputdevice: -1,
    inputdeviceName: DEVICE_OFF,
    outputdeviceName: DEVICE_OFF,
    players: {}
  },
  getters: { },
  mutations: {
    addPlayer (state, player) {
      state.players[player.name] = {
        name: player.name,
        noteOn: player.noteOn,
        noteOff: player.noteOff,
        tick: player.tick
      }
    },
    removePlayer (state, name) {
      delete state.players[name]
    },
    setInputDevice (state, number) {
      // Remove all listeners
      if (input) {
        input.removeListener()
      }

      // Turn Off?
      if (number === -1) {
        input = null
        state.inputdevice = -1
        state.inputdeviceName = DEVICE_OFF
        return
      }

      // Switch to the new input
      input = WebMidi.inputs[number]
      if (!input) {
        alert('Cannot get MIDI device')
        return
      }
      state.inputdevice = number
      state.inputdeviceName = WebMidi.inputs[number].name

      // Hook up events
      input.addListener('noteon', 'all', evt => {
        piano.noteOn(evt.note.number, evt.velocity, evt.timestamp)
      })
      input.addListener('noteoff', 'all', evt => {
        piano.noteOff(evt.note.number)
      })
      input.addListener('controlchange', 'all', evt => {
        piano.pedal(evt.controller.name, evt.value)
      })
      input.addListener('midimessage', 'all', evt => {
        piano.rawMidiEvent(evt.data)
      })
    },
    setOutputDevice (state, number) {
      // Switch to the requested output
      if (number === -1) {
        output = null
        state.outputdevice = -1
        state.outputdeviceName = DEVICE_OFF
      } else {
        output = WebMidi.outputs[number]
        state.outputdevice = number
        state.outputdeviceName = WebMidi.outputs[number].name
      }

      // Inform the Piano
      if (output) {
        piano.setMidiOutput(output)
      } else {
        piano.setMidiOutput(null)
      }
    }
  },
  actions: {
    connectToMidi ({ commit }) {
      WebMidi.enable(function (err) {
        if (err) {
          console.error('WebMidi enable error:', err)
        } else {
          commit('setOutputDevice', -1)
          commit('setInputDevice', 0)
        }
      })
    },
    inputdeviceNext ({ commit, state }) {
      var n = state.inputdevice + 1
      if (n >= WebMidi.inputs.length) {
        n = -1
      }
      commit('setInputDevice', n)
    },
    outputdeviceNext ({ commit, state }) {
      var n = state.outputdevice + 1
      if (n >= WebMidi.outputs.length) {
        n = -1
      }
      commit('setOutputDevice', n)
    }
  }
})

export { store, piano, jukebox }
