import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HemisphereLight, Box3, Color, Object3D, Vector3, PerspectiveCamera, PointLight, SphereGeometry, MeshStandardMaterial, InstancedMesh, Matrix4, AxesHelper, WebGLRenderer } from 'three'
import seedrandom from 'seedrandom'
import CCapture from './ccapture.js/src/CCapture.js'
let seed = 'Buck';
//Stabilization likely should *always* be on
//TODO: Enable tweening of camera viewpoint
let camera, scene, renderer, mesh, headlight;
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

//Declare constants
const fr = 30;
const limit = 20;
const actual = 5;
let sizes = 350;
const recorder = new CCapture({
	verbose: false,
	display: true,
	framerate: fr,
	quality: 75,
	format: 'webm',
	timeLimit: limit,
	frameLimit: 0,
	autoSaveTime: 0
});

let STABILIZE = true;
let CAMERA_LOCK = false;
let OVER_POWER= 7;
let HEADLAMP = false;

var params = {
	stabilize: STABILIZE,
	lock: CAMERA_LOCK 
}
const color = new Color();


//Declare global vars
let rand, random, b, dummy, visPos, pos, totalAve, offsets, recording, frame, speedMult, count, amount, newSeed, palette;
let size, intensityBoost, metaly, rough, emissivity, random2, random3, random4, rotationRate, rotationRate2, rotationRate3, controls, container;

init();
setupButtons();
animate();


function init() {
	palette = [ 0xEEF50C, 0x3498DB, 0xEAEDED, 0xF2B077, 0xF24405 , 0x68F904, 0xBCC112, 0xA93226];
	rand = new Math.seedrandom(seed);
	random = rand();
	b = random * 208186.01 / 1000000.01;
	dummy = new Object3D();
	visPos = [];
	pos = [];
	totalAve = new Vector3();
	offsets = new Vector3();
	recording = false;
	frame = 0;
	speedMult = 1;

	size = 0.25 + random;
	intensityBoost = 1;

	randomize();


	amount = rand()*20+20;
	count = Math.pow( amount, 3 );

	camera = new PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set( 77, 77, 77 );
	camera.lookAt( 0, 0, 0 );

	scene = new Scene();
	scene.background = new Color( 0x444444 );
	initLights(scene, camera);


	const geometry = new SphereGeometry( size, 5, 3 );

	const material = new MeshStandardMaterial( {
		color: 0xffffff,
		roughness: rough, //Shinyness
		metalness: metaly,
		emissiveIntensity: emissivity,
		emissive: 0x25fae8
	});
	material.color = material.color.convertSRGBToLinear();
	material.emissive = material.emissive.convertSRGBToLinear();

	mesh = new InstancedMesh( geometry, material, count );

	let counter = 0;
	const offset = ( amount - 1 ) / 2;

	const matrix = new Matrix4();

	for ( let x = 0; x < amount; x ++ ) {

		for ( let y = 0; y < amount; y ++ ) {

			for ( let z = 0; z < amount; z ++ ) {

				matrix.setPosition( offset - x, offset - y, offset - z );

				var index = getQuadrant(x,y,z,offset);
				color.setHex(palette[index]).convertSRGBToLinear();

				mesh.setMatrixAt( counter, matrix );
				mesh.setColorAt( counter, color );
			
				var position = new Vector3( offset - x, offset - y, offset - z );
				pos.push(position);
				visPos.push(position.clone());
				counter++;

			}

		}

	}


	scene.add( mesh );
	geometry.dispose();
    material.dispose();
	//Axis reference location
	//const axesHelper = new AxesHelper( 50);
	//scene.add( axesHelper );

	if(typeof newSeed === 'undefined') {
		renderer = new WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.toneMapping = LinearToneMapping;
	  	
		document.body.appendChild( renderer.domElement );
		window.addEventListener( 'resize', onWindowResize );
	}

	controls = new OrbitControls(camera, renderer.domElement);


}

function reset() {
	seed = (' ' + newSeed).slice(1);//Force deep copy of newSeed
	console.log(seed);
	//Remove all
	scene.traverse(object => {
		if (!object.isMesh) return
		
		console.log('dispose geometry!')
		object.geometry.dispose()

		if (object.material.isMaterial) {
			cleanMaterial(object.material)
		} else {
			// an array of materials
			for (const material of object.material) cleanMaterial(material)
		}
	})

	



	while(scene.children.length > 0){ 
    	scene.remove(scene.children[0]);
	}

	renderer.renderLists.dispose();

	init();
	animate();
}

