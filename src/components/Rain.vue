<template>
  <div ref="threejs">
  </div>
</template>

<script>
// Top to bottom is a distance of 100; we want to do this in 10,000 miliseconds
const SPEED = 100.0 / 10000

var utils = require('../utils')
var THREE = require('three')

const PLAYER_NAME = 'rain'

var playerStatus = 'uninitialized'
var meshes = []

function initializeMeshes (scene) {
  playerStatus = 'initializing'

  var material = new THREE.MeshPhongMaterial({
    color: 0x2b8cbe
  })
  // specular: 0x44f4f4

  // var geometry = new THREE.CircleGeometry(1, 12)
  var geometry = new THREE.BoxGeometry(1.25, 0.9, 1)
  geometry.center()

  meshes[0] = new THREE.Mesh(geometry, material)

  playerStatus = 'initialized'
}

module.exports = {
  data () {
    return {
      width: 800,
      height: 600,
      drops: []
    }
  },
  methods: {
    noteOn (number, velocity) {
      var mesh = meshes[0].clone()

      var note = utils.midiNumberToNote(number)

      mesh.position.x = number
      mesh.position.y = 100
      mesh.position.z = 1

      this.drops.push({
        mesh: mesh,
        note: note
      })
      this.scene.add(mesh)
    },

    tick (piano, elapsed) {
      if (playerStatus !== 'initialized') {
        return
      }

      var i
      for (i = this.drops.length - 1; i >= 0; i--) {
        this.drops[i].mesh.position.y -= SPEED * elapsed
        if (this.drops[i].mesh.position.y <= 0) {
          this.scene.remove(this.drops[i].mesh)
          this.drops[i].mesh.geometry.dispose()
          this.drops[i].mesh.material.dispose()
          this.drops.splice(i, 1)
        }
      }

      var p = this.$refs['threejs']
      this.width = p.offsetWidth
      this.height = p.offsetHeight

      this.camera.aspect = this.width / this.height
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(this.width, this.height)
      this.renderer.render(this.scene, this.camera)
    }
  },
  mounted () {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xa6bddb)

    var ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(ambientLight)

    this.camera = new THREE.OrthographicCamera(0, 127, 100, 0, 0.1, 1000)
    this.camera.position.x = 0.0
    this.camera.position.y = 0.0
    this.camera.position.z = 10.0
    this.camera.lookAt(0, 0, 0)

    var p = this.$refs['threejs']
    this.width = p.offsetWidth
    this.height = p.offsetHeight

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(this.width, this.height)

    this.$refs['threejs'].appendChild(this.renderer.domElement)
    if (playerStatus === 'uninitialized') {
      initializeMeshes(THREE, this.scene)
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
  height: 98vh;
  margin-top: 0;
}
</style>
