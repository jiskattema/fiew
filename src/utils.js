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

export var keyStates = Array(128).fill(states.KEY_NONE)
export var holdState = states.HOLD_NONE
export var sustainState = states.SUSTAIN_NONE
export var softState = states.SOFT_NONE

// midi note 60 is C4, and 72 is C5
export var names = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

export var namesFlat = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
]

export var namesSharp = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

/**
 * Return a hash containing all possible chords, indexed by primeForm.join('-').
 *
 * Carter:            string, chord number as defined by Carter
 * Forte:             string, chord name as defined by Forte
 * Forte complement:  string, Forte name of chord complement
 * Interval vector:   int[6] of Ints, where xi counts
 *                    the number of intervals of size i
 * Possible spacings: string[], chord names
 * Prime form:        int[], prime form of the chord.
 */
function buildForteTable () {
  var list = require('./forte.json')
  var table = {}

  var i
  for (i = 0; i < list.length; i++) {
    var primeForm = list[i]['Prime form']
    primeForm.map(pc => {
      if (pc === 'E' || pc === 'e') {
        return 11
      } else if (pc === 'T' || pc === 't') {
        return 10
      }
      return parseInt(pc)
    })
    var key = primeForm.join('-')
    table[key] = list[i]
  }

  return table
}

export var forteTable = buildForteTable()

/**
 * Get an array of currently sounding notes.
 *
 * returns: int[], an array containing the MIDI number of active notes
 */
function getActiveNotes () {
  var activeNotes = []
  keyStates.forEach((state, i) => {
    if (state !== states.KEY_NONE) {
      activeNotes.push(i)
    }
  })
  return activeNotes
}

/**
 * Convert a MIDI note number to a key and octave.
 *
 * returns: {octave: int, key: string}
 */
export function midiNumberToNote (number) {
  number = 1 * number
  var octave = Math.floor(number / 12)
  var key = names[number - octave * 12]
  return {
    octave: octave,
    key: key
  }
}

/**
 * Convert an array of MIDI notes in a pitch set.
 *
 * params:
 *   midiNotes: int[], array of MIDI note numbers
 *              default: the result of getActiveNotes()
 *
 * returns: int[], the sorted pitch set.
 */
export function getPitchSet (midiNotes) {
  if (!midiNotes) {
    midiNotes = getActiveNotes()
  }

  // map midi notes to the interval [0, 11]
  var form = []
  midiNotes.forEach(note => {
    var octave = Math.floor(note / 12)
    var pitch = note - octave * 12
    if (form.indexOf(pitch) === -1) {
      form.push(pitch)
    }
  })
  form.sort((a, b) => a - b)
  return form
}

/**
 * Count the pitches in an array of MIDI numbers.
 *
 * params:
 *   midiNotes: int[], array of MIDI note numbers
 *              default: the result of getActiveNotes()
 *
 * returns: int[12], the pitch counts set.
 */
export function getPitchCount (midiNotes) {
  if (!midiNotes) {
    midiNotes = getActiveNotes()
  }

  // map midi notes to the interval [0, 11]
  var count = Array(12).fill(0)
  midiNotes.forEach(note => {
    var octave = Math.floor(note / 12)
    var pitch = note - octave * 12
    count[pitch] += 1
  })
  return count
}

/**
 * Calculate the DFT of a pitch set.
 *
 * The pitch set is of the form int[12];
 * if we consider this a real value function f(x), we can do a discrete
 * fourier transform to get F(k), a (complex) function over [0, 12].
 * NOTE: because f(x) is real valued, there are only 6 independent
 * components to F(k)
 *
 * img, real = DFT(pitch)
 * phases = atan2(img[k], real[k])
 * radii = sqrt(img[k] ** 2 + real[k] ** 2)
 *
 * params:
 *   int[], array of MIDI notes to analyze
 *   default: the currently active notes
 *
 * returns:
 *   [float[6], float[6]], phases and radii of the DFT
 */