const cleanMaterial = material => {
		console.log('dispose material!')
		material.dispose()

		// dispose textures
		for (const key of Object.keys(material)) {
			const value = material[key]
			if (value && typeof value === 'object' && 'minFilter' in value) {
				console.log('dispose texture!')
				value.dispose()
			}
	}
}

function randomize() {
	//Randomize palette
	for(var iter = 0; iter < palette.length; iter++) {
		var val = palette[iter];
	    var num = parseInt(Number(val), 10);
	    num += Math.floor(16777215*rand()%16777215);
	    var newVal = "0x"+num.toString(16);
	    console.log(newVal);
	    palette[iter] = newVal;
	}

	//Randomize if shiny or not
	//0.8 to keep it kinda rare
	if(rand() > 0.8) {
		metaly = rand();
		rough = rand();
		emissivity = 0.1*rand();
	  	intensityBoost = 1;
	} else {
		metaly = 0; 
		rough = 1;
		emissivity = 0;
	}

	random2 = rand() * ( random > 0.5 ? 1 : -1);
	random3 = rand() * ( random2 > 0.5 ? 1 : -1);
	random4 = rand() * ( random3 > 0.5 ? 1: -1);
	rotationRate = (rand() > 0.75 ? 0.005 : 0);
	rotationRate2 = (rand() > 0.75 & rotationRate > 0 ? 0.005 : 0);
	rotationRate3 = ((rand() > 0.75 & rotationRate > 0 & rotationRate2 > 0) ? 0.005 : 0);
  
  console.log("Has rotation z: "+ rotationRate);
  console.log("Has rotation y: "+ rotationRate2);
  console.log("Has rotation x: "+ rotationRate3);
}



function fitCameraToSelection( camera, controls, posArray, fitOffset = 1.2 ) {
  
	const box = new Box3().setFromPoints(posArray);

	const size = box.getSize( new Vector3() );
	const center = box.getCenter( new Vector3() );

	const maxSize = Math.max( size.x, size.y, size.z ); //Find the maximum dimension of the box
	const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) ); //Fancy math
	const fitWidthDistance = fitHeightDistance / camera.aspect; //More fancy math to find distance camera needs to be to see
	const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance ); //Take whichever of these distances is larger and use it with the offset

	const direction = controls.target.clone()
	.sub( camera.position ) //Find camera position relative to target
	.normalize() //Get unit normal vector for this value
	.multiplyScalar(distance); //Convert that unit normal to distance camera needs to be from target to fit everything

	controls.maxDistance = distance * 10; //

	camera.near = distance / 100;//100 is the max view distance(?)
	camera.far = distance * 100;
	camera.updateProjectionMatrix(); //Update the camera

	camera.position.copy( controls.target ).sub(direction); //Set position of camera to our target, then subtract the direction we calculated previously

	controls.update();
  
}


function getQuadrant(x,y,z,offset) {
	var xPositive = offset - x > 0;
	var yPositive = offset - y > 0;
	var zPositive = offset - z > 0;
	if(xPositive) {
		if(yPositive) {
			if(zPositive) {
				return 0;
			} else {
				return 1;
			}
		} else {
			if(zPositive) {
				return 2;
			} else {
				return 3;
			}
		}
	} else {
		if(yPositive) {
			if(zPositive) {
				return 4;
			} else {
				return 5;
			}
		} else {
			if(zPositive) {
				return 6;
			} else {
				return 7;
			}
		}
	}
	return -1;
}

function initLights(scene, camera) {
	//ILLUMINGATED CAMERA
	headlight = new PointLight( 0xFBFAF5, intensityBoost, 300);
	if(HEADLAMP) {
		camera.add( headlight );
	}
	scene.add(camera);

	const keyLight = new SpotLight( 0xffffff, intensityBoost);
	keyLight.position.set(55, 99, 88);
	scene.add( keyLight );

	const fillLight = new SpotLight( 0xffa95c, intensityBoost/2);
	fillLight.position.set(99, 77, 55);
	scene.add( fillLight );

	const rimLight = new SpotLight( 0xffffff, intensityBoost);
	rimLight.position.set(-99, 88, -99);
	scene.add( rimLight );
}

