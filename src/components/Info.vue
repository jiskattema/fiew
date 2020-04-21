<template>
  <div id="top">
    <div id="chordName"> <span> {{ chordName }} </span> </div>
    <div id="chordInfo"> <span> {{ chordInfo}}  </span> </div>
  </div>
</template>

<script>
var utils = require('../utils')

const PLAYER_NAME = 'Info'

module.exports = {
  data () {
    return {
      chordName: 'None',
      chordInfo: 'None',
      width: 840,
      height: 600
    }
  },
  methods: {
    noteOn (number, velocity, timestamp) { },
    tick (piano, elapsed) {
      var ps = piano.getPitchSet()
      var normal = utils.getNormalForm(ps)
      var chord = utils.getChord(normal)

      // "Possible spacings" := [ {name, C, key}, ]
      var out

      out = ''
      chord['Possible spacings'].forEach(spacing => {
        out += ' ' + spacing['key'] + spacing['Name']
      })
      this.chordName = out

      out = ''
      out = 'ps: [' + ps.join(',') + '] ' +
        'normal: <' + normal.join(',') + '> ' +
        'Forte: ' + chord['Forte']
      this.chordInfo = out
    }
  },
  mounted () {
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
#chordName {
  font-size: 20em;
  width: 100%;
  height: 10%;
}

#chordInfo {
  font-size: 20em;
  width: 100%;
  height: 10%;
}
</style>
