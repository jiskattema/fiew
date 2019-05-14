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

function getActiveNotes () {
  var activeNotes = []
  keyStates.forEach((state, i) => {
    if (state !== states.KEY_NONE) {
      activeNotes.push(i)
    }
  })
  return activeNotes
}

export function midiNumberToNote (number) {
  number = 1 * number
  var octave = Math.floor(number / 12)
  var key = names[number - octave * 12]
  return {
    octave: octave,
    key: key
  }
}

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

export function getPitchPhases (midiNotes) {
  var pitches = getPitchCount(midiNotes)
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

export function getNormalForm (form) {
  // build all possible permutations from the pitch set
  var length = form.length
  form = form.concat(form)

  var pcs = []
  for (let i = 0; i < length; i++) {
    pcs.push(form.slice(i, i + length))
  }

  // sort the form using the compactness criterium
  pcs.sort(compactFormCompare)

  // return the most compact form
  return pcs[0]
}

export function getPrimeForm (form) {
  var normalForm = getNormalForm(form)

  var inverted = form
    .map(a => a ? 12 - a : 0)
    .sort((a, b) => a - b)

  var normalInverted = getNormalForm(inverted)

  // transpose to start at zero

  var delta
  if (compactFormCompare(normalForm, normalInverted) < 0) {
    delta = normalForm[0]
    normalForm = normalForm.map(a => a >= delta ? a - delta : 12 + a - delta)
    return normalForm
  } else {
    delta = normalInverted[0]
    normalInverted = normalInverted.map(a => a >= delta ? a - delta : 12 + a - delta)
    return normalInverted
  }
}

export default {
  states: states,
  keyStates: keyStates,
  holdState: holdState,
  sustainState: sustainState,
  softState: softState,
  names: names,
  getNormalForm: getNormalForm,
  getPitchSet: getPitchSet,
  getPitchPhases: getPitchPhases,
  getPitchCount: getPitchCount,
  getPrimeForm: getPrimeForm,
  midiNumberToNote: midiNumberToNote,
  printPc: printPc
}
