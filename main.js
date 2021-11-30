import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import {OrbitControls} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'
import {EffectComposer} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/RenderPass.js'
import {UnrealBloomPass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/UnrealBloomPass.js'
import * as dat from 'dat.gui';
let light1 = null;
let plane, planemesh, planematerial, scene = null;
const gui = new dat.GUI()
const world = {
  plane: {
    width: 10,
    height: 2,
    widthSegments: 40,
    heightSegments: 8,
    emmisiveG: 20,
    topEdgeDistortion: true,
    opacity:0.7 
    
  },
  waveVariables: {
    sinConstant: 0.1,
    cosConstant: 0.01,
    amplitude:1,
    
  },
  lightVariables:
  {
    bloomThreshold: 0.1,
    bloomRadius : 0.0,
    bloomStrength: 1.0,
    purpleIntensity: 1

  }
}
var planeFolder = gui.addFolder('Plane');
var lightFolder = gui.addFolder('Light');
planeFolder.add(world.plane, 'width', 1, 40).onChange(generatePlane)
planeFolder.add(world.plane, 'height', 1, 8).onChange(generatePlane)
planeFolder.add(world.plane, 'widthSegments', 1, 1000, 1).onChange(generatePlane)
planeFolder.add(world.plane, 'heightSegments', 1, 1000, 1).onChange(generatePlane)
planeFolder.add(world.plane, 'topEdgeDistortion').onChange(generatePlane)
planeFolder.add(world.plane, 'opacity', 0, 1).onChange(generatePlane)
planeFolder.add(world.waveVariables, 'sinConstant', 0.0, 0.5)
planeFolder.add(world.waveVariables, 'cosConstant', 0.0, 0.5)
planeFolder.add(world.waveVariables, 'amplitude', 0.0, 3.0)
lightFolder.add(world.lightVariables, 'bloomStrength', 0.0, 5).onChange(bloom)
lightFolder.add(world.lightVariables, 'bloomThreshold', 0.06, 0.4).onChange(bloom)
lightFolder.add(world.lightVariables, 'bloomRadius', 0.0, 100.0).onChange(bloom)
lightFolder.add(world.lightVariables, 'purpleIntensity', 0.0, 100, 1).onChange(activatePurple)

function generatePlane() {
    if(plane != null){
        scene.remove( planemesh )
    }
    plane = new THREE.PlaneBufferGeometry(  
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments);
    //planemesh.geometry.dispose()
    planematerial = new THREE.MeshPhongMaterial({color:0x00ff00, side: THREE.DoubleSide, flatShading: THREE.FlatShading,opacity: world.plane.opacity, transparent: true, emissive: emissiveColor, });
    planemesh = new THREE.Mesh(plane, planematerial);
    planemesh.geometry = new THREE.PlaneGeometry(
    Math.floor(world.plane.width),
    Math.floor(world.plane.height),
    Math.floor(world.plane.widthSegments),
    Math.floor(world.plane.heightSegments),
  )
    scene.add(planemesh)
  // vertice position randomization
  const { array } = planemesh.geometry.attributes.position
  const randomValues = []
  for (let i = 0; i < array.length; i++) {
    // if (i % 3 === 0) {
    //   const x = array[i]
    //   const y = array[i + 1]
    //   const z = array[i + 2]

    // array[i] = x + (Math.random()-0.5)*0.1 
    // array[i + 1] = y + Math.random()*0.1 
    // array[i + 2] = z + Math.random()*0.9 
    // }

    randomValues.push(Math.random())

  }
  
  planemesh.geometry.attributes.position.randomValues = randomValues
  planemesh.geometry.attributes.position.originalpos = planemesh.geometry.attributes.position.array
}
scene = new THREE.Scene();
const color = new THREE.Color("rgb(10, 10, 52)");
scene.background = color;

const renderer = new THREE.WebGLRenderer();
//FOV, aspect ratio, clipping planes (near/far) 
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
new OrbitControls(camera, renderer.domElement)
camera.position.z = 5;
//renderer that runs webgl in a canvas 

renderer.setSize(innerWidth*0.75, innerHeight*0.75);
//fixes aliasing issues
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add light
function activatePurple(){
if(light1){
  light1.dispose()
  scene.remove(light1)
}
light1 = new THREE.DirectionalLight(0x590080, world.lightVariables.purpleIntensity,);
console.log(world.lightVariables.purpleIntensity)
light1.position.set(0,10,0);
scene.add(light1);

// const helper = new THREE.DirectionalLightHelper( light1, 5 );
// scene.add( helper );
 } 


const light2 = new THREE.DirectionalLight(0x77f795, 0.3);
light2.position.set(0,-10,0);
scene.add(light2);

const light3 = new THREE.DirectionalLight(0xffffff, 0.3);
light3.position.set(0,0,5);
scene.add(light3);

const light4 = new THREE.DirectionalLight(0xffffff, 0.3);
light4.position.set(0,0,-5);
scene.add(light4);


//Create plane
// const plane = new THREE.PlaneBufferGeometry(  
//   world.plane.width,
//   world.plane.height,
//   world.plane.widthSegments,
//   world.plane.heightSegments);

const emissiveColor = new THREE.Color("rgb(0, 0, 0)");

// const planematerial = new THREE.MeshPhongMaterial({color:0x00ff00, side: THREE.DoubleSide, flatShading: THREE.FlatShading,opacity: world.plane.opacity, transparent: true, emissive: emissiveColor, });
// const planemesh = new THREE.Mesh(plane, planematerial);

function opacity(){
  planematerial.opacity = world.plane.opacity
}

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass({x:1024, y:1024}, world.lightVariables.bloomStrength, world.lightVariables.bloomRadius, world.lightVariables.bloomThreshold))

