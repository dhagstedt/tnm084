import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import {OrbitControls} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'
import {EffectComposer} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/RenderPass.js'
import {AfterimagePass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/AfterimagePass.js'
import {UnrealBloomPass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/UnrealBloomPass.js'
import {ShaderPass} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/postprocessing/ShaderPass.js'
import {FXAAShader} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/shaders/FXAAShader.js'
import * as dat from 'dat.gui';

let greenLight = null;
let purpleLight = null;
let plane, planemesh, scene = null;
let fxaaPass;
//------------------------------------------------------------
//-------------------------GUI--------------------------------
//------------------------------------------------------------
const gui = new dat.GUI()
const world = {
  plane: {
    width: 10,
    height: 2,
    widthSegments: 40,
    heightSegments: 8,
    emmisiveG: 20,
    topEdgeDistortion: false,
    opacity:0.7 
    
  },
  movement: {
    sinConstant: 0.01,
    cosConstant: 0.01,
    amplitude: 1,
    period:1,
    xVertex: 0.001,
    yVertex: 0.001,
    zVertex: 0.001,
    
  },
  lightVariables:
  {
    bloomThreshold: 0.1,
    bloomRadius : 0.0,
    bloomStrength: 1.0,
    purpleIntensity: 50,
    greenIntensity: 0,
    emissiveGreen: 0,
    afterGlow: 0,

  }
}
var planeFolder = gui.addFolder('Plane');
var movementFolder = gui.addFolder('Movement');
var lightFolder = gui.addFolder('Light');
planeFolder.add(world.plane, 'width', 1, 40, 1).onChange(generatePlane)
planeFolder.add(world.plane, 'height', 1, 40, 1).onChange(generatePlane)
planeFolder.add(world.plane, 'widthSegments', 1, 1000, 1).onChange(generatePlane)
planeFolder.add(world.plane, 'heightSegments', 1, 1000, 1).onChange(generatePlane)
planeFolder.add(world.plane, 'topEdgeDistortion').onChange(generatePlane)
movementFolder.add(world.movement, 'sinConstant', 0.0, 0.5)
movementFolder.add(world.movement, 'cosConstant', 0.0, 0.5)
movementFolder.add(world.movement, 'amplitude', 0.0, 3.0)
movementFolder.add(world.movement, 'period', 0.01, 1.0, 0.01).onChange(generatePlane)
movementFolder.add(world.movement, 'xVertex', 0.0, 0.01).onChange(generatePlane)
movementFolder.add(world.movement, 'yVertex', 0.0, 0.01).onChange(generatePlane)
movementFolder.add(world.movement, 'zVertex', 0.0, 0.01).onChange(generatePlane)
lightFolder.add(world.plane, 'opacity', 0, 1).onChange(generatePlane)
lightFolder.add(world.lightVariables, 'bloomStrength', 0.0, 5).onChange(bloom)
lightFolder.add(world.lightVariables, 'bloomThreshold', 0.06, 0.4).onChange(bloom)
lightFolder.add(world.lightVariables, 'bloomRadius', 0.0, 100.0).onChange(bloom)
lightFolder.add(world.lightVariables, 'purpleIntensity', 0.0, 100, 1).onChange(activatePurple)
lightFolder.add(world.lightVariables, 'greenIntensity', 0.0, 100, 1).onChange(activateGreen)
lightFolder.add(world.lightVariables, 'emissiveGreen', 0, 255, 1).onChange(generatePlane)
lightFolder.add(world.lightVariables, 'afterGlow', 0, 0.99, 0.001).onChange(afterGlow)

//------------------------------------------------------------
//-------------------------SCENE SETUP------------------------
//------------------------------------------------------------

scene = new THREE.Scene();
const color = new THREE.Color("rgb(10, 10, 52)");
scene.background = color;

//renderer that runs webgl in a canvas 
const renderer = new THREE.WebGLRenderer();
//FOV, aspect ratio, clipping planes (near/far) 
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
//Allow user to control camera with mouse
new OrbitControls(camera, renderer.domElement)
camera.position.z = 5;

renderer.setSize(innerWidth, innerHeight);
//fixes aliasing issues
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

//------------------------------------------------------------
//-------------------------GEOMETRY---------------------------
//------------------------------------------------------------

//Function to create plane. It is called when certain parameters are changed via GUI
function generatePlane() {
    //First time the plane is instantiated, "plane" will be null
    //All other occurences, the plane will be disposed in order to create a new one
    if(plane != null){
        scene.remove( planemesh )
    }
    //Create plane geometry with variables from GUI
    plane = new THREE.PlaneBufferGeometry(  
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
    );
    
    //Green emmisive color controlled by GUI
    let emissiveCol = new THREE.Color("rgb(0, "+world.lightVariables.emissiveGreen+", 0)"),
    
    //Material with variables controlled by GUI
    planematerial = new THREE.MeshPhongMaterial({
        color:0x00ff00, // Main color of the plane
        side: THREE.DoubleSide, //Render both sides
        opacity: world.plane.opacity, //Opacity
        transparent: true, // Needed to display opacity
        emissive: emissiveCol, //
        flatShading: THREE.FlatShading //Render low-poly style
    });
    //Different material that has nothing to do with auroras
    // planematerial = new THREE.MeshNormalMaterial({
    //     opacity: world.plane.opacity,
    //     transparent: true,
    //     side: THREE.DoubleSide,
    // })

    //Create mesh with geometry and material. Add to scene
    planemesh = new THREE.Mesh(plane, planematerial);
    scene.add(planemesh)

    //random values used to add movement to vertices later on
    const { array } = planemesh.geometry.attributes.position
    const randomValues = []
    for (let i = 0; i < array.length; i++) {
        randomValues.push(Math.random())
    }
    planemesh.geometry.attributes.position.randomValues = randomValues
    planemesh.geometry.attributes.position.originalpos = planemesh.geometry.attributes.position.array
}

//------------------------------------------------------------
//-------------------------LIGHTING---------------------------
//------------------------------------------------------------

// functions to add/change green/purple lighting in the scene
function activatePurple(){
    if(purpleLight){
    purpleLight.dispose()
    scene.remove(purpleLight)
    }
    purpleLight = new THREE.DirectionalLight(0x5200b0, world.lightVariables.purpleIntensity,);
    purpleLight.position.set(0,10,0);
    scene.add(purpleLight);
 } 
function activateGreen(){
    if(greenLight){
    greenLight.dispose()
    scene.remove(greenLight)
    }
    greenLight = new THREE.DirectionalLight(0x00ff00, world.lightVariables.greenIntensity,);
    greenLight.position.set(0,10,0);
    scene.add(greenLight);
} 

//Just some basic lighting to illuminate the plane from multiple directions
const light2 = new THREE.DirectionalLight(0x77f795, 0.3);
light2.position.set(0,-10,0);
scene.add(light2);

const light3 = new THREE.DirectionalLight(0xffffff, 0.3);
light3.position.set(0,0,5);
scene.add(light3);

const light4 = new THREE.DirectionalLight(0xffffff, 0.3);
light4.position.set(0,0,-5);
scene.add(light4);

//------------------------------------------------------------
//----------------------POST PROCESSING-----------------------
//------------------------------------------------------------

//Post processing effects aswell as functions used to be able to control them from GUI
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass({x:1024, y:1024}, world.lightVariables.bloomStrength, world.lightVariables.bloomRadius, world.lightVariables.bloomThreshold))

function bloom(){
composer.passes[1].strength = world.lightVariables.bloomStrength
composer.passes[1].threshold = world.lightVariables.bloomThreshold
composer.passes[1].radius = world.lightVariables.bloomRadius
}
let afterimagePass = new AfterimagePass();
afterimagePass.uniforms.damp.value = 0
composer.addPass( afterimagePass );
function afterGlow(){
composer.passes[2].uniforms.damp.value = world.lightVariables.afterGlow;
}

//Anti aliasing. Doesn't seem to have alot of impact. Maybe remove this
fxaaPass = new ShaderPass( FXAAShader )
fxaaPass.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * devicePixelRatio )
fxaaPass.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * devicePixelRatio )
composer.addPass(fxaaPass)

