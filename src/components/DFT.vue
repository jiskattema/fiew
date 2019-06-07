<template>
  <div>
    <div v-on:click="setZero" ref="twojs">
    </div>
  </div>
</template>

<script>
var TwoLib = require('two.js')
var utils = require('../utils')
var chroma = require('chroma-js')

const PLAYER_NAME = 'DFT'

// The radius of the phase circles,
// r0 + n * delta
const Phases = [1, 2, 3, 4, 5, 6]
const MaxPhasePower = [1, 4, 4, 3, 4, 3, 6]

const PhaseCircleDelta = 15
const PhaseCircleR0 = 10
const PhaseCircleR = [
  0, // Unused
  5 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle1
  4 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle2
  3 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle3
  2 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle4
  1 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle5
  0 * PhaseCircleDelta + PhaseCircleR0 // PhaseCircle6
]

const noteR = 2
const dotR = 5
const DotThreshold = 1.0

var playerStatus = 'uninitialized'

function initialize () {
  playerStatus = 'initializing'

  playerStatus = 'initialized'
}

function makeNotes (mystate) {
  var two = mystate.two

  utils.names.forEach((name, i) => {
    if (mystate[name]) {
      two.remove(mystate[name])
      delete mystate[name]
    }

    // place the notes around the clock, with a note at each hour for the first phase
    // for the next phases, start skipping hours
    var phase = i * 2 * Math.PI / 12

    var shapes = []
    var curveThrough = []

    Phases.forEach(p => {
      var x = PhaseCircleR[p] * Math.cos(p * phase - mystate.zeroPhase[p])
      var y = PhaseCircleR[p] * Math.sin(p * phase - mystate.zeroPhase[p])
      var c = two.makeCircle(x, y, noteR)

      c.linewidth = 0.5
      c.fill = '#ffffff' // chroma.hsv((p - 1) * 360 / 12, 1, 1).hex()
      shapes.push(c)
      curveThrough.push(x, y)
    })

    // Connect similar notes with a smooth colored curve
    var curve = two.makeCurve(...curveThrough, true)
    curve.linewidth = 0.5
    curve.opacity = 1
    curve.stroke = '#000000' // chroma.hsv((i - 1) * 360 / 12, 1, 1).hex()
    curve.noFill()
    shapes.push(curve)

    mystate[name] = two.makeGroup(shapes.reverse())
    mystate[name].opacity = 0.0
  })
}

function tween (s, e) {
  // the amplitudes: add new pulses and decay to zero
  for (let i = 1; i < 7; i++) {
    s[1][i] = 0.7 * s[1][i] + 0.3 * e[1][i]
  }

  // the angles: rotate from old to new
  var t = [1, 0.8, 0.8, 0.8, 0.8, 0.6, 0.5] // speed per phase
  for (let i = 1; i < 7; i++) {
    //   0 ---- 90  --- 180 --- 270 --- 360 ----
    //       e                s               e
    // the shortest path from s to e can be either clockwise,
    // or anti-clockwise
    var ep = e[0][i]
    while (ep < s[0][i]) { ep += 2 * Math.PI }
    while (ep - 2 * Math.PI > s[0][i]) { ep -= 2 * Math.PI }

    var en = ep - 2 * Math.PI

    var dp = ep - s[0][i]
    var dn = s[0][i] - en

    if (dp < dn) {
      s[0][i] = t[i] * s[0][i] + (1 - t[i]) * ep
    } else {
      s[0][i] = t[i] * s[0][i] + (1 - t[i]) * en
    }
  }
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
    // Set the current phase to be the zero-offset
    setZero () {
      this.mystate.zeroPhase[1] = this.mystate.prevDft[0][1]
      this.mystate.zeroPhase[2] = this.mystate.prevDft[0][2]
      this.mystate.zeroPhase[3] = this.mystate.prevDft[0][3]
      this.mystate.zeroPhase[4] = this.mystate.prevDft[0][4]
      this.mystate.zeroPhase[5] = this.mystate.prevDft[0][5]
      this.mystate.zeroPhase[6] = this.mystate.prevDft[0][6]
      makeNotes(this.mystate)
    },
    tick () {
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
        two.scene.scale = Math.min(this.width, this.height) / 200.0
      }

      // update visible notes immediately
      var pc = utils.getPitchCount()
      pc.forEach((p, i) => {
        if (p) {
          // show active note
          this.mystate[utils.names[i]].opacity = 1.0
        } else {
          // hide all note
          this.mystate[utils.names[i]].opacity = 0.0
        }
      })

      // animate phase power and dots to new settings
      var dft = utils.getPitchPhases()
      var prevDft = this.mystate.prevDft
      tween(prevDft, dft)

      Phases.forEach(p => {
        var phaseCircle = this.mystate['PhaseCircle' + p]

        // opacity and linewidth reflect the real part of the DFT
        // of the current pitch set
        phaseCircle.linewidth = 5 * prevDft[1][p]
        phaseCircle.opacity = 0.9 * (prevDft[1][p] / MaxPhasePower[p]) + 0.1

        // dots are visible when the corresponding phase power is above a threshold
        this.mystate['Dot' + p].opacity = dft[1][p] > DotThreshold ? 1 : 0

        // put the dots on the angle place along the phase circle
        var angle = prevDft[0][p] - this.mystate.zeroPhase[p]
        this.mystate['Dot' + p].translation.set(
          PhaseCircleR[p] * Math.cos(angle),
          PhaseCircleR[p] * Math.sin(angle)
        )
      })

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
    two.scene.scale = Math.min(this.width, this.height) / 200.0
    two.appendTo(this.$refs['twojs'])

    // Make 6 concentric circles representing the phase circles
    var shapes = []
    Phases.forEach(p => {
      var c = two.makeCircle(0, 0, PhaseCircleR[p])
      c.linewidth = 4
      c.noFill()
      c.stroke = chroma.hsv((p - 1) * 360 / 12, 1, 1).hex()

      shapes.push(c)
    })
    two.makeGroup(shapes)

    this.mystate = {
      two: two,
      zeroPhase: [0, 0, 0, 0, 0, 0, 0],
      PhaseCircle1: shapes[0],
      PhaseCircle2: shapes[1],
      PhaseCircle3: shapes[2],
      PhaseCircle4: shapes[3],
      PhaseCircle5: shapes[4],
      PhaseCircle6: shapes[5]
    }

    // Add the notes
    makeNotes(this.mystate)

    // Make 6 dots representing the current phases
    Phases.forEach(p => {
      var c = two.makeCircle(0, 0, dotR)
      c.stroke = '#000000' // chroma.hsv((p - 1) * 360 / 12, 1, 1).hex()
      c.linewidth = 3
      c.fill = '#ffffff'

      this.mystate['Dot' + p] = c
    })

    this.mystate.prevDft = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ]

    this.$store.commit('addPlayer', {
      name: PLAYER_NAME,
      tick: this.tick,
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
.phasetable {
  position: absolute;
  left: 0;
  top: 5vh;
  font-size: x-large;
}
td {
  width: 5em;
  white-space: nowrap;
}
</style>
