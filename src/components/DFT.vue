<template>
  <div>
    <div ref="twojs">
    </div>
    <div class="phasetable">
      <table>
        <tr> <th>{{ r0 }}</th> <th>Power</th> <th>Phase</th> </tr>
        <tr> <td>Diatonic</td> <td>{{ r5 }}</td> <td>{{ ph5 }}</td> </tr>
        <tr> <td>Quartal</td> <td>{{ r2 }}</td> <td>{{ ph2 }}</td> </tr>
        <tr> <td>Chroma</td> <td>{{ r1 }}</td> <td>{{ ph1 }}</td> </tr>
        <tr> <td>Triadic</td> <td>{{ r3 }}</td> <td>{{ ph3 }}</td> </tr>
        <tr> <td>Octanic</td> <td>{{ r4 }}</td> <td>{{ ph4 }}</td> </tr>
        <tr> <td>Whole tone</td> <td>{{ r6 }}</td> <td>{{ ph6 }}</td> </tr>
      </table>
    </div>
  </div>
</template>

<script>
var TwoLib = require('two.js')
var utils = require('../utils')

const PLAYER_NAME = 'DFT'

// The radius of the phase circles,
// r0 + n * delta
const PhaseCircleDelta = 15
const PhaseCircleR0 = 10
const PhaseCircleR = [
  0, // Unused
  3 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle1
  4 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle2
  2 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle3
  1 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle4
  5 * PhaseCircleDelta + PhaseCircleR0, // PhaseCircle5
  0 * PhaseCircleDelta + PhaseCircleR0 // PhaseCircle6
]

const noteR = 3
const dotR = 5
const DotThreshold = 1

var playerStatus = 'uninitialized'

function initialize () {
  playerStatus = 'initializing'

  playerStatus = 'initialized'
}

