<template>
  <div>
    <span> {{ chordName }} </span>
    <div ref="twojs">
    </div>
  </div>
</template>

<script>
var TwoLib = require('two.js')
var utils = require('../utils')

const PLAYER_NAME = 'Info'

var playerStatus = 'uninitialized'

function initialize () {
  playerStatus = 'initializing'

  playerStatus = 'initialized'
}

module.exports = {
  data () {
    initialize()
    return {
      chordName: 'None',
      width: 840,
      height: 600
    }
  },
  methods: {
    noteOn (evt) {
      var n = evt.note.number
      this.mystate.notes[n] = 1
    },
    noteOff (evt) {
      var n = evt.note.number
      this.mystate.notes[n] = 0
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
        two.scene.scale = this.width / 200.0
      }

      two.update()

      var pitchSet = utils.getPitchSet()
      var prime = utils.getPrimeForm(pitchSet)

      var chord = utils.forteTable[prime.pitches.join('-')]
      this.chordName = prime.key +
        ' ' + chord['Possible spacings'] +
        ' ' + chord['Forte']
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
      two: two
    }

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
