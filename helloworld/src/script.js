import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

import shader from './shaders/shader.fs'
import ndThreeStarter from './shaders/nd-three-starter.fs'

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

const textureLoader = new THREE.TextureLoader()
const gltfloader = new GLTFLoader()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const logoScale = 8

let uniforms = {
    'fogDensity': {
        value: .2
    },
    'fogColor': {
        value: new THREE.Vector3(0., 0., 0.)
    },
    'time': {
        value: 1.5
    },
    'uvScale': {
        value: new THREE.Vector2(2.5, .05)
    },
    'texture1': {
        value: textureLoader.load('textures/lava/cloud.png')
    },
    'texture2': {
        value: textureLoader.load('textures/matcaps/3E95CC_65D9F1_A2E2F6_679BD4-256px.png')
    }
};

uniforms['texture1'].value.wrapS = uniforms['texture1'].value.wrapT = THREE.RepeatWrapping;
uniforms['texture2'].value.wrapS = uniforms['texture2'].value.wrapT = THREE.RepeatWrapping;

// 2D2D2F_C6C2C5_727176_94949B-256px.png
// 5C045C_BD0DBD_930493_A404A4-256px.png
const matcapTexture = textureLoader.load('/textures/matcaps/3E95CC_65D9F1_A2E2F6_679BD4-256px.png')

// const material = new THREE.MeshMatcapMaterial({
//     matcap: matcapTexture
// })


/**
 * Logo
 */
const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: shader
});

// 20220302_StoneCreekCrew_3D_vertices_v1.glb
// 20220311_StoneCreekCrew_3D_vertices_extreme_v1.glb
// 20220311_stonecreekcrew_logo_vertices_lava.glb
// more vertices 20220302_StoneCreekCrew_3D_vertices_v2.glb
const logoGltf = await gltfloader.loadAsync('models/20220311_stonecreekcrew_logo_vertices_lava.glb')
const model = logoGltf.scene.children[0]
model.scale.set(logoScale, logoScale, logoScale)
model.position.set(0, 0, 0)
model.material = material
// model.rotation.z = Math.PI * .65
scene.add(model)


/**
 * Clones
 */
const clones = []
const size = 15
const length = Math.pow(size, 3)
// const elements = Array(length)
const elements = {}
const o = new THREE.Object3D()
let i = 0

const material2 = new THREE.MeshBasicMaterial({
    color: 0x00FF00
})

const cloneInstancedMesh = new THREE.InstancedMesh(model.geometry, material2, length)
cloneInstancedMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
scene.add(cloneInstancedMesh)

for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        elements[i++] =  Math.random() * Math.PI * 2 * i / length
        // elements.push({ x: size / 2 - x, y: size / 2 - y, z: size / 2 - z })
      }
    }
}

// elements.map(({ x, y, z }, i) => {
//     const clone = model.clone()
//     const scale = .15 + Math.random()
//     clone.position.set(x, y, z)
//     clone.scale.set(scale, scale, scale)
//     clone.rotation.y = Math.random() * Math.PI * 2 * i / length
//     clones.push(clone)
//     scene.add(clone)
// })

/**
 * Particles
 */
const logoGltfParticles = await gltfloader.loadAsync('models/20220302_StoneCreekCrew_3D_vertices_v2.glb')
const modelParticles = logoGltfParticles.scene.children[0]
modelParticles.scale.set(3, 3, 3)
modelParticles.position.set(0, 0, 0)
const logoGeometry = modelParticles.geometry
// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xff0000,
    sizeAttenuation: true,
})

const particles = new THREE.Points(logoGeometry, particlesMaterial)
particles.scale.set(logoScale, logoScale, logoScale)
particles.position.set(0, 0, 0)
particles.rotation.set(Math.PI / 2, 0, 0)
// scene.add(particles)



window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 3000 );
camera.position.z = 2.5;
camera.position.y = -.75;
camera.rotation.set(25.5, 0, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Effects
 */
// const renderModel = new RenderPass(scene, camera);
const effectBloom = new BloomPass(.25, 15, 1.5, 512);
const effectFilm = new FilmPass(0.95, 1.95, 48, false);
const glitchPass = new GlitchPass(10.125,);

const composer = new EffectComposer( renderer );

// composer.addPass(renderModel);
// composer.addPass( effectBloom );
// composer.addPass( effectFilm );
// composer.addPass(glitchPass);

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    const o = new THREE.Object3D()
    previousTime = elapsedTime

    // Update controls 
    controls.update()

    model.rotation.z = Math.PI * elapsedTime * .5

    const scale = Math.sin(elapsedTime * .5) * 2.5 + 2.5
    // model.scale.set(scale, scale, scale)

    // clones.map(clone => {
    //     clone.rotation.z = Math.PI * elapsedTime * .5
    //     clone.scale.set(scale, scale, scale)
    // })
    let i = 0
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                cloneInstancedMesh.getMatrixAt(i, o.matrix)
                o.position.set(size / 2 - x, size / 2 - y, size / 2 - z)
                o.scale.set(scale, scale, scale)
                o.rotation.y = elements[i]
                o.rotation.z = Math.PI * elapsedTime * .5
                o.updateMatrix()
                cloneInstancedMesh.setMatrixAt(i++, o.matrix)
            }
        }
    }
    cloneInstancedMesh.instanceMatrix.needsUpdate = true;

    // modelClone.rotation.z = Math.PI * elapsedTime * .5

    // particles.rotation.z = Math.PI * elapsedTime * .5

    // camera.position.z -= .005
    // if (camera.position.z < -.35) {
    //     camera.position.z = 2
    // }

    // Render
    renderer.render(scene, camera)

    uniforms['time'].value += 2 * deltaTime

    // Render with Effects
    // renderer.clear()
    // composer.render(0.01)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()