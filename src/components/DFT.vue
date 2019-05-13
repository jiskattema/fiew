<template>
  <div>
    <div ref="twojs">
    </div>
    <div class="phasetable">
      <table>
        <tr>
          <th>Notes</th>
          <th>Chroma</th>
          <th>Quartal</th>
          <th>Triadic</th>
          <th>Octanic</th>
          <th>Diatonic</th>
          <th>Whole tone</th>
        </tr>
        <tr>
          <td>{{ ph0 }}</td>
          <td>{{ ph1 }}</td>
          <td>{{ ph2 }}</td>
          <td>{{ ph3 }}</td>
          <td>{{ ph4 }}</td>
          <td>{{ ph5 }}</td>
          <td>{{ ph6 }}</td>
        </tr>
        <tr>
          <td>{{ r0 }}</td>
          <td>{{ r1 }}</td>
          <td>{{ r2 }}</td>
          <td>{{ r3 }}</td>
          <td>{{ r4 }}</td>
          <td>{{ r5 }}</td>
          <td>{{ r6 }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
var TwoLib = require('two.js')
var utils = require('../utils')

const PLAYER_NAME = 'DFT'

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

      two.update()
      var dft = utils.getPitchPhases()
      this.ph0 = Math.round(dft[0][0] * 180 / Math.PI)
      this.ph1 = Math.round(dft[0][1] * 180 / Math.PI)
      this.ph2 = Math.round(dft[0][2] * 180 / Math.PI)
      this.ph3 = Math.round(dft[0][3] * 180 / Math.PI)
      this.ph4 = Math.round(dft[0][4] * 180 / Math.PI)
      this.ph5 = Math.round(dft[0][5] * 180 / Math.PI)
      this.ph6 = Math.round(dft[0][6] * 180 / Math.PI)

      this.r0 = dft[1][0] || 0
      this.r1 = this.r0 ? Math.round(100 * dft[1][1] / this.r0) : 0
      this.r2 = this.r0 ? Math.round(100 * dft[1][2] / this.r0) : 0
      this.r3 = this.r0 ? Math.round(100 * dft[1][3] / this.r0) : 0
      this.r4 = this.r0 ? Math.round(100 * dft[1][4] / this.r0) : 0
      this.r5 = this.r0 ? Math.round(100 * dft[1][5] / this.r0) : 0
      this.r6 = this.r0 ? Math.round(100 * dft[1][6] / this.r0) : 0
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

    // Make 6 concentric circles representing the phases
    var r0 = 10
    var delta = 15
    var shapes = [
      two.makeCircle(0, 0, 0 * delta + r0),
      two.makeCircle(0, 0, 1 * delta + r0),
      two.makeCircle(0, 0, 2 * delta + r0),
      two.makeCircle(0, 0, 3 * delta + r0),
      two.makeCircle(0, 0, 4 * delta + r0),
      two.makeCircle(0, 0, 5 * delta + r0)
    ]
    shapes.forEach(shape => {
      shape.linewidth = 4
      shape.noFill()
    })
    var phaseCircles = two.makeGroup(shapes)

    this.mystate = {
      two: two,
      phaseCircles
    }

    utils.names.forEach((name, i) => {
      // place the notes around the clock, with a note at each hour for the first phase
      // for the next phases, start skipping hours
      var phase = i * 2 * Math.PI / 12

      var shapes = [
        two.makeCircle((5 * delta + r0) * Math.cos(1.0 * phase), (5 * delta + r0) * Math.sin(1.0 * phase), 5),
        two.makeCircle((4 * delta + r0) * Math.cos(2.0 * phase), (4 * delta + r0) * Math.sin(2.0 * phase), 5),
        two.makeCircle((3 * delta + r0) * Math.cos(3.0 * phase), (3 * delta + r0) * Math.sin(3.0 * phase), 5),
        two.makeCircle((2 * delta + r0) * Math.cos(4.0 * phase), (2 * delta + r0) * Math.sin(4.0 * phase), 5),
        two.makeCircle((1 * delta + r0) * Math.cos(5.0 * phase), (1 * delta + r0) * Math.sin(5.0 * phase), 5),
        two.makeCircle((0 * delta + r0) * Math.cos(6.0 * phase), (0 * delta + r0) * Math.sin(6.0 * phase), 5)
      ]
      shapes.forEach(shape => {
        shape.linewidth = 1
        shape.fill = '#ff0000'
      })

      this.mystate[name] = two.makeGroup(shapes)
      this.mystate[name].opacity = 0.0
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
  width: 3em;
}
</style>
