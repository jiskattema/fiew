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
      <router-link to="/volume">
        <img class="player" src="./volume.png">
      </router-link>
      <router-link to="/info">
        <img class="player" src="./info.png">
      </router-link>
    </div>
    <div class="branding">
      <img src="../../static/img/logo.png" style="display:inline-block">
      Fiew
    </div>
    <div v-on:click="demoSong" class="jukebox">
      <img class="midiimg" src="./jukebox.svg">
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

var jukebox = require('../store').jukebox

export default {
  name: 'Home',
  methods: {
    demoSong () {
      if (jukebox.isPlaying) {
        jukebox.stop()
      } else {
        jukebox.playDemo()
      }
    },
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
.branding {
  position: absolute;
  left: 1vw;
  bottom: 3vh;
  font-size: xx-large;
  text-align: center;
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
.jukebox {
  position: absolute;
  right: 3vw;
  bottom: 3vh;
  height: 22vh;
  width: 10vw;
  white-space: nowrap;
}
ul {
  list-style: none;
  font-size: xx-large;
  user-select: none;
}
</style>
