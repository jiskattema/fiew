<template>
  <div id="top">
    <div id="twojs" ref="twojs">
    </div>
    <img id="volume_ppp" src="./volume_ppp.svg">
    <img id="volume_pp" src="./volume_pp.svg">
    <img id="volume_p" src="./volume_p.svg">
    <img id="volume_mp" src="./volume_mp.svg">
    <img id="volume_mf" src="./volume_mf.svg">
    <img id="volume_f" src="./volume_f.svg">
    <img id="volume_ff" src="./volume_ff.svg">
    <!-- <img id="volume_fff" src="./volume_fff.svg"> -->
  </div>
</template>

<script>
const HISTORY_LENGTH = 256
const DAMPING_CONSTANT = 1000.0

var TwoLib = require('two.js')

const PLAYER_NAME = 'Volume'

var playerStatus = 'uninitialized'

function initialize () {
  playerStatus = 'initializing'

  playerStatus = 'initialized'
}

function makeNotes (mystate) {
  var two = mystate.two

  var shapes = mystate.shapes
  shapes.forEach(s => {
    two.remove(s)
  })
  shapes = []

  var i
  var stops = []
  for (i = 0; i < 128; i++) {
    // x-coord
    stops.push(i)

    // y-coord
    stops.push(0)
  }
  var path = two.makePath(...stops, true)
  path.curved = false
  path.fill = '0xeeeeee'
  mystate.shapes.push(path)
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
    noteOn (number, velocity, timestamp) {
      var pointer = this.mystate.pointer

      this.mystate.timings[pointer] = timestamp
      this.mystate.pointer = (pointer + 1) % HISTORY_LENGTH

      var v = Math.floor(128 * velocity)
      this.mystate.volumes[v] += 10.0
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

        two.scene.translation.set(0, this.height / 128)
        two.scene.scale = this.width / 128.0
      }

      // v = v0 exp (-t/t0)
      var damping = Math.exp(-elapsed / DAMPING_CONSTANT)

      var path = this.mystate.shapes[0]
      for (let i = 1; i < 128; i++) {
        var damped = Math.min(this.mystate.volumes[i] * damping, 100)
        this.mystate.volumes[i] = damped > 0.1 ? damped : 0
        path.vertices[i].y = -this.mystate.volumes[i]
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
    two.scene.translation.set(0, this.height / 2)
    two.scene.scale = this.width / 128.0
    two.appendTo(this.$refs['twojs'])

    this.mystate = {
      shapes: [],
      pointer: 0,
      timings: Array(HISTORY_LENGTH).fill(0),
      volumes: Array(128).fill(0),
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
// 16 32 48 64 80 96 112 127
// 12 25 38 50 63 75 88  95
</script>

<style scoped>
#top #twojs {
  width: 100%;
  height: 95vh;
  margin-top: 0;
}
#volume_ppp { position: absolute; height: 8%; bottom: 15%; left: 2%; }
#volume_pp { position: absolute; height: 8%;  bottom: 25%; left: 25%; }
#volume_p { position: absolute; height: 8%;  bottom: 15%; left: 38%; }
#volume_mp { position: absolute; height: 8%;  bottom: 25%; left: 50%; }
#volume_mf { position: absolute; height: 10%;  bottom: 15%; left: 63%; }
#volume_f { position: absolute; height: 10%;  bottom: 25%; left: 75%; }
#volume_ff { position: absolute; height: 10%;  bottom: 15%; left: 88%; }
#volume_fff { position: absolute; height: 10%;  bottom: 25%; right: 2%; }
</style>
