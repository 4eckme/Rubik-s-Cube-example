import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { ConvexGeometry } from 'https://threejs.org/examples/jsm/geometries/ConvexGeometry.js';
import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://threejs.org/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'https://threejs.org/examples/jsm/shaders/CopyShader.js';
import { LuminosityHighPassShader } from 'three/addons/shaders/LuminosityHighPassShader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';


let gu = {
  time: {value: 0}
}
var CONTAINER, RENDERER, SCENE, CAMERA, CONTROLS;
var enableRotate = true;
var timer = 0; var tmr = 1;
var invert = 0;
var inverse = 1;
var inverse2 = 1;
var r = 0;
var g = new Array();
g[1] = new THREE.Group();
g[2] = new THREE.Group();
g[3] = new THREE.Group();
g[4] = new THREE.Group();
g[5] = new THREE.Group();
g[6] = new THREE.Group();
var free_step = 1;
let raycaster = new THREE.Raycaster();
let point_mouse = new THREE.Vector2();
var clock = new THREE.Clock();
var pointLight = new THREE.PointLight( 0xffffff, 500 );
var OBJS = Array();
let shaderSphere;
let TIME = 0.0; let ZOOM=1.0;
let COMPOSER;
let mixer;
var inited = 0;

init();
animate();
initComposer();

function init() {
    RENDERER = new THREE.WebGLRenderer({
        antialias: true, alpha:true
    });
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    CONTAINER = document.createElement('div');
    CONTAINER.id="gameBox";
    document.body.appendChild(CONTAINER);
    CONTAINER.appendChild(RENDERER.domElement);

    SCENE = new THREE.Scene();
    SCENE.add(g[1]);
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
    CAMERA.position.set(0.01,6,12);
    CAMERA.lookAt(SCENE.position);
    
    CONTROLS = new OrbitControls(CAMERA, RENDERER.domElement);
    CONTROLS.mouseButtons = {LEFT: THREE.MOUSE.ROTATE}
    CONTROLS.enableDamping = true;
    CONTROLS.enableZoom = false;
    CONTROLS.maxPolarAngle = Math.PI-Math.PI/6.0;
    CONTROLS.minPolarAngle =Math.PI/6.0;
  

    
    initComposer();
    
    var shaderSphereGeometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    var shaderMaterial = new THREE.MeshNormalMaterial({
      color: 0x000000,  // red (can also use a CSS color string here)
      shininess:5,
      flatShading: true,
    });
  
  
  
    for (var i = -1; i <= 1; i++) {
      for (var j = -1; j <= 1; j++) {
        for (var k= -1; k <= 1; k++){
            var shaderMaterial3 = new THREE.MeshPhongMaterial({
              transparent: false,
              //side: THREE.DoubleSide,
              onBeforeCompile: shader => {
                shader.uniforms.time = gu.time;
                shader.vertexShader = `
                  varying vec3 vPos;
                  varying float faceIndex;
                  //varying vec3 vNormal;
                  ${shader.vertexShader}
                `.replace(
                  `#include <begin_vertex>`,
                  `#include <begin_vertex>
                  vPos = position;
                  faceIndex = float(gl_VertexID)/4.0;
                  //vNormal = normalize(normalMatrix * normal);
                  `
                );
                //console.log(shader.vertexShader);
                shader.fragmentShader = `
                  uniform float time;
                  varying vec3 vPos;
                  varying float faceIndex;
                  //varying vec3 vNormal;
                  ${shader.fragmentShader}
                `.replace(
                  `#include <color_fragment>`,
                  `#include <color_fragment>
                   vec3 color;
                   float r=0.0;float g=0.0;float b=0.0;
                   color = vec3(1,1,1);
                   if (faceIndex <= 1.0) color = vec3(0,0,1);
                   else if (faceIndex <= 2.0) color = vec3(1,1,0);
                   else if (faceIndex <= 3.0) color = vec3(1,0,0);
                   else if (faceIndex <= 4.0) color = vec3(0,1,1);
                   else if (faceIndex <= 5.0) color = vec3(0,1,0);
                   else if (faceIndex <= 6.0) color = vec3(1,0,1);
                   diffuseColor = vec4(color, 1.0);
                  `
                );
              }
            });
            
            shaderSphere = new THREE.Mesh(shaderSphereGeometry, shaderMaterial3);
            shaderSphere.position.x = i;
            shaderSphere.position.y = j;
            shaderSphere.position.z = k;
            shaderSphere.pos = {x:i+10,y:j+10,z:k+10}
            OBJS.push(shaderSphere);
            SCENE.add(shaderSphere);
        }
      }
    }
  
  
  
 var v1 = SCENE.add(pointLight);
// console.log(v1);
 window.addEventListener('resize', onWindowResize, false); 
 
  inited = 1;
}
function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
function initComposer() {
    COMPOSER = new EffectComposer(RENDERER);
    COMPOSER.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(SCENE, CAMERA);
    COMPOSER.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 1, 0.1);
    COMPOSER.addPass(bloomPass);
}
function gclear() {g[1].remove();}
function animate() {
  if (inited) {
    
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer !== undefined) mixer.update( delta );
    CONTROLS.update();
    TIME += 0.005;
    ZOOM = ZOOM;
    //shaderSphere.position.x=Math.cos(TIME*10.0)*10.0;
    //shaderSphere.position.z=Math.sin(TIME*10.0)*10.0;
    updateUniforms();
    
    
    if(Math.abs(Math.atan(CAMERA.position.x, CAMERA.position.y)/Math.PI*2*(10/9))<1) invert = 0; else invert = 1;
    if(CAMERA.position.z<0) inverse = -1; else inverse = 1;
    if (invert) {
      if(Math.atan(CAMERA.position.x, CAMERA.position.y)/Math.PI*2*(10/9)>1) inverse = -1;
    else if(Math.atan(CAMERA.position.x, CAMERA.position.y)/Math.PI*2*(10/9)<-1) inverse = 1;
    }
    
    if (timer < 25 && r == 1) { timer+=tmr;
        var o = "x"; var O = "rotateX"; if (invert) { o = "z"; O = "rotateZ"; }  
        SCENE.children.forEach((cube) =>  {
            if (cube.position[o] == -1*inverse) g[1].add(cube);
        }); g[1][O](-Math.PI/2/(25/tmr)*inverse);
    } else if (timer < 25 && r == 4) { timer+=tmr;
        var o = "x"; var O = "rotateX"; if (invert) { o = "z"; O = "rotateZ"; } 
        
        SCENE.children.forEach((cube) =>  {
            if (cube.position[o] == -1*inverse) g[1].add(cube);
        }); g[1][O](Math.PI/2/(25/tmr)*inverse);
    } else if (timer < 25 && r == 2) { timer+=tmr;
        var o = "x"; var O = "rotateX"; if (invert) { o = "z"; O = "rotateZ"; }
        
        SCENE.children.forEach((cube) =>  {
            if (cube.position[o] == 0) g[1].add(cube);
        }); g[1][O](-Math.PI/2/(25/tmr)*inverse);
    } else if (timer < 25 && r == 5) { timer+=tmr;
        var o = "x"; var O = "rotateX"; if (invert) { o = "z"; O = "rotateZ"; }
        
        SCENE.children.forEach((cube) =>  {
            if (cube.position[o] == 0) g[1].add(cube);
        }); g[1][O](Math.PI/2/(25/tmr)*inverse);
    } else if (timer < 25 && r == 3) { timer+=tmr;
        var o = "x"; var O = "rotateX"; if (invert) { o = "z"; O = "rotateZ"; }
        
        SCENE.children.forEach((cube) =>  {
            if (cube.position[o] == 1*inverse) g[1].add(cube);
        }); g[1][O](-Math.PI/2/(25/tmr)*inverse);
    } else if (timer < 25 && r == 6) { timer+=tmr;
        var o = "x"; var O = "rotateX"; if (invert) { o = "z"; O = "rotateZ"; }
        
        SCENE.children.forEach((cube) =>  {
            if (cube.position[o] == 1*inverse) g[1].add(cube);
        }); g[1][O](Math.PI/2/(25/tmr)*inverse);
    }else if (timer < 25 && r == 7) { timer+=tmr;
        SCENE.children.forEach((cube) =>  {
            if (cube.position.y == 1) g[1].add(cube);
        }); g[1].rotateY(-Math.PI/2/(25/tmr));
    } else if (timer < 25 && r == 10) { timer+=tmr;
        SCENE.children.forEach((cube) =>  {
            if (cube.position.y == 1) g[1].add(cube);
        }); g[1].rotateY(Math.PI/2/(25/tmr));
    } else if (timer < 25 && r == 8) { timer+=tmr;
        SCENE.children.forEach((cube) =>  {
            if (cube.position.y == 0) g[1].add(cube);
        }); g[1].rotateY(-Math.PI/2/(25/tmr));
    } else if (timer < 25 && r == 11) { timer+=tmr;
        SCENE.children.forEach((cube) =>  {
            if (cube.position.y == 0) g[1].add(cube);
        }); g[1].rotateY(Math.PI/2/(25/tmr));
    }else if (timer < 25 && r == 9) { timer+=tmr;
        SCENE.children.forEach((cube) =>  {
            if (cube.position.y == -1) g[1].add(cube);
        }); g[1].rotateY(-Math.PI/2/(25/tmr));
    } else if (timer < 25 && r == 12) { timer+=tmr;
        SCENE.children.forEach((cube) =>  {
            if (cube.position.y == -1) g[1].add(cube);
        }); g[1].rotateY(Math.PI/2/(25/tmr));
    }
    else if (timer>=25 && r) { /* console.log(timer);*/ endRotate(g[1]); }
    pointLight.position.set(...CAMERA.position);
    //console.log(Math.atan(CAMERA.position.x, CAMERA.position.y)/Math.PI*2*(10/9));
    
    
    RENDERER.render(SCENE, CAMERA);
  }
}
function endRotate(group) {
    //r = 0;
    group.updateMatrixWorld(true);
    group.children.forEach((child)=>{
        var worldPosition1 = new THREE.Vector3();
        child.getWorldPosition( worldPosition1 );  
        group.updateMatrixWorld(true);
        var quaternion = new THREE.Quaternion()
        var rotation = new THREE.Euler()
        rotation.setFromQuaternion(quaternion)
        child.getWorldQuaternion( quaternion )
        child.position.copy(worldPosition1);
        group.remove(child);
        SCENE.add(child);
        child.position.x = Math.round(child.position.x);
        child.position.y = Math.round(child.position.y);
        child.position.z = Math.round(child.position.z);
        child.quaternion.copy(quaternion);
    }); setTimeout(step,100);
}
function step() { /* console.log(timer); */
  if (timer>=25) {
    if (enableRotate) CONTROLS.enableRotate = true;
    free_step = 1;
    r = 0;}
}

