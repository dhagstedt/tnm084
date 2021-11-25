import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import {OrbitControls} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui';

const gui = new dat.GUI()
const world = {
  plane: {
    width: 10,
    height: 2,
    widthSegments: 40,
    heightSegments: 8
  }
}
gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)

gui.add(world.plane, 'height', 1, 5).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)

function generatePlane() {
  planemesh.geometry.dispose()
  planemesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
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
const color = new THREE.Color("rgb(7, 50, 52)");
scene.background = color;

const renderer = new THREE.WebGLRenderer({antialias: true});
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
const light1 = new THREE.DirectionalLight(0x590080, 100);
light1.position.set(0,10,0);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0x590080, 100);
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

const planematerial = new THREE.MeshPhongMaterial({color:0x00FF00, side: THREE.DoubleSide, flatShading: THREE.FlatShading,opacity: 1, transparent: true});
const planemesh = new THREE.Mesh(plane, planematerial);
scene.add(planemesh)

const planematerial2 = new THREE.MeshPhongMaterial({color:0x00FF00, side: THREE.DoubleSide, flatShading: THREE.FlatShading,opacity: 1, transparent: true});
const planemesh2 = new THREE.Mesh(plane, planematerial2);
scene.add(planemesh2)
generatePlane()

generatePlane()

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
      }
      const x = plane.attributes.position.getX(i);
      const y = plane.attributes.position.getY(i);
      // SINE WAVE
      const xangle = x + now*0.8
      const yangle = y + now*0.3
      const xsin = Math.sin(xangle)
      const ycos = Math.cos(yangle)

      planemesh.geometry.attributes.position.setZ(i, (xsin+ycos)/2);

      //array[i+2] = originalpos[i+2] + Math.sin(frame + randomValues[i+2])*0.005


  }
  // for (let i = 0; i < count; i++) {
  //     const x = plane.attributes.position.getX(i);
  //     const y = plane.attributes.position.getY(i);
  //     // SINE WAVE
  //     const xangle = x + now/5
  //     const xsin = Math.sin(xangle)
  //     const xcos = Math.cos(xangle)

  //     plane.attributes.position.setZ(i, xsin*xcos/5);

  //     //plane.attributes.position.setX(i, xsin*xcos/5);
  // }
  //plane.computeVertexNormals();
  planemesh.geometry.attributes.position.needsUpdate = true

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}


animate();