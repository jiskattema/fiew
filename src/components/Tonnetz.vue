<template>
  <div>
    <div v-on:click="setZero" ref="twojs">
    </div>
  </div>
</template>

<script>
/**
 *      C#+1
 *    A-3   E+4
 * F-7   C0     G+7
 *    Ab-2  Eb+3
 *
 */

var TwoLib = require('two.js')
// var chroma = require('chroma-js')
var states = require('../piano').states

const PLAYER_NAME = 'Tonnetz'

// 18 notes in the horizontal
// 7 in the vertical
const DELTAX = 10
const DELTAY = -(0.5 * DELTAX * Math.sqrt(3))

const STARTX0 = -9 * DELTAX
const STARTX1 = STARTX0 + 0.5 * DELTAX

const NOTER2 = 0.7 * DELTAX // 0.5
const NOTER1 = 0.2 * 0.5 * DELTAX

var playerStatus = 'uninitialized'

function initialize () {
  playerStatus = 'initializing'

  playerStatus = 'initialized'
}

function makeNotes (mystate) {
  var two = mystate.two

  // a hash grouping all shapes per midi note
  var shapesPerNote = mystate['shapesPerNote'] || {}

  // remove existing notes
  for (let n = 0; n < 128; n++) {
    var shapes = shapesPerNote[n]
    if (shapes) {
      shapes.forEach(shape => {
        shape.remove()
      })
      delete shapesPerNote[n]
    }
    shapesPerNote[n] = []
  }

  // how much room is there for ghosts?
  var ghosts = Math.round(
    -3.5 + 0.5 * two.height / (Math.abs(DELTAY) * two.scene.scale)
  )

  // add notes and ghosts
  for (let y = -3 - ghosts; y < 4 + ghosts; y++) {
    var x0 = y % 2 ? STARTX1 : STARTX0

    // dont worry about x-axis, we determine visibily later
    for (let x = -40; x < 40; x++) {
      // two lines up is one step C -> C# so plus 1
      // one line up (and a bit to the right) C -> E so plus 4
      // one step to the right is C -> G so plus 7
      var p = y % 2 ? ((y - 1) / 2) + 4 + 7 * x : (y / 2) + 7 * x
      p = p + mystate.pitchdelta

      var octave = -1
      while (p > 11) {
        p -= 12
        octave++
      }
      while (p < 0) {
        p += 12
        octave--
      }

      // C4 := 60, pitch = 0
      var midinumber = (octave + 1) * 12 + p

      if (midinumber >= 0 && midinumber < 128) {
        var c = two.makeCircle(x0 + x * DELTAX, y * DELTAY, NOTER1)
        c.fill = '#eeee00' // chroma.hsv((p - 1) * 360 / 12, 1, 1).hex()
        c.linewidth = 1

        // C C# D D# E F F# G G# A A# B
        // 0 1  2 3  4 5 6  7 8  9 10 11
        if ([1, 3, 6, 8, 11].indexOf(p) !== -1) {
          c.stroke = '#000000'
        } else {
          c.stroke = '#000000' // '#555555'
        }

        if (Math.abs(y) > 3) {
          // ghosts are very opaque
          c.opacity = 0.2
        } else {
          // normal notes are a little bit opaque
          // to give a better image when playing notes with
          // overlapping shapes (ie. a C-chord when NOTER2 is lager
          // than 0.5 DELTAX
          c.opacity = 0.8
        }

        shapesPerNote[midinumber].push(c)

        // var t = two.makeText(
        //   utils.namesFlat[p] + octave,
        //   x0 + x * DELTAX,
        //   y * DELTAY
        // )
        // t.size = NOTER1 * 0.7
        // shapesPerNote[midinumber].push(t)
      }
    }
  }
  mystate['shapesPerNote'] = shapesPerNote
}

module.exports = {
  data () {
    initialize()
    return {
      width: 840,
      height: 600
    }
  },
  methods: {
    setZero () {
      var delta = this.mystate.pitchdelta
      delta += 7
      if (delta > 11) {
        delta -= 12
      }
      this.mystate.pitchdelta = delta
      makeNotes(this.mystate)
    },
    noteOn (number, velocity) {
      this.mystate.notes[number] = velocity
    },
    noteOff (number) {
      this.mystate.notes[number] = 0
    },
    tick (piano, elapsed) {
      var p = this.$refs['twojs']
      if (playerStatus !== 'initialized' || !p) {
        return
      }

      // render
      var two = this.mystate.two

      // update page size
      if (this.width !== p.offsetWidth || this.height !== p.offsetHeight) {
        this.width = p.offsetWidth
        this.height = p.offsetHeight

        two.width = this.width
        two.height = this.height

        two.scene.translation.set(this.width / 2, this.height / 2)
        two.scene.scale = this.width / 200.0
        makeNotes(this.mystate)
      }

      // get the hash with the two js shapes
      var shapesPerNote = this.mystate['shapesPerNote']
      var notes = this.mystate['notes']
      var ps = piano.getPitchSet()

      var pc = 0
      for (let key = 0; key < 128; key++) {
        shapesPerNote[key].forEach(s => {
          // reset key state?
          if (piano.keys[key] === states.KEY_NONE) {
            notes[key] = 0
          }

          if (notes[key]) {
            // key pressed
            s.radius = NOTER2 * notes[key] + NOTER1 * (1 - notes[key])
            s.fill = '#eeee00'
          } else if (ps.indexOf(pc) !== -1) {
            // pitch class pressed
            s.radius = 0.2 * (NOTER2 + NOTER1)
            s.fill = '#000000'
          } else {
            s.radius = NOTER1
            s.fill = '#eeee00'
          }
        })

        if (pc >= 11) {
          pc = 0
        } else {
          pc += 1
        }
      }

      two.update()
    }
  },
  mounted () {
    var p = this.$refs['twojs']
    this.width = p.offsetWidth
    this.height = p.offsetHeight

    var two = new TwoLib.Two({
      type: TwoLib.Two.Types.canvas,
      width: this.width,
      height: this.height,
      fullscreen: false
    })
    two.scene.translation.set(this.width / 2, this.height / 2)
    two.scene.scale = this.width / 200.0
    two.appendTo(this.$refs['twojs'])

    this.mystate = {
      notes: Array(128).fill(0),
      pitchdelta: -1,
      two: two
    }
    makeNotes(this.mystate)

    this.$store.commit('addPlayer', {
      name: PLAYER_NAME,
      tick: this.tick,
      noteOn: this.noteOn,
      scope: this
    })
  },
  beforeDestroy () {
    this.$store.commit('removePlayer', PLAYER_NAME)
  }
}
</script>

<style scoped>
div {
  width: 100%;
  height: 95vh;
  margin-top: 0;
}
</style>