function onWindowResize() {
	if (recording) {
		return;
	}
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function setupButtons(){
	const $start = document.getElementById('start');
	const $headlamp = document.getElementById('headlamp');
	const $stabilize = document.getElementById('stabilize');
	const $lock = document.getElementById('lock');
	const $reset = document.getElementById('reset');
	$start.addEventListener('click', e => {
		e.preventDefault();
		resize(sizes,sizes);
		recorder.start();
		$start.style.display = 'none';
		recording = true;
		speedMult = OVER_POWER;
	}, false);
	$headlamp.addEventListener('click', e => {
		e.preventDefault();
		if(HEADLAMP) {
			$headlamp.innerHTML = "Enable Headlamp"
			HEADLAMP = false;
			camera.remove(headlight);
		} else {
			$headlamp.innerHTML = "Disable Headlamp"
			HEADLAMP = true;
			camera.add(headlight);
		}

	}, false);
	$stabilize.addEventListener('click', e => {
		e.preventDefault();
		if(params.stabilize) {
			$stabilize.innerHTML = "Enable Stabilization"
			params.stabilize = false;
		} else {
			$stabilize.innerHTML = "Disable Stabilization"
			params.stabilize = true;
		}

	}, false);
	$lock.addEventListener('click', e => {
		e.preventDefault();
		if(params.lock) {
			$lock.innerHTML = "Enable Camera-Lock"
			params.lock = false;
		} else {
			$lock.innerHTML = "Disable Camera-Lock"
			params.lock = true;
		}

	}, false);
	$reset.addEventListener('click', e => {
		e.preventDefault();
		newSeed = document.getElementById("textareaID").value;

		reset();
	}, false);
}

function onRecordingEnd() {
	recording = false;
	recorder.stop();
	recorder.save();

	onWindowResize();
	console.log("saved");
	const $start = document.getElementById('start');
	$start.style.display = 'inline';
	speedMult = 1;
}

function resize(width, height){
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}


function animate() {
	stats.begin()
	render();
  stats.end();

	recorder.capture(renderer.domElement);
	if(recording) {
		frame++;
		if(frame > fr*actual) {
			onRecordingEnd();
		}
	}
	requestAnimationFrame( animate );
}

function render() {
	const SCALING_FACTOR = 10;

	if ( mesh ) {
		var reps = 0;
		while(reps < speedMult) { 

			var len = pos.length;

			if(params.stabilize) {
				offsets.copy(totalAve).divideScalar(len).negate();
				totalAve.set(0,0,0);
			}

			mesh.rotation.x += rotationRate2*random3;
		  	mesh.rotation.y += rotationRate*random2;
	   		mesh.rotation.z += rotationRate3*random4;
			let i = 0;

			while(i < count) {	

				var position = pos[i];
				var visPosition = visPos[i];

			    var dx = position.x/SCALING_FACTOR;
			    var dy = position.y/SCALING_FACTOR;
			    var dz = position.z/SCALING_FACTOR;
			      
			    var x1 = (-b*dx+Math.sin(dy))*random;
			    var y1 = (-b*dy+Math.sin(dz))*random;
			    var z1 = (-b*dz+Math.sin(dx))*random;

			    //var randCall = rand();
			    var xm = rand();
			    var ym = rand();//randCall*random3;
			    var zm = rand();//randCall*random4;

			    position.x += x1 + xm/5;
			    position.y += y1 + ym/5;
			    position.z += z1 + zm/5;	
	        	
	        	visPosition.copy(position).add(offsets);

			    if(params.stabilize) {
					dummy.position.set( visPosition.x,  visPosition.y, visPosition.z );
					totalAve = totalAve.addVectors(totalAve, position);
			  	} else {
	       			dummy.position.set( position.x,  position.y, position.z );
	        	}
			    
				dummy.updateMatrix();
				mesh.setMatrixAt( i++, dummy.matrix );
			}
			reps++;
    	}
		mesh.instanceMatrix.needsUpdate = true;
		mesh.instanceColor.needsUpdate = true;

	}
	if(params.lock) {
		fitCameraToSelection(camera, controls, visPos, 1.3)
    }
	renderer.render( scene, camera );

}
