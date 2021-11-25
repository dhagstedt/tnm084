import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';


const scene = new THREE.Scene();
const color = new THREE.Color("rgb(7, 11, 52)");
scene.background = color;
//FOV, aspect ratio, clipping planes (near/far) 
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
camera.position.z = 5;
//renderer that runs webgl in a canvas 
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(innerWidth*0.75, innerHeight*0.75);
//fixes aliasing issues
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add light 
const light1 = new THREE.DirectionalLight(0x590080, 10);
light1.position.set(0,3,0);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0x590080, 10);
light2.position.set(0,-1,0);
scene.add(light2);

const light3 = new THREE.DirectionalLight(0xffffff, 0.3);
light3.position.set(0,0,5);
scene.add(light3);

const light4 = new THREE.DirectionalLight(0xffffff, 10);
light4.position.set(0,0,-5);
scene.add(light4);

// const skyColor = 0xFFFFFF;  // light blue
// const groundColor = 0xFFFFFF;  // brownish orange
// const light2 = new THREE.HemisphereLight(skyColor, groundColor, 0.3);
// scene.add(light2);

//Create plane
const plane = new THREE.PlaneBufferGeometry(10, 2, 40, 8);
//const planematerial = new THREE.MeshBasicMaterial({color:0xFF0000, side: THREE.DoubleSide });
const planematerial = new THREE.MeshPhongMaterial({color:0x00FF00, side: THREE.DoubleSide, flatShading: THREE.FlatShading,opacity: 1, transparent: true});
const planemesh = new THREE.Mesh(plane, planematerial);
scene.add(planemesh)
//object destructuring
const {array} = planemesh.geometry.attributes.position
let randomValues =[];
let stepSize = Math.PI/array.length/3
for (let i = 0; i < array.length; i++) {
  if(i%3 === 0){
    const x = array[i];
    const y = array[i+1];
    const z = array[i+2];
    array[i] = x + Math.random()*0.1 
    array[i + 1] = y + Math.random()*0.1 
    array[i + 2] = z + Math.random()*0.1 
  //array[i+2] = Math.sin(i*stepSize);
  }
  randomValues.push(Math.random())
  stepSize += stepSize;
}
planemesh.geometry.attributes.position.randomValues = randomValues;
planemesh.geometry.attributes.position.originalpos = planemesh.geometry.attributes.position.array;
const count = plane.attributes.position.count;
let frame = 0;
function animate(){
  // SINE WAVE
  frame += 0.01;
  const now = Date.now() / 300;
  const {array, originalpos, randomValues} = planemesh.geometry.attributes.position
  for (let i = 0; i < array.length; i+=3) {
      array[i] = originalpos[i] + Math.cos(10*(frame + randomValues[i]))*0.003
      array[i+1] = originalpos[i+1] + Math.sin(frame + randomValues[i+1])*0.001
      
      //array[i+2] = originalpos[i+2] + Math.sin(frame)
      const x = plane.attributes.position.getX(i);
      const y = plane.attributes.position.getY(i);
      // SINE WAVE
      const xangle = x + now*0.3
      const yangle = y + now*0.3
      const xsin = Math.sin(xangle)
      const ycos = Math.cos(yangle)*0.001

      plane.attributes.position.setZ(i, xsin+ycos);

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
  plane.computeVertexNormals();
  plane.attributes.position.needsUpdate = true;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);


  //mesh.rotation.x += Math.sin(0.1)/5;
  // mesh.rotation.y += 0.01;
  //planemesh.rotation.x += 0.03
}


animate();