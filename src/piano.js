import { store } from './store'

/**
 * The piano class is a wrapper around a MIDI Output device.
 *
 * Its purpose is to provide:
 *
 * 1) a generic way to forward notes to MIDI Output so the Jukebox can work;
 *
 * 2) keeping track of key and pedal states;
 *
 * 3) forwading key and pedal state changes to the visualizations (Players);
 *
 * 4) providing full key and pedal state and derived pitch information to
 *    the visualizations.
 */

export const states = {
  KEY_NONE: 0,
  KEY_PRESSED: 1,
  KEY_HOLD: 2,
  KEY_SUSTAIN: 3,

  HOLD_NONE: 0,
  HOLD_PRESSED: 1,

  SUSTAIN_NONE: 0,
  SUSTAIN_PRESSED: 1,

  SOFT_NONE: 0,
  SOFT_PRESSED: 1
}

class Piano {
  constructor () {
    this.keys = Array(128).fill(states.KEY_NONE)
    this.holdPedal = states.HOLD_NONE
    this.sustainPedal = states.SUSTAIN_NONE
    this.softPedal = states.SOFT_NONE

    this._output = null
  }

  /**
   * Process a key press input event.
   *
   * State changes:
   *  none    => pressed
   *  pressed    pressed
   *  hold    => pressed
   *  sustain    sustain
   */
  noteOn (number, velocity, timestamp) {
    // Relabel velocity=0 to a noteOff event,
    // which is an common alternative
    if (velocity < 0.5 / 128.0) {
      this.noteOff(number)
      return
    }

    if (this.keys[number] !== states.KEY_SUSTAIN) {
      this.keys[number] = states.KEY_PRESSED
    }

    Object.keys(store.state.players).forEach(name => {
      var player = store.state.players[name]
      if (player.noteOn) {
        player.noteOn.call(player.scope, number, velocity, timestamp)
      }
    })
  }

  /**
   * Process a key release input event.
   *
   * State changes:
   *  none       none
   *  pressed => hold if holdpedal, else none
   *  hold       hold
   *  sustain    sustain
   */
  noteOff (number) {
    if (this.keys[number] === states.KEY_PRESSED) {
      if (this.holdPedal === states.HOLD_NONE) {
        this.keys[number] = states.KEY_NONE
      } else if (this.holdPedal === states.HOLD_PRESSED) {
        this.keys[number] = states.KEY_HOLD
      }
    }

    Object.keys(store.state.players).forEach(name => {
      var player = store.state.players[name]
      if (player.noteOff) {
        player.noteOff.call(player.scope, number)
      }
    })
  }

  /**
   * Process a control change input event.
   */
  pedal (pedal, value) {
    var newstate

    if (pedal === 'holdpedal') {
      newstate = value > 64 ? states.HOLD_PRESSED : states.HOLD_NONE
      // holdpedal is pressed:
      // none       none
      // pressed    pressed
      // hold       none
      // sustain    sustain
      // no changes
      if (newstate === states.HOLD_NONE) {
        // holdpedal is released:
        // none       none
        // pressed    pressed
        // hold    => none
        // sustain    sustain
        this.keys.forEach((state, i) => {
          if (state === states.KEY_HOLD) {
            this.keys[i] = states.KEY_NONE
          }
        })
      }
      this.holdPedal = newstate
    } else if (pedal === 'sustenutopedal') {
      newstate = value > 64 ? states.SUSTAIN_PRESSED : states.SUSTAIN_NONE
      if (newstate === states.SUSTAIN_PRESSED) {
        // sustainpedal is pressed:
        // none       none
        // pressed => sustain
        // hold    => sustain
        // sustain    sustain
        this.keys.forEach((state, i) => {
          if (state === states.KEY_HOLD || state === states.KEY_PRESSED) {
            this.keys[i] = states.KEY_SUSTAIN
          }
        })
      } else {
        // sustainpedal is released:
        // none       none
        // pressed    pressed
        // hold       hold
        // sustain => hold if holdpedal pressed, none otherwise
        this.keys.forEach((state, i) => {
          if (state === states.KEY_SUSTAIN) {
            if (this.holdPedal === states.HOLD_PRESSED) {
              this.keys[i] = states.KEY_HOLD
            } else {
              this.keys[i] = states.KEY_NONE
            }
          }
        })
      }
      this.sustainPedal = newstate
    } else if (pedal === 'softpedal') {
      this.softPedal = value > 64 ? states.SOFT_PRESSED : states.SOFT_NONE
    }
  }

  /**
   * Set the MIDI Output for this instrument
   * You can get one from fi. WebMidi.outputs[]
   */
  setMidiOutput (output) {
    this._output = output
  }

  /**
   * Forward a raw MIDI event straight to the output
   */
  rawMidiEvent (data) {
    if (this._output) {
      this._output._midiOutput.send(data)
    }
  }

  /**
   * Get an array of currently sounding notes.
   *
   * returns: int[], an array containing the MIDI number of active notes
   */
  getActiveNotes () {
    var activeNotes = []
    this.keys.forEach((state, i) => {
      if (state !== states.KEY_NONE) {
        activeNotes.push(i)
      }
    })
    return activeNotes
  }

  /**
   * Get the currently sounding pitch set
   *
   * returns: int[], the sorted pitch set
   */
  getPitchSet () {
    var set = []
    var counts = this.getPitchCounts()

    var pc
    for (pc = 0; pc < 12; pc++) {
      if (counts[pc] > 0) {
        set.push(pc)
      }
    }
    return set
  }

  /**
   * Get a count of currently sounding pitches
   * NOTE: midi number 60 is a C, so number % 12 gives pitch class
   *
   * returns: int[12], a count per pitch class
   */
  getPitchCounts () {
    var counts = Array(12).fill(0)

    var key
    for (key = 0; key < 128; key++) {
      counts[key % 12] += this.keys[key]
    }
    return counts
  }
}

export { Piano }
