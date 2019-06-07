<template>
  <div>
    <div id="home">
      <router-link to="/basic">
        <img class="player" src="./basic.png">
      </router-link>
      <router-link to="/rain">
        <img class="player" src="./rain.png">
      </router-link>
      <router-link to="/dft">
        <img class="player" src="./dft.png">
      </router-link>
      <router-link to="/tonnetz">
        <img class="player" src="./tonnetz.png">
      </router-link>
    </div>
    <div class="midiconf">
      <ul class="midilist">
        <li v-on:click="nextInput">
          <span class="midiname">{{ inputdeviceName }}</span>
          <img class="midiimg" src="./settings_midi.svg">
        </li>
        <li v-on:click="nextOutput">
          <span class="midiname">{{ outputdeviceName }}</span>
          <img class="midiimg" src="./settings_midi.svg">
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// var pitchSet = utils.getPitchSet(activeNotes)
// var primeSet = utils.getPrimeForm(pitchSet)
// console.log(primeSet)

export default {
  name: 'Home',
  methods: {
    nextOutput () {
      this.$store.dispatch('outputdeviceNext')
    },
    nextInput () {
      this.$store.dispatch('inputdeviceNext')
    }
  },
  computed: {
    outputdeviceName () {
      return this.$store.state.outputdeviceName
    },
    inputdeviceName () {
      return this.$store.state.inputdeviceName
    }
  }
}
</script>

<style scoped>
#home {
  margin-top: 5em;
}
.player {
  width: 25%;
  height: 25vh;
}
.midiconf {
  position: absolute;
  right: 10vw;
  bottom: 10vh;
  height: 22vh;
  white-space: nowrap;
}
.midilist {
  text-align: right;
}
.midiimg {
  vertical-align: middle;
  width: 10vh;
  height: 10vh;
}
.midiname {
}
ul {
  list-style: none;
  font-size: xx-large;
  user-select: none;
}
</style>