module.exports = {
  data () {
    initialize()
    return {
      width: 840,
      height: 600,
      ph0: 0,
      ph1: 0,
      ph2: 0,
      ph3: 0,
      ph4: 0,
      ph5: 0,
      ph6: 0,
      r0: 0,
      r1: 0,
      r2: 0,
      r3: 0,
      r4: 0,
      r5: 0,
      r6: 0
    }
  },
  methods: {
    tick () {
      var p = this.$refs['twojs']
      if (playerStatus !== 'initialized' || !p) {
        return
      }

      // render
      var two = this.mystate.two

      if (this.width !== p.offsetWidth || this.height !== p.offsetHeight) {
        this.width = p.offsetWidth
        this.height = p.offsetHeight

        two.width = this.width
        two.height = this.height

        two.scene.translation.set(this.width / 2, this.height / 2)
        two.scene.scale = Math.min(this.width, this.height) / 200.0
      }

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

      var dft = utils.getPitchPhases()

      // update the DFT table
      this.ph0 = Math.round(dft[0][0] * 180 / Math.PI)
      this.ph1 = Math.round(dft[0][1] * 180 / Math.PI)
      this.ph2 = Math.round(dft[0][2] * 180 / Math.PI)
      this.ph3 = Math.round(dft[0][3] * 180 / Math.PI)
      this.ph4 = Math.round(dft[0][4] * 180 / Math.PI)
      this.ph5 = Math.round(dft[0][5] * 180 / Math.PI)
      this.ph6 = Math.round(dft[0][6] * 180 / Math.PI)

      this.r0 = dft[1][0] || 0
      this.r1 = this.r0 ? Math.round(dft[1][1]) : 0
      this.r2 = this.r0 ? Math.round(dft[1][2]) : 0
      this.r3 = this.r0 ? Math.round(dft[1][3]) : 0
      this.r4 = this.r0 ? Math.round(dft[1][4]) : 0
      this.r5 = this.r0 ? Math.round(dft[1][5]) : 0
      this.r6 = this.r0 ? Math.round(dft[1][6]) : 0

      // opacity and linewidth reflect the real part of the DFT
      // of the current pitch set
      var r0 = dft[1][0] || 100000
      this.mystate['PhaseCircle1'].linewidth = 2 * dft[1][1] + 1
      this.mystate['PhaseCircle2'].linewidth = 2 * dft[1][2] + 1
      this.mystate['PhaseCircle3'].linewidth = 2 * dft[1][3] + 1
      this.mystate['PhaseCircle4'].linewidth = 2 * dft[1][4] + 1
      this.mystate['PhaseCircle5'].linewidth = 2 * dft[1][5] + 1
      this.mystate['PhaseCircle6'].linewidth = 2 * dft[1][6] + 1
      this.mystate['PhaseCircle1'].opacity = 0.9 * (dft[1][1] / r0) + 0.1
      this.mystate['PhaseCircle2'].opacity = 0.9 * (dft[1][2] / r0) + 0.1
      this.mystate['PhaseCircle3'].opacity = 0.9 * (dft[1][3] / r0) + 0.1
      this.mystate['PhaseCircle4'].opacity = 0.9 * (dft[1][4] / r0) + 0.1
      this.mystate['PhaseCircle5'].opacity = 0.9 * (dft[1][5] / r0) + 0.1
      this.mystate['PhaseCircle6'].opacity = 0.9 * (dft[1][6] / r0) + 0.1

      // show the current phases
      this.mystate['Dot1'].opacity = dft[1][1] > DotThreshold ? 1 : 0
      this.mystate['Dot2'].opacity = dft[1][2] > DotThreshold ? 1 : 0
      this.mystate['Dot3'].opacity = dft[1][3] > DotThreshold ? 1 : 0
      this.mystate['Dot4'].opacity = dft[1][4] > DotThreshold ? 1 : 0
      this.mystate['Dot5'].opacity = dft[1][5] > DotThreshold ? 1 : 0
      this.mystate['Dot6'].opacity = dft[1][6] > DotThreshold ? 1 : 0

      // with the right angles
      this.mystate['Dot1'].translation.set(
        PhaseCircleR[1] * Math.cos(dft[0][1]),
        PhaseCircleR[1] * Math.sin(dft[0][1])
      )
      this.mystate['Dot2'].translation.set(
        PhaseCircleR[2] * Math.cos(dft[0][2]),
        PhaseCircleR[2] * Math.sin(dft[0][2])
      )
      this.mystate['Dot3'].translation.set(
        PhaseCircleR[3] * Math.cos(dft[0][3]),
        PhaseCircleR[3] * Math.sin(dft[0][3])
      )
      this.mystate['Dot4'].translation.set(
        PhaseCircleR[4] * Math.cos(dft[0][4]),
        PhaseCircleR[4] * Math.sin(dft[0][4])
      )
      this.mystate['Dot5'].translation.set(
        PhaseCircleR[5] * Math.cos(dft[0][5]),
        PhaseCircleR[5] * Math.sin(dft[0][5])
      )
      this.mystate['Dot6'].translation.set(
        PhaseCircleR[6] * Math.cos(dft[0][6]),
        PhaseCircleR[6] * Math.sin(dft[0][6])
      )

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
    var shapes = [
      two.makeCircle(0, 0, PhaseCircleR[1]),
      two.makeCircle(0, 0, PhaseCircleR[2]),
      two.makeCircle(0, 0, PhaseCircleR[3]),
      two.makeCircle(0, 0, PhaseCircleR[4]),
      two.makeCircle(0, 0, PhaseCircleR[5]),
      two.makeCircle(0, 0, PhaseCircleR[6])
    ]
    shapes.forEach(shape => {
      shape.linewidth = 4
      shape.noFill()
    })
    two.makeGroup(shapes)

    this.mystate = {
      two: two,
      PhaseCircle1: shapes[5],
      PhaseCircle2: shapes[4],
      PhaseCircle3: shapes[3],
      PhaseCircle4: shapes[2],
      PhaseCircle5: shapes[1],
      PhaseCircle6: shapes[0]
    }

    utils.names.forEach((name, i) => {
      // place the notes around the clock, with a note at each hour for the first phase
      // for the next phases, start skipping hours
      var phase = i * 2 * Math.PI / 12

      var shapes = [
        two.makeCircle(PhaseCircleR[1] * Math.cos(1.0 * phase), PhaseCircleR[1] * Math.sin(1.0 * phase), noteR),
        two.makeCircle(PhaseCircleR[2] * Math.cos(2.0 * phase), PhaseCircleR[2] * Math.sin(2.0 * phase), noteR),
        two.makeCircle(PhaseCircleR[3] * Math.cos(3.0 * phase), PhaseCircleR[3] * Math.sin(3.0 * phase), noteR),
        two.makeCircle(PhaseCircleR[4] * Math.cos(4.0 * phase), PhaseCircleR[4] * Math.sin(4.0 * phase), noteR),
        two.makeCircle(PhaseCircleR[5] * Math.cos(5.0 * phase), PhaseCircleR[5] * Math.sin(5.0 * phase), noteR),
        two.makeCircle(PhaseCircleR[6] * Math.cos(6.0 * phase), PhaseCircleR[6] * Math.sin(6.0 * phase), noteR)
      ]
      shapes.forEach(shape => {
        shape.linewidth = 1
        shape.fill = '#ffffff'
      })

      this.mystate[name] = two.makeGroup(shapes)
      this.mystate[name].opacity = 0.0
    })

    // Make 6 dots representing the current phases
    var dots = ['Dot1', 'Dot2', 'Dot3', 'Dot4', 'Dot5', 'Dot6']
    dots.forEach(name => {
      this.mystate[name] = two.makeCircle(0, 0, dotR)
      this.mystate[name].fill = '#ff0000'
    })

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
