import Vue from 'vue'
import Vuex from 'vuex'

import WebMidi from 'webmidi'
import utils from './utils'

const DEVICE_OFF = 'OFF'

Vue.use(Vuex)

var input
var output

export default new Vuex.Store({
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
      state.players[name] = player
    },
    removePlayer (state, name) {
      delete state.players[name]
    },
    setInputDevice (state, number) {
      if (input) {
        // remove all listener
        input.removeListener()
      }

      if (number === -1) {
        input = null
        state.inputdevice = -1
        state.inputdeviceName = DEVICE_OFF
        return
      }

      // get a new listener
      input = WebMidi.inputs[number]

      // hook up events
      if (input) {
        state.inputdevice = number
        state.inputdeviceName = WebMidi.inputs[number].name

        input.addListener('noteon', 'all', evt => {
          // a key is pressed:
          // none    => pressed
          // pressed    pressed
          // hold    => pressed
          // sustain    sustain
          if (utils.keyStates[evt.note.number] !== utils.states.KEY_SUSTAIN) {
            utils.keyStates[evt.note.number] = utils.states.KEY_PRESSED
          }

          Object.keys(state.players).forEach(name => {
            var player = state.players[name]
            if (player.noteOn) {
              player.noteOn.call(player.scope, evt)
            }
          })
        })

        input.addListener('noteoff', 'all', evt => {
          // a key is released:
          // none       none
          // pressed => hold if holdpedal, else none
          // hold       hold
          // sustain    sustain

          if (utils.keyStates[evt.note.number] === utils.states.KEY_PRESSED) {
            if (utils.holdState === utils.states.HOLD_NONE) {
              utils.keyStates[evt.note.number] = utils.states.KEY_NONE
            } else if (utils.holdState === utils.states.HOLD_PRESSED) {
              utils.keyStates[evt.note.number] = utils.states.KEY_HOLD
            }
          }

          Object.keys(state.players).forEach(name => {
            var player = state.players[name]
            if (player.noteOff) {
              player.noteOff.call(player.scope, evt)
            }
          })
        })

        input.addListener('controlchange', 'all', evt => {
          var newstate

          if (evt.controller.name === 'holdpedal') {
            newstate = evt.value > 64 ? utils.states.HOLD_PRESSED : utils.states.HOLD_NONE
            // holdpedal is pressed:
            // none       none
            // pressed    pressed
            // hold       none
            // sustain    sustain
            // no changes
            if (newstate === utils.states.HOLD_NONE) {
              // holdpedal is released:
              // none       none
              // pressed    pressed
              // hold    => none
              // sustain    sustain
              utils.keyStates.forEach((state, i) => {
                if (state === utils.states.KEY_HOLD) {
                  utils.keyStates[i] = utils.states.KEY_NONE
                }
              })
            }
            utils.holdState = newstate
          } else if (evt.controller.name === 'sustenutopedal') {
            newstate = evt.value > 64 ? utils.states.SUSTAIN_PRESSED : utils.states.SUSTAIN_NONE
            if (newstate === utils.states.SUSTAIN_PRESSED) {
              // sustainpedal is pressed:
              // none       none
              // pressed => sustain
              // hold    => sustain
              // sustain    sustain
              utils.keyStates.forEach((state, i) => {
                if (state === utils.states.KEY_HOLD || state === utils.states.KEY_PRESSED) {
                  utils.keyStates[i] = utils.states.KEY_SUSTAIN
                }
              })
            } else {
              // sustainpedal is released:
              // none       none
              // pressed    pressed
              // hold       hold
              // sustain => hold if holdpedal pressed, none otherwise
              utils.keyStates.forEach((state, i) => {
                if (state === utils.states.KEY_SUSTAIN) {
                  if (utils.holdState === utils.states.HOLD_PRESSED) {
                    utils.keyStates[i] = utils.states.KEY_HOLD
                  } else {
                    utils.keyStates[i] = utils.states.KEY_NONE
                  }
                }
              })
            }
            utils.sustainState = newstate
          } else if (evt.controller.name === 'softpedal') {
            utils.softState = evt.value > 64 ? utils.states.SOFT_PRESSED : utils.states.SOFT_NONE
          }
        })
      } else {
        alert('Cannot get MIDI device')
      }
      if (state.outputdevice !== -1 && output && input) {
        input.addListener('midimessage', 'all', evt => {
          output._midiOutput.send(evt.data)
        })
      }
    },
    setOutputDevice (state, number) {
      if (number === -1) {
        output = null
        state.outputdevice = -1
        state.outputdeviceName = DEVICE_OFF
        return
      }

      output = WebMidi.outputs[number]
      if (output) {
        state.outputdevice = number
        state.outputdeviceName = WebMidi.outputs[number].name
      }
      if (input) {
        input.removeListener('midimessage')
      }
      if (state.outputdevice !== -1 && output && input) {
        input.addListener('midimessage', 'all', evt => {
          output._midiOutput.send(evt.data)
        })
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
