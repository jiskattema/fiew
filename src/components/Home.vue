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
    </div>
    <div class="midiconf">
      <ul class="midilist">
        <li v-on:click="nextInput">
          <img class="midiimg" src="./settings_midi.svg">
          <span>{{ inputdeviceName }}</span>
        </li>
        <!--
        <li v-on:click="nextOutput">
          <img class="midiimg" src="./settings_midi.svg">
          <span>{{ outputdeviceName }}</span>
        </li>
        -->
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
    // nextOutput () {
    //   this.$store.dispatch('outputdeviceNext')
    // }.
    nextInput () {
      this.$store.dispatch('inputdeviceNext')
    }
  },
  computed: {
    // outputdeviceName () {
    //   return this.$store.state.inputdeviceName
    // },
    inputdeviceName () {
      return this.$store.state.inputdeviceName
    }
  }
}
</script>

<style scoped>
.player {
  width: 25%;
  height: 25vh;
}
.midiconf {
  position: absolute;
  left: 60vw;
  bottom: 25vh;
  width: 18vw;
  height: 22vh;
  white-space: nowrap;
}
.midiimg {
  vertical-align: middle;
  width: 10vh;
  height: 10vh;
}
ul {
  list-style: none;
  font-size: xx-large;
}
</style>