function updateUniforms() {
    SCENE.traverse((child) => {
        if (child instanceof THREE.Mesh
            && child.material.type === 'ShaderMaterial') {
            child.material.uniforms.uTime.value = TIME;
            child.material.uniforms.uZoom.value = ZOOM;
            child.material.needsUpdate = true;
        }
    });
    COMPOSER.passes.forEach((pass) => {
        if (pass instanceof ShaderPass) {
            pass.uniforms.uTime.value = TIME;
             pass.uniforms.uZoom.value = ZOOM;
        }
    });
}


function onWindowResize(event) {
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
}

for (var i = 1; i <= 12; i++) {
  document.getElementById("b"+i).onclick = function() {
      CONTROLS.enableRotate = false;
      if (free_step && (timer>=25 || timer == 0)) {
        free_step=0; timer = 0;
        g[1] = new THREE.Group();
        SCENE.add(g[1]);
        r = parseInt(this.id.substr(1));
      }
  }
}
document.getElementById("origin").onclick = function() {
    SCENE = null;
    document.getElementById("gameBox").remove();
    init();
}
var interval;
document.getElementById("randomize").onclick = function() {
  tmr = 2.5;
  enableRotate = false;
  CONTROLS.enableRotate = false;
  interval = setInterval(clck, 200);
  setTimeout(stop, 5000);
  setTimeout(stop2, 5200);
}
function stop() {
  clearInterval(interval);
}
function stop2() {
  enableRotate = true;
  CONTROLS.enableRotate = true;
  tmr = 1;
}
function clck() {
   var rand = Math.ceil(Math.random()*12);
  document.getElementById("b"+rand).click();
}
function endRotate2(){
  endRotate(g[2])
}

