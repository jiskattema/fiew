<template>
  <div ref="threejs">
  </div>
</template>

<script>
var utils = require('../utils')

const PLAYER_NAME = 'rain'

var playerStatus = 'uninitialized'
var meshes = []

function initializeMeshes (THREE, scene) {
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
    noteOn (evt) {
      var mesh = meshes[0].clone()

      var note = utils.midiNumberToNote(evt.note.number)

      mesh.position.x = evt.note.number
      mesh.position.y = 100
      mesh.position.z = 1

      this.drops.push({
        mesh: mesh,
        note: note
      })
      this.scene.add(mesh)
    },

    noteOff (evt) {
    },

    tick () {
      if (playerStatus !== 'initialized') {
        return
      }

      var i
      for (i = this.drops.length - 1; i >= 0; i--) {
        this.drops[i].mesh.position.y -= 0.5
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
    var THREE = this.$THREE

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xa6bddb)

    var ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(ambientLight)

    this.camera = new THREE.OrthographicCamera(0, 127, 100, 0, 0.1, 1000)
    this.camera.position.x = 0.0
    this.camera.position.y = 0.0
    this.camera.position.z = 10.0
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer()

    this.$refs['threejs'].appendChild(this.renderer.domElement)
    if (playerStatus === 'uninitialized') {
      initializeMeshes(THREE, this.scene)
    }
    utils.addPlayer(PLAYER_NAME, this.tick, this.noteOn, this.noteOff, this)
  },
  beforeDestroy () {
    utils.removePlayer(PLAYER_NAME)
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