function bloom(){
composer.passes[1].strength = world.lightVariables.bloomStrength
composer.passes[1].threshold = world.lightVariables.bloomThreshold
composer.passes[1].radius = world.lightVariables.bloomRadius
}

generatePlane()
bloom()

let frame = 0;
function animate(){
  // SINE WAVE
  frame += 0.01;
  const now = Date.now() / 300;
  const {array, originalpos, randomValues} = planemesh.geometry.attributes.position
  for (let i = 0; i < array.length; i++) {

      if(i % 3 === 0){
      array[i] = originalpos[i] + Math.cos(10*(frame + randomValues[i]))*0.003
      array[i+1] = originalpos[i+1] + Math.sin(frame + randomValues[i+1])*0.001
        if( i < world.plane.widthSegments*3 && world.plane.topEdgeDistortion){
          //top edge distortion
          array[i+1] =  world.plane.height/2+Math.sin((frame+randomValues[i+1])*2)*0.2
        }
      }
      const x = plane.attributes.position.getX(i);
      const y = plane.attributes.position.getY(i);
      // SINE WAVE
      const xangle = x + now*world.waveVariables.sinConstant
      const yangle = y + now*world.waveVariables.cosConstant
      const xsin = Math.sin(xangle)
      const ycos = Math.cos(yangle)

      //denna sabbar heightsegments
      planemesh.geometry.attributes.position.setZ(i, (Math.sin(frame)*world.waveVariables.amplitude*xsin+ycos))//+ Math.sin(frame + randomValues[i+1]));
    
      //planemesh.geometry.attributes.position.originalpos = (world.waveVariables.amplitude*xsin+ycos) + Math.sin(frame + randomValues[i+1])*0.001
      //planemesh.geometry.attributes.position.needsUpdate = true
      //array[i+2] = originalpos[i+2] + Math.sin(frame + randomValues[i+2])*0.005


  }
  //plane.computeVertexNormals();
  planemesh.geometry.attributes.position.needsUpdate = true
  requestAnimationFrame(animate);
  composer.render();
}

animate();