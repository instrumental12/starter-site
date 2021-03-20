<script>
  import { createEventDispatcher, getContext, onMount } from 'svelte';
  import defaultCode from '../conf/code.js';
  import Sandbox from '@beyondnft/sandbox';
  import { ipfs } from '../utils.js';
  // import { init } from "../components/captureWebM"
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HemisphereLight, LinearToneMapping, Box3, SpotLight, Scene, Color, Object3D, Vector3, PerspectiveCamera, PointLight, SphereGeometry, MeshStandardMaterial, InstancedMesh, Matrix4, AxesHelper, WebGLRenderer } from 'three'
import seedrandom from 'seedrandom'
import CCapture from '../components/ccapture.js/src/CCapture.js'
import { writable } from 'svelte/store';
// import { RGBA_ASTC_10x10_Format } from 'three/build/module';
// import * as CCapture from '../../../node_modules/ccap
  
  // import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  // import { HemisphereLight, Box3, Object3D, Vector3, PerspectiveCamera, PointLight, SphereGeometry, MeshStandardMaterial, InstancedMesh, Matrix4, AxesHelper, WebGLRenderer } from 'three'
  // import seedrandom from 'seedrandom'
  // // import createCanvasContext from 'canvas-context'
  // import createCanvasRecorder from 'canvas-recorder'

  
  // const width = 100;
  // const height = 100;
  // const depth = 100;
  // const { context, canvas } = createCanvasContext("3d", {
  //   width,
  //   height,
  //   depth
  // });
  // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // async function record() {
  //   // Create recorder
  //   const canvasRecorder = createCanvasRecorder(canvas);
  //   canvasRecorder.start();

  //   // Start canvas animation
  //   animate();

  //   // Let it run for 2 seconds
  //   await sleep(2000);

  //   // Stop and dispose
  //   canvasRecorder.stop();
  //   canvasRecorder.dispose();
  // }

  // record();
  // const CCapture = require('../components/ccapture.js/src/CCapture')
  // import CCapture from '../components/ccapture.js/src/CCapture'
// import * as CCapture from '../../../node_modules/ccapture.js/build/CCapture.all.min.js'
// import download from '../../../node_modules/ccapture.js/src/download'
// const CCapture = require('../../../node_modules/ccapture.js/src/CCapture)
// import CCapture from './ccapture.js/CCapture'
// import download from "./ccapture.js/download"
// import WebMWriter from "./ccapture.js/webm-writer-0.2.0"
//Stabilization likely should *always* be on
//TODO: Enable tweening of camera viewpoint
// import 
  // onMount(()=>init())
  //Stabilization likely should *always* be on
//TODO: Enable tweening of camera viewpoint
  const app = getContext('app');
  const dispatch = createEventDispatcher();
  // export const innerHeight = writable(100)
  // export const innerWidth = writable(100)
  export let innerHeight;
  export let innerWidth;
  console.log(innerHeight, innerWidth)
  let contract = $app.contract;
  let account = $app.account;

  let view;
  let data;
  let mintText;

  let name = 'asdf';
  let description = 'asdf';
  let attributes = {};
  let image = '';
  let dependencies = [];
  let code = defaultCode;
  let valid = false;

  // temp values
  let attrKey = '';
  let attrValue = '';
  let dependency = '';
  let dependencyType = 'script';

  $: view && code && data && renderSandbox();
  // $: {
  //   init(); animate();
  // }
  $: {
    let _data = {
      name,
      description,
      attributes,
      image,
    };

    if (code) {
      _data.interactive_nft = {
        code,
        dependencies,
      };

      data = _data;

      validate();
    }
  }

  function onFile(e) {
    if (this.files && this.files.length) {
      image = this.files[0];
    }
  }

  function validate() {
    let _valid = true;
    _valid = _valid && data.name.trim() !== '';
    _valid = _valid && data.description.trim() !== '';
    _valid = _valid && data.image;
    _valid = _valid && data.interactive_nft.code;
    valid = _valid;
  }

  let _sandbox;
  function renderSandbox() {
    if (_sandbox) {
      _sandbox.$destroy();
    }

    view.innerHTML = '';
    _sandbox = new Sandbox({
      target: view,
      props: {
        data,
      },
    });
  }

  function addDependency() {
    if (dependency.trim() !== '') {
      dependencies.push({
        url: dependency,
        type: dependencyType,
      });
      dependencies = dependencies;
      dependency = '';
      dependencyType = 'script';
    }
  }

  function removeDependency(dep) {
    dependencies.splice(dependencies.indexOf(dep), 1);
    dependencies = dependencies;
  }

  function addAttribute() {
    if (attrKey.trim() !== '' && attrValue.trim() !== '') {
      attributes[attrKey] = attrValue;
      attributes = attributes;
      attrKey = attrValue = '';
    }
  }

  function removeAttribute(key) {
    delete attributes[key];
    attributes = attributes;
  }
  let seed = 'Buck';
//Stabilization likely should *always* be on
//TODO: Enable tweening of camera viewpoint
let camera, scene, renderer, mesh, headlight;

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

setupButtons();


export const init = async () => {
	// const $attributes = document.getElementById('attributes');

	palette = [ 0xEEF50C, 0x3498DB, 0xEAEDED, 0xF2B077, 0xF24405 , 0x68F904, 0xBCC112, 0xA93226];
	rand = new seedrandom(seed);
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


	var props = {
		metal: (metaly > 0),
		yRot: (rotationRate > 0),
		xRot: (rotationRate2 > 0),
		zRot: (rotationRate3 > 0)
	};
	var rarity = 1/((props.metal ? 0.2 : 0.8) * (props.yRot ? 0.25 : 0.75) * (props.xRot ? 0.25*0.25 : (1-0.25*0.25)) * (props.zRot ? 0.25*0.25*0.25 : (1-0.25*0.25*0.25)));
	var attr = "Metallic: " + (props.metal ? "True" : "False") + "\n" +
			"Has y-rotation: " + (props.yRot ? "True" : "False") + "\n" +
			"Has x-rotation: " + (props.xRot ? "True" : "False") + "\n" +
			"Has z-rotation: " + (props.zRot ? "True" : "False") + "\n" +
			"Number of Particles: " + count + "\n" +
			"Size of Particles: " + size + "\n" +
			"Speed mutliplier: " + random + "\n" + 
			"Rarity: 1 in " + rarity.toFixed(0);

	// $attributes.value = attr;
 

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

	if(typeof newSeed === 'undefined') {
		renderer = new WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.toneMapping = LinearToneMapping;
	  	
		document.body.appendChild( renderer.domElement );
		// window.addEventListener( 'resize', onWindowResize );
	}

	controls = new OrbitControls(camera, renderer.domElement);


}

function reset() {
	seed = (' ' + newSeed).slice(1);//Force deep copy of newSeed
	//Remove all
	scene.traverse(object => {
		if (!object.isMesh) return
		
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
		material.dispose()

		// dispose textures
		for (const key of Object.keys(material)) {
			const value = material[key]
			if (value && typeof value === 'object' && 'minFilter' in value) {
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
  
}


init();

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
	// $start.addEventListener('click', e => {
	// 	e.preventDefault();
	// 	resize(sizes,sizes);
	// 	recorder.start();
	// 	$start.style.display = 'none';
	// 	recording = true;
	// 	speedMult = OVER_POWER;
	// }, false);
	// $headlamp.addEventListener('click', e => {
	// 	e.preventDefault();
	// 	if(HEADLAMP) {
	// 		$headlamp.innerHTML = "Enable Headlamp"
	// 		HEADLAMP = false;
	// 		camera.remove(headlight);
	// 	} else {
	// 		$headlamp.innerHTML = "Disable Headlamp"
	// 		HEADLAMP = true;
	// 		camera.add(headlight);
	// 	}

	// }, false);
	// $stabilize.addEventListener('click', e => {
	// 	e.preventDefault();
	// 	if(params.stabilize) {
	// 		$stabilize.innerHTML = "Enable Stabilization"
	// 		params.stabilize = false;
	// 	} else {
	// 		$stabilize.innerHTML = "Disable Stabilization"
	// 		params.stabilize = true;
	// 	}

	// }, false);
	// $lock.addEventListener('click', e => {
	// 	e.preventDefault();
	// 	if(params.lock) {
	// 		$lock.innerHTML = "Enable Camera-Lock"
	// 		params.lock = false;
	// 	} else {
	// 		$lock.innerHTML = "Disable Camera-Lock"
	// 		params.lock = true;
	// 	}

	// }, false);
	// $reset.addEventListener('click', e => {
	// 	e.preventDefault();
	// 	newSeed = document.getElementById("textareaID").value;

	// 	reset();
	// }, false);
}

// function onRecordingEnd() {
// 	recording = false;
// 	recorder.stop();
// 	recorder.save();

// 	onWindowResize();
// 	const $start = document.getElementById('start');
// 	$start.style.display = 'inline';
// 	speedMult = 1;
// }

function resize(width, height){
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}


function animate() {
	render();

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

animate();



var webMfile = writable();
var blob = new Blob();
function onRecordingEnd() {
  console.log('asdf')
  recording = false;
  recorder.stop();
  recorder.save((_blob) => blob = _blob);
  const file = new File([blob], "BlobFile", {type: 'video/webm'})
  const formData = new FormData();
  formData.append('webM', blob)
  console.log(formData.entries().next().value)
  webMfile.update((f)=>formData.entries().next().value[1]);
  
    //recorder.save( function( blob ) { /* ... */ 
    //This is where stuff is done with the blob
    //console.log(blob);
  // } );

  onWindowResize();
  console.log("saved");
  const $start = document.getElementById('start');
  $start.style.display = 'inline';
  speedMult = 1;
}


async function mint() {
    if (
      !confirm(
        `We are ready to send data to IPFS and then to the contract ${$app.contract._address}.\nAre you sure?`
      )
    ) {
      return;
    }

    mintText = 'Uploading image to ipfs...';
    await ipfs.connect('https://ipfs.infura.io:5001');
    console.log(image)
    console.log(webMfile, $webMfile)
    console.log([blob])
    const file2 = new File([blob], 'blob.webm')
    console.log(file2)
    // file2.size = blob.size
    // console.log(file2)
    let file_ = await ipfs.add(file2);
    console.log(file_)
    const image_uri = `https://gateway.ipfs.io/ipfs/${file_.path}`;
    data.image = image_uri;
    console.log('IMAGE URL', image_uri);

    mintText = 'Uploading code to ipfs...';
    file_ = await ipfs.add(code);
    const code_uri = `https://gateway.ipfs.io/ipfs/${file_.path}`;
    console.log('CODE URL', code_uri);
    delete data.interactive_nft.code;
    data.interactive_nft.code_uri = code_uri;

    let nextId = await contract.methods.totalSupply().call();
    // here is where you'd set external_url in the json

    mintText = 'Uploading NFT metadata to ipfs...';
    file_ = await ipfs.add(JSON.stringify(data));
    const json_uri = `https://gateway.ipfs.io/ipfs/${file_.path}`;

    mintText =
      'Adding NFT to blockchain - See MetaMask (or the like) for transaction';
    console.log('JSON URL', json_uri);

    // await contract.methods.mint(nextId, account, json_uri).send();
    const value = 0.15;
    const pay = await contract.methods.pay($app.web3.utils.toWei("0.15", 'ether'), nextId, account, json_uri).send({from: $app.account, value: $app.web3.utils.toWei("0.15", 'ether')})
    dispatch('minted');
    console.log(pay)
  }
export const withdrawFunds = async () => {
  await contract.methods.sendValue(account, $app.web3.utils.toWei("0.15", 'ether'));

}
</script>

  

<style>
  section {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 10px 0;
    position: relative;
  }

  .render {
    position: sticky;
    top: 0;

    width: 50%;
    flex: 0 0 auto;
  }

  .form {
    width: 50%;
    border-right: 1px solid black;
    text-align: left;
  }

  form > div,
  form > label {
    margin-top: 20px;
  }

  h2 {
    margin: 20px 0;
    text-align: center;
    color: #ff3e00;
  }

  h2:first-child {
    margin-top: 0;
  }

  label strong {
    display: block;
  }

  ul {
    margin: 5px 0;
  }

  .remove {
    cursor: pointer;
    text-decoration: underline;
  }

  .row {
    display: flex;
    flex-direction: row;
  }

  .code {
    width: 100%;
    min-height: 250px;
  }

  .minting {
    padding: 20px;
    text-align: center;
  }
</style>



<svelte:window on:resize={onWindowResize()}/>
<section>
  
  <div class="form">
    <form on:submit|preventDefault>
     
      <h2>NFT properties</h2>
      <label>
        <strong>Name</strong>
        <input type="text" bind:value={name} />
      </label>
      <label>
        <strong>Description</strong>
        <textarea bind:value={description} />
      </label>
      <label>
        <strong>Image</strong>
        <input type="file" on:change={onFile} />
        <br /><em>This will be shown on preview and on platform where
          interactiveNFT are not supported</em>
      </label>
      <div>
        <strong>Attributes</strong>
        <ul>
          {#each Object.keys(attributes) as key}
            <li>
              <strong>{key}</strong>:
              {attributes[key]}
              (<em
                class="remove"
                on:click={() => removeAttribute(key)}>remove</em>)
            </li>
          {:else}
            <p>No attributes yet.</p>
          {/each}
        </ul>
        <div>
          <strong>New attribute</strong>
          <div class="row">
            <label> <strong>key</strong> <input bind:value={attrKey} /> </label>

            <label>
              <strong>value</strong>
              <input bind:value={attrValue} />
              <button on:click={addAttribute}>add</button>
            </label>
          </div>
        </div>
        <h2>InteractiveNFT specific</h2>
        <div>
          <strong>Dependencies</strong>
          <ul>
            {#each dependencies as dependency}
              <li>
                <a href={dependency.url} target="blank">({dependency.type})
                  {dependency.url}</a>
                (<em
                  class="remove"
                  on:click={() => removeDependency(dependency)}>remove</em>)
              </li>
            {:else}
              <p>
                No dependency yet.<br />
                <em>Script and Style that will be loaded before your code.<br />
                  You can add things like
                  <a
                    href="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js"
                    target="_blank">p5.js</a>
                  or d3.js or js or ...</em>
              </p>
            {/each}
          </ul>
          <label>
            <strong>Dependency</strong>
            <input bind:value={dependency} />
            <select bind:value={dependencyType}>
              <option selected value="script">script</option>
              <option value="style">style</option>
            </select>
            <button on:click={addDependency}>add</button>
          </label>
        </div>
      </div>
      <label>
        <strong>Code! (needs to be valid html)</strong><textarea
          class="code"
          bind:value={code} /></label>

      <div class="minting">
        {#if !mintText}
          <button on:click={mint}>Mint this!</button>
        {:else}<strong>{mintText}</strong>{/if}
      </div>
    </form>
  </div>
  <div class="render">
    <h2>Preview</h2>
    <div bind:this={view} />
      <div class="buttons">
        <button on:click={withdrawFunds()}>Withdraw funds</button>
      <button id="start" >Start recording to WebM</button>
      <button id="stop">Stop (or wait 4 seconds)</button>
    </div>
  </div>

  
</section>
