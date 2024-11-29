import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import "./App.css"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

function App() {
  const mountRef = useRef(null)

  useEffect(() => {
    let camera, scene, renderer, controls, sphere
    let bgcamera, bgcontrols
    let clock = new THREE.Clock()
    

    function init() {
      // Set up scene and camera
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        300
      )
      ;(camera.position.z = 40),
        (camera.position.y = 0),
        (camera.position.x = 0),
        scene.add(camera)

      const loader = new GLTFLoader().setPath("../warehouse_fbx_model_free/")
      loader.load("scene.gltf", (gltf) => {
        gltf.scene.scale.set(15, 15, 15)
        gltf.scene.position.set(-120, -25, 130)
        gltf.scene.add(sphere)
        scene.add(gltf.scene)
        scene.environment = gltf.scene
      })

      const geometry = new THREE.SphereGeometry(1.3, 64, 64)


      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
           uniform float time;
    varying vec2 vUv;

    void main() {
      vec3 color = vec3(1.0);

      float radialDist = length(vUv - vec2(0.5, 0.5));
      color = mix(color, vec3(0.9, 0.8, 1.0), smoothstep(0.3, 0.5, radialDist));
      float wave = sin(vUv.y * 10.0 + time * 3.0);
      color = mix(color, vec3(1.0, 0.6, 0.8), smoothstep(0.48, 0.52, wave));

      float swirl = sin((vUv.x + vUv.y) * 10.0 + time * 2.0);
      color = mix(color, vec3(0.8, 0.6, 1.0), smoothstep(0.48, 0.52, swirl));

      gl_FragColor = vec4(color, 1.0);
          }
        `,
      })

      sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(8, 1.5, -17)

      const rgbeLoader = new RGBELoader()
      rgbeLoader.load("", (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = texture
      })

      const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffcc88, 1)
      directionalLight.position.set(1, 10, -10)  
      scene.add(directionalLight)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 1)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      mountRef.current.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true 
      controls.enableZoom = false
      controls.enablePan = false
      controls.minPolarAngle = Math.PI / 3;
      controls.maxPolarAngle = Math.PI / 1.5;
      controls.minAzimuthAngle = -Math.PI / 4;
      controls.maxAzimuthAngle = Math.PI / 4;

      window.addEventListener("resize", onWindowResize)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function animate() {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      sphere.material.uniforms.time.value = elapsedTime

      renderer.render(scene, camera)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", onWindowResize)
      mountRef.current.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      id="canvas-container"
      ref={mountRef}
    ></div>
  )
}

export default App