//------------------------------------------------------------
//-------------------------ANIMATION--------------------------
//------------------------------------------------------------

let frame = 0
//Animation loop. Controls various movements of the object
function animate(){
  frame += 0.01
  let {array, originalpos, randomValues} = planemesh.geometry.attributes.position
  for (let i = 0; i < array.length; i++) {

      if(i % 3 === 0){
      //Individual vertex movement for x,y
      array[i] = originalpos[i] + Math.cos((frame + randomValues[i]))*world.movement.xVertex
      array[i+1] = originalpos[i+1] + Math.sin(frame + randomValues[i+1])*world.movement.yVertex

        if( i < world.plane.widthSegments*3 && world.plane.topEdgeDistortion){
          //top edge distortion
          array[i+1] =  world.plane.height/2+Math.sin((frame+randomValues[i+1])*2)*0.2
        }
      }

      //Main movement for plane + individual movement for z
      //Harmonic functions used here are arbitrary. Tuned until they produced a nice look
      const x = plane.attributes.position.getX(i)
      const y = plane.attributes.position.getY(i)
      const xangle = x + frame*world.movement.sinConstant
      const yangle = y + frame*world.movement.cosConstant
      const xsin = Math.sin(xangle)
      const ycos = Math.cos(yangle)
      planemesh.geometry.attributes.position.setZ(i, (Math.sin(frame*world.movement.period)*world.movement.amplitude*(xsin+ycos)) + Math.cos(frame + randomValues[i+2])*world.movement.zVertex*100)
      
  }
  planemesh.geometry.attributes.position.needsUpdate = true
  requestAnimationFrame(animate)
  composer.render()
}

//------------------------------------------------------------
//-----------------------INITIALIZE RUN-----------------------
//------------------------------------------------------------
//Set up lights/effects for first run
activatePurple()
activateGreen()
generatePlane()
bloom()
afterGlow()
animate()