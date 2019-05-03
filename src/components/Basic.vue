<template>
  <div ref="threejs">
  </div>
</template>

<script>
var utils = require('../utils')

function initializeGroups (THREE, scene) {
  var font = new THREE.Font(require('./helvetiker_bold.typeface.json'))

  var material = new THREE.MeshPhongMaterial({
    color: 0x44f4f4,
    specular: 0x44f4f4
  })

  var groups = {}
  utils.names.forEach(name => {
    var geometry = new THREE.TextGeometry(name, {
      font: font,
      size: 80,
      height: 70,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelOffset: 0,
      bevelSegments: 4
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

    scene.add(groups[name])
  })

  return groups
}

module.exports = {
  data () {
    var THREE = this.$THREE
    var width = 800
    var height = 600

    var scene = new THREE.Scene()
    scene.background = new THREE.Color(0xa6bddb)
    scene.fog = new THREE.Fog(0x000000, 250, 1400)

    var pointLight = new THREE.PointLight(0x2b8cbe, 1.5)
    pointLight.position.set(0, 100, 90)
    scene.add(pointLight)

    var camera = new THREE.PerspectiveCamera(30, width / height, 1, 1500)
    camera.position.set(0, 100, 450)
    camera.lookAt(0, 0, 0)

    var renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)

    var groups = initializeGroups(THREE, scene)

    var plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10000, 10000).center(),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
      })
    )

    plane.position.y = 0
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    return {
      renderer: renderer,
      camera: camera,
      scene: scene,
      groups: groups,
      width: 800,
      height: 600
    }
  },
  methods: {
    setNote (evt) {
      var note = utils.midiNumberToNote(evt.note.number)

      utils.names.forEach(name => {
        this.groups[name].visible = false
      })

      var group = this.groups[note.key] || this.groups['C']
      group.visible = true
      group.scale.x = evt.velocity
      group.scale.y = evt.velocity
      group.scale.z = evt.velocity
    },
    tick () {
      utils.names.forEach(name => {
        this.groups[name].rotateY(0.2)
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
    this.$refs['threejs'].appendChild(this.renderer.domElement)
    utils.addPlayer('showNote', this.tick, this.setNote, null, this)
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
