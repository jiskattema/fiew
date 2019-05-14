import Vue from 'vue'
import Vuex from 'vuex'

import WebMidi from 'webmidi'
import WebAudioTinySynth from 'webaudio-tinysynth'
import utils from './utils'

Vue.use(Vuex)

var synth = new WebAudioTinySynth({
  quality: 1,
  useReverb: 0,
  voices: 32
})

export default new Vuex.Store({
  state: {
    inputdevice: 0,
    outputdevice: 0,
    inputdeviceName: 'unset',
    outputdeviceName: 'unset',
    players: {}
  },
  getters: { },
  mutations: {
    addPlayer (state, player) {
      state.players[name] = player
    },
    removePlayer (state, name) {
      delete state.players[name]
    },
    setInputDevice (state, number) {
      var input = WebMidi.inputs[number]
      if (input) {
        state.inputdevice = number
        state.inputdeviceName = WebMidi.inputs[number].name

        input.addListener('noteon', 'all', evt => {
          synth.noteOn(evt.channel, evt.note.number, evt.rawVelocity)

          utils.keyStates[evt.note.number] = utils.states.KEY_PRESSED

          Object.keys(state.players).forEach(name => {
            var player = state.players[name]
            if (player.noteOn) {
              player.noteOn.call(player.scope, evt)
            }
          })
        })

        input.addListener('noteoff', 'all', evt => {
          synth.noteOff(evt.channel, evt.note.number)

          if (utils.holdState === utils.states.HOLD_NONE) {
            utils.keyStates[evt.note.number] = utils.states.KEY_NONE
          } else if (utils.holdState === utils.states.HOLD_PRESSED) {
            utils.keyStates[evt.note.number] = utils.states.KEY_HOLD
          }

          Object.keys(state.players).forEach(name => {
            var player = state.players[name]
            if (player.noteOff) {
              player.noteOff.call(player.scope, evt)
            }
          })
        })

        input.addListener('controlchange', 'all', evt => {
          // piano has pedal (left to right)
          // softpedal
          // sustenutopedal
          // holdpedal
          if (evt.controller.name === 'holdpedal') {
            var newstate = evt.value > 64 ? utils.states.HOLD_PRESSED : utils.states.HOLD_NONE
            if (newstate === utils.states.HOLD_NONE) {
              // pedal is released, release all held keys
              utils.keyStates.forEach((state, i) => {
                if (state === utils.states.KEY_HOLD) {
                  utils.keyStates[i] = utils.states.KEY_NONE
                }
              })
            }
            utils.holdState = newstate
          }
        })
      }
    },
    setOutputDevice (state, number) {
      var output = WebMidi.outputs[number]
      if (output) {
        state.outputdevice = number
        state.outputdeviceName = WebMidi.outputs[number].name
      }
    }
  },
  actions: {
    connectToMidi ({ commit }) {
      WebMidi.enable(function (err) {
        if (err) {
          console.error('WebMidi enable error:', err)
        } else {
          commit('setOutputDevice', 0)
          commit('setInputDevice', 0)
        }
      })
    },
    inputdeviceNext ({ commit, state }) {
      var n = state.inputdevice + 1
      if (n >= WebMidi.inputs.length) {
        n = 0
      }
      commit('setInputDevice', n)
    },
    outputdeviceNext ({ commit, state }) {
      var n = state.outputdevice + 1
      if (n >= WebMidi.outputs.length) {
        n = 0
      }
      commit('setOutputDevice', n)
    }
  }
})