var clickcenter = 0;
var clickright = 0;
var clickleft = 0; 
var clicktop = 0;
var clickbottom = 0;
var cx = 0; var cy = 0;
function E(e) { 
  console.log(document.getElementById("n"+e.code.substr(6)));
  document.body.click()
  document.getElementById("n"+e.code.substr(6)).classList.add("hover");
  var delclass = function() {
    document.getElementById("n"+e.code.substr(6)).classList.remove("hover");
  }
  setTimeout(delclass,400)
  if(e.code=="Numpad5"){
    clickcenter = 1;
    clickright = clickleft = clicktop = clickbottom = 0;
  } else if(e.code=="Numpad8" && !clickcenter){
    clicktop = 1;
    clickcenter = clickright = clickleft = clickbottom = 0;
  } else if(e.code=="Numpad2" && !clickcenter){
    clickbottom = 1;
    clickcenter =  clickright = clickleft = clicktop = 0;
  } else if(e.code=="Numpad6" && !clickcenter){
    clickright = 1;
    clickcenter =  clickbottom = clickleft = clicktop = 0;
  } else if(e.code=="Numpad4" && !clickcenter){
    clickleft = 1;
    clickcenter =  clickbottom = clickright = clicktop = 0;
  }
  
  if (clickcenter){
    console.log("cccc");
    console.log(clickcenter);
    if (e.code=="Numpad4") {
        //console.log(e.code);
        document.getElementById("b8").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0;
    } else if (e.code=="Numpad6") {
        document.getElementById("b11").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0;
    } else if (e.code=="Numpad8") {
        document.getElementById("b2").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0;
    } else if (e.code=="Numpad2") {
        document.getElementById("b5").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0;
    } 
  } else if (clickleft) {
    if (e.code=="Numpad7") {
        document.getElementById("b1").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    } else if (e.code=="Numpad1") {
        document.getElementById("b4").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    } //clickcenter=1; clickcenter = clickright = clickleft = clicktop = clickbottom = 0; clickleft = 1;
  } else if (clickright) {
    if (e.code=="Numpad9") {
        document.getElementById("b3").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    } else if (e.code=="Numpad3") {
        document.getElementById("b6").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    }
  } else if (clicktop) {
    if (e.code=="Numpad7") {
        document.getElementById("b7").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    } else if (e.code=="Numpad9") {
        document.getElementById("b10").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    }
  } else if (clickbottom) {
    if (e.code=="Numpad1") {
        document.getElementById("b9").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    } else if (e.code=="Numpad3") {
        document.getElementById("b12").click();
        clickcenter = clickright = clickleft = clicktop = clickbottom = 0; 
    } 
  }
}
addEventListener("keydown", E);

for (var i=1;i<=9;i++) {
  document.getElementById("n"+i).onmouseup = function(e) {
    console.log("Numpad"+this.id.substr(1));
    E({'code': "Numpad"+this.id.substr(1)});
  } /*
  document.getElementById("n"+i).onmousedown = function(e) {
    console.log("Numpad"+this.id.substr(1));
    E({'code': "Numpad"+this.id.substr(1)});
  }
  */
}