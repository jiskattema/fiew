<template>
  <div ref="threejs">
  </div>
</template>

<script>
var utils = require('../utils')
var THREE = require('three')

const PLAYER_NAME = 'showNote'

var playerStatus = 'uninitialized'
var groups = {}

function initializeGroups (THREE, scene) {
  playerStatus = 'initializing'

  var font = new THREE.Font(require('./helvetiker_bold.typeface.json'))

  var material = new THREE.MeshPhongMaterial({
    color: 0x44f4f4,
    specular: 0x44f4f4
  })

  utils.names.forEach(name => {
    var geometry = new THREE.TextGeometry(name, {
      font: font,
      size: 80,
      height: 70,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelOffset: 1,
      bevelSegments: 2
    })

    geometry.center()

    groups[name] = new THREE.Group()
    groups[name].visible = false

    var meshMain = new THREE.Mesh(geometry, material)
    meshMain.position.x = 0
    meshMain.position.y = 50 // hover distance
    meshMain.position.z = 0
    groups[name].add(meshMain)

    var meshMirror = new THREE.Mesh(geometry, material)
    meshMirror.position.x = 0
    meshMirror.position.y = -50 // hover distance
    meshMirror.position.z = 20 // height
    meshMirror.rotation.x = Math.PI
    groups[name].add(meshMirror)
  })

  playerStatus = 'initialized'
}

module.exports = {
  // renderer, camera, and plane are private state of the Vue component,
  // but having Vue observe complex THREEjs objects is really slow
  // they are created and added in the mounted() hook
  data () {
    return {
      width: 800,
      height: 600
    }
  },
  methods: {
    setNote (number, velocity) {
      var note = utils.midiNumberToNote(number) // FIXME

      utils.names.forEach(name => {
        groups[name].visible = false
      })

      var group = groups[note.key] || groups['C']
      group.visible = true
      group.scale.x = velocity
      group.scale.y = velocity
      group.scale.z = velocity
    },
    tick (piano, elapsed) {
      if (playerStatus !== 'initialized' || !this.$refs['threejs']) {
        return
      }

      utils.names.forEach(name => {
        // * elapsed [s]
        // * rotations/second [1/s]
        // * 1 circle [rad]
        groups[name].rotateY((elapsed / 1000) * 0.5 * 2.0 * Math.PI)
      })

      var p = this.$refs['threejs']
      this.width = p.offsetWidth
      this.height = p.offsetHeight

      this.camera.aspect = this.width / this.height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.width, this.height)

      this.renderer.clear()
      this.renderer.render(this.scene, this.camera)
    }
  },
  mounted () {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xa6bddb)
    this.scene.fog = new THREE.Fog(0x000000, 250, 1400)

    var pointLight = new THREE.PointLight(0x2b8cbe, 1.5)
    pointLight.position.set(0, 100, 90)
    this.scene.add(pointLight)

    var p = this.$refs['threejs']
    this.width = p.offsetWidth
    this.height = p.offsetHeight

    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 1500)
    this.camera.position.set(0, 100, 450)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)

    this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10000, 10000).center(),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
      })
    )

    this.plane.position.y = 0
    this.plane.rotation.x = -Math.PI / 2
    this.scene.add(this.plane)

    this.$refs['threejs'].appendChild(this.renderer.domElement)

    if (playerStatus === 'uninitialized') {
      initializeGroups(THREE, this.scene)
    }

    utils.names.forEach(name => {
      this.scene.add(groups[name])
    })

    this.$store.commit('addPlayer', {
      name: PLAYER_NAME,
      tick: this.tick,
      noteOn: this.setNote,
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
