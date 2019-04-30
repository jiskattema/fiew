<template>
  <div ref="threejs">
  </div>
</template>

<script>

module.exports = {
  data () {
    var THREE = this.$THREE
    var width = 800
    var height = 600

    var scene = new THREE.Scene()
    scene.background = new THREE.Color(0xcccccc)

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.125)
    dirLight.position.set(0, 0, 1).normalize()
    scene.add(dirLight)

    var pointLight = new THREE.PointLight(0xffffff, 1.5)
    pointLight.position.set(0, 100, 90)
    scene.add(pointLight)

    var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.x = 0.0
    camera.position.y = 0.0
    camera.position.z = 500.0
    camera.lookAt(0, 0, 0)

    var renderer = new THREE.WebGLRenderer()
    renderer.setSize(width, height)

    return {
      renderer: renderer,
      camera: camera,
      scene: scene,
      width: 800,
      height: 600
    }
  },
  addText () {
  },
  mounted () {
    var THREE = this.$THREE

    var scene = this.scene
    var renderer = this.renderer
    var camera = this.camera

    var fontjson = require('./helvetiker_bold.typeface.json')
    var font = new THREE.Font(fontjson)

    var material = new THREE.MeshPhongMaterial({
      color: 0x44f4f4,
      specular: 0x44f4f4
    })

    var geometry = new THREE.TextGeometry('Hello three.js!', {
      font: font,
      size: 80,
      height: 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 10,
      bevelSize: 8,
      bevelOffset: 0,
      bevelSegments: 5
    })

    geometry.center()

    var mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    this.$refs['threejs'].appendChild(renderer.domElement)

    function animate () {
      requestAnimationFrame(animate)
      mesh.rotateY(0.1)
      renderer.render(scene, camera)
    }
    animate()
  }
}
</script>

<style scoped>
</style>
