import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import {OrbitControls} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'
import {EffectComposer} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/RenderPass.js'
import {UnrealBloomPass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/UnrealBloomPass.js'
import * as dat from 'dat.gui';

const gui = new dat.GUI()
const world = {
  plane: {
    width: 10,
    height: 2,
    widthSegments: 40,
    heightSegments: 8,
    emmisiveG: 20, 
    
  },
  waveVariables: {
    sinConstant: 0.1,
    cosConstant: 0.1,
    amplitude:1,
    
  },
  bloomVariables:
  {
    threshold: 0.1,
    radius : 0.0,
    strength: 1.0,

  }
}
gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 5).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)
gui.add(world.waveVariables, 'sinConstant', 0.0, 0.5)
gui.add(world.waveVariables, 'cosConstant', 0.0, 0.5)
gui.add(world.waveVariables, 'amplitude', 0.0, 3.0)
gui.add(world.bloomVariables, 'strength', 0.0, 5).onChange(bloom)
gui.add(world.bloomVariables, 'threshold', 0.0, 1.0).onChange(bloom)
gui.add(world.bloomVariables, 'radius', 0.0, 1.0).onChange(bloom)

function generatePlane() {
  planemesh.geometry.dispose()
  planemesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments,
  )
  // vertice position randomization
  const { array } = planemesh.geometry.attributes.position
  const randomValues = []
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i]
      const y = array[i + 1]
      const z = array[i + 2]

    array[i] = x + (Math.random()-0.5)*0.1 
    array[i + 1] = y + Math.random()*0.1 
    array[i + 2] = z + Math.random()*0.9 
    }

    randomValues.push(Math.random())

  }

  planemesh.geometry.attributes.position.randomValues = randomValues
  planemesh.geometry.attributes.position.originalpos = planemesh.geometry.attributes.position.array
}
const scene = new THREE.Scene();
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
const light1 = new THREE.DirectionalLight(0x590080, 10, );
light1.position.set(0,10,0);
scene.add(light1);

const helper = new THREE.DirectionalLightHelper( light1, 5 );
scene.add( helper );

const light2 = new THREE.DirectionalLight(0x590080, 1);
light2.position.set(0,-10,0);
scene.add(light2);

const light3 = new THREE.DirectionalLight(0xffffff, 0.3);
light3.position.set(0,0,5);
scene.add(light3);

const light4 = new THREE.DirectionalLight(0xffffff, 0.3);
light4.position.set(0,0,-5);
scene.add(light4);

// const skyColor = 0xFFFFFF;  // light blue
// const groundColor = 0xFFFFFF;  // brownish orange
// const light2 = new THREE.HemisphereLight(skyColor, groundColor, 0.3);
// scene.add(light2);


//Create plane
const plane = new THREE.PlaneBufferGeometry(  
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments);

const emissiveColor = new THREE.Color("rgb(0, 0, 0)");

const planematerial = new THREE.MeshPhongMaterial({color:0x00ff00, side: THREE.DoubleSide, flatShading: THREE.FlatShading,opacity: 0.7, transparent: true, emissive: emissiveColor, });
const planemesh = new THREE.Mesh(plane, planematerial);
scene.add(planemesh)

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass({x:1024, y:1024}, world.bloomVariables.strength, 0.0, world.bloomVariables.threshold))
function bloom(){
composer.passes[1].strength = world.bloomVariables.strength
composer.passes[1].threshold = world.bloomVariables.threshold
composer.passes[1].radius = world.bloomVariables.radius
console.log(composer.passes[1])
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
      //testa lägga till originalpos2
      array[i+1] = originalpos[i+1] + Math.sin(frame + randomValues[i+1])*0.001
        if( i < world.plane.widthSegments*3){
          array[i+1] =  1+Math.sin((frame+randomValues[i+1])*2)*0.3
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
      planemesh.geometry.attributes.position.setZ(i, (world.waveVariables.amplitude*xsin+ycos));

      //array[i+2] = originalpos[i+2] + Math.sin(frame + randomValues[i+2])*0.005


  }
  plane.computeVertexNormals();
  planemesh.geometry.attributes.position.needsUpdate = true

  requestAnimationFrame(animate);
  composer.render();
}


animate();