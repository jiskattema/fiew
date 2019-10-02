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
 * Possible spacings: [{name, C}, ], Array of chord name, and its notes in C
 * Prime form:        int[], prime form of the chord.
 */
function buildForteTable () {
  var list = require('./forte.json')
  var table = {}

  var i
  for (i = 0; i < list.length; i++) {
    // to help identify the key of the chords,
    // calculate the normal form for the chord in C
    var spacings = list[i]['Possible spacings']
    spacings.forEach(spacing => {
      var normal = getNormalForm(spacing['C'])
      spacing.offset = normal[0] || 0
    })

    // hash the chords by a key created from the prime form
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
 * Convert a MIDI note number to a key and octave.
 *
 * returns: {octave: int, key: string}
 */
export function midiNumberToNote (number) {
  number = 1 * number
  var octave = Math.floor(number / 12)
  var pc = number - octave * 12
  return {
    octave: octave,
    pc: pc,
    key: names[pc]
  }
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
 *   int[12], array of pitch counts to analyze
 *       NOTE: at the moment, mapped to 0 or 1 (ie. /= 0)
 *
 * returns:
 *   [float[6], float[6]], phases and radii of the DFT
 */
export function getPitchPhases (counts) {
  var real = Array(12).fill(0)
  var img = Array(12).fill(0)
  var phases = Array(12).fill(0)
  var radii = Array(12).fill(0)

  // sum(0, N) x_n [cos(2pikn/N) - i sin(2pikn/n)]
  for (let k = 0; k < 12; k++) {
    for (let n = 0; n < 12; n++) {
      real[k] += (counts[n] ? 1 : 0) * Math.cos(2 * Math.PI * k * n / 12)
      img[k] += (counts[n] ? 1 : 0) * Math.sin(2 * Math.PI * k * n / 12)
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
  var offset
  if (!form || form.length === 0) {
    // no notes is the empty set
    offset = 0
  } else {
    // translate form to start at 0
    offset = form[0]
    for (let i = 0; i < form.length; i++) {
      form[i] -= offset
      while (form[i] > 12) form[i] -= 12
      while (form[i] < 0) form[i] += 12
    }
  }

  // get the chord from the Forte table
  var chord = Object.assign({}, forteTable[form.join('-')])

  // find the key this chord is in
  var spacings = chord['Possible spacings']
  if (spacings) {
    spacings.forEach(spacing => {
      var key = offset - spacing.offset
      while (key < 0) key += 12
      spacing.key = names[key]
    })
  } else {
    // TODO: some chords are missing from the table,
    // return something that at least doenst crash the site
    chord['Possible spacings'] = []
  }

  return chord
}

export default {
  forteTable: forteTable,
  names: names,
  namesFlat: namesFlat,
  namesSharp: namesSharp,
  getNormalForm: getNormalForm,
  getChord: getChord,
  getPitchPhases: getPitchPhases,
  midiNumberToNote: midiNumberToNote,
  printPc: printPc
}