export function getPitchPhases (midiNotes) {
  var pitches = getPitchCount(midiNotes) // later mapped to [0, 1]
  var real = Array(12).fill(0)
  var img = Array(12).fill(0)
  var phases = Array(12).fill(0)
  var radii = Array(12).fill(0)

  // sum(0, N) x_n [cos(2pikn/N) - i sin(2pikn/n)]
  for (let k = 0; k < 12; k++) {
    for (let n = 0; n < 12; n++) {
      real[k] += (pitches[n] ? 1 : 0) * Math.cos(2 * Math.PI * k * n / 12)
      img[k] += (pitches[n] ? 1 : 0) * Math.sin(2 * Math.PI * k * n / 12)
    }
  }
  for (let k = 0; k < 12; k++) {
    phases[k] = Math.atan2(img[k], real[k])
    radii[k] = Math.sqrt(img[k] ** 2 + real[k] ** 2)
  }
  return [phases, radii]
}

/**
 * Compare two forms; can be used as sort function.
 *
 * Approach:
 * 1) find the biggest span for each form, where the span
 * is the number of semitones between the first and the last note.
 * 2) if the spans are not equal, we're done the smallest span is most
 * compact. Otherwise, continue with the second largest span etc.
 * 3) if all spans are identical, compare the pitches one-by-one.
 * 4) all pitches are indentical, so the forms are identical.
 *
 * returns:
 * -1:  A < B
 *  0:  A = B
 *  1:  A > B
 */
function compactFormCompare (formA, formB) {
  var spanA
  var spanB

  // compare spans, if the spans are equal,
  // move to the next biggest span
  var length = formA.length
  for (let i = 0; i < formA.length; i++) {
    spanA = formA[length - 1 - i] - formA[0]
    spanB = formB[length - 1 - i] - formB[0]

    while (spanA < 0) { spanA += 12 }
    while (spanB < 0) { spanB += 12 }

    if (spanA > spanB) {
      return 1
    } else if (spanA < spanB) {
      return -1
    } else {
      // spans are equal
      continue
    }
  }

  // all spans are equal, break tie by taking lowest numbers
  for (let i = 0; i < formA.length; i++) {
    if (formA[i] > formB[i]) {
      return 1
    } else if (formA[i] < formB[i]) {
      return -1
    }
  }

  // the forms are fully identical
  return 0
}

function printPc (pc) {
  var a = '['
  pc.forEach(p => { a = a + ' ' + p })
  a += ' ]'
  console.log(a)
}

/**
 * Get the normal form of a pitch set.
 *
 * The normal form is the most compact form; ie. smallest distance
 * between first and last pitch, with all other pitches in between.
 *
 * params:
 *    int[] pitch set
 *
 * returns:
 *    int[] pitch set in normal form
 */
export function getNormalForm (ps) {
  if (ps.length === 0) {
    // needed because else forms[0] returns undefined
    return []
  }

  // build all possible permutations from the pitch set
  var length = ps.length
  ps = ps.concat(ps)

  var forms = []
  for (let i = 0; i < length; i++) {
    forms.push(ps.slice(i, i + length))
  }

  // sort the form using the compactness criterium
  forms.sort(compactFormCompare)

  // return the most compact form
  return forms[0]
}

export function getChord (form) {
  if (!form || form.length === 0) {
    return Object.assign({key: names[0]}, forteTable[0])
  }

  // translate form to start at 0
  var offset = form[0]
  for (let i = 0; i < form.length; i++) {
    form[i] -= offset
    while (form[i] > 12) form[i] -= 12
    while (form[i] < 0) form[i] += 12
  }
  return Object.assign({key: names[offset]}, forteTable[form.join('-')])
}

export default {
  forteTable: forteTable,
  states: states,
  keyStates: keyStates,
  holdState: holdState,
  sustainState: sustainState,
  softState: softState,
  names: names,
  namesFlat: namesFlat,
  namesSharp: namesSharp,
  getNormalForm: getNormalForm,
  getChord: getChord,
  getPitchSet: getPitchSet,
  getPitchPhases: getPitchPhases,
  getPitchCount: getPitchCount,
  midiNumberToNote: midiNumberToNote,
  printPc: printPc
}
