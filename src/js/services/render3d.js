'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;
// require('three/examples/js/loaders/MTLLoader.js');
// require('three/examples/js/loaders/OBJLoader.js');
// window.Zlib = require('zlibjs');

const colladaLoader = require('../util/three/loader/collada.js');
const objLoader = require('../util/three/loader/obj.js');

const time = require('../util/time.js');

const degreeToRadiant = deg => Math.PI / (180 / deg);
const calcucalateAngle = (viewport, range) => ({
	x: (viewport.mouse.x / viewport.screen.width * range.h) + range.hOffset,
	y: (viewport.mouse.y / viewport.screen.height * range.v) + range.vOffset
});

// Leather_Seat
const updateMaterials = object => object.traverse(function(child) {
	// if (child instanceof THREE.Mesh) {
	switch (child.name) {
		case 'Arm_Rest_1':
		case 'Arm_Rest_2':
			child.material = new THREE.MeshPhongMaterial({
				color: 0xbbbebf, specular: 0xaaeeff, shininess: 30, flatShading: true
			});
			break;
		case 'Leather_Seat':
			child.material = new THREE.MeshPhongMaterial({
				color: 0x333333, specular: 0xeebbaa, shininess: 0, flatShading: true
			});
			break;
		case 'Leg':
		case 'Pneumatic_Part':
			child.material = new THREE.MeshPhongMaterial({
				color: 0xeeeeee, specular: 0xaaaaaa, shininess: 150, flatShading: true
			});
			break;
		case 'Array_Object':
			child.material.transparent = true;
			child.material.opacity = 0;
			break;
		default:
	}
	if (child instanceof THREE.Mesh) {
		child.castShadow = true;
		child.receiveShadow = true;
	}
		// child.material.normalMap = normal;
	// }
});

const shadowize = object => object.traverse(child => {
	if (child instanceof THREE.Mesh) {
		child.castShadow = true;
		child.receiveShadow = true;
	}
});

const createPlane = (url, repeat = [4, 4], mat = {}, size = [200, 100]) => {
	let texture = new THREE.TextureLoader().load(url);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(repeat[0], repeat[1]);
	let material = new THREE.MeshPhongMaterial({
		...mat,
		map: texture
	});
	let plane = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material);
	return plane;
};

const addGround = scene => {
	let texture = new THREE.TextureLoader().load('assets/textures/floor_tile.jpg');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(4, 4);

	let textureNormal = new THREE.TextureLoader().load('assets/textures/floor_tile_normal.jpg');
	textureNormal.wrapS = THREE.RepeatWrapping;
	textureNormal.wrapT = THREE.RepeatWrapping;
	textureNormal.repeat.set(4, 4);

	let material = new THREE.MeshPhongMaterial({
		map: texture,
		// bumpMap: textureNormal,
		// bumpScale: 0.7,
		reflectivity: 0,
		shininess: 0
	});
	let plane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
	plane.rotation.x = -Math.PI / 2;
	plane.position.y -= 20.5;
	plane.receiveShadow = true;
	scene.add(plane);

	var fabricGeometry = new THREE.CircleGeometry(30, 50);
	let textureFabric = new THREE.TextureLoader().load('assets/textures/fabric.jpg');
	textureFabric.wrapS = THREE.RepeatWrapping;
	textureFabric.wrapT = THREE.RepeatWrapping;
	textureFabric.repeat.set(2, 2);
	let materialFabric = new THREE.MeshPhongMaterial({
		map: textureFabric,
		color: 0x777777,
		specular: 0xaaaaaa, shininess: 3, flatShading: false
	});
	var fabricMat = new THREE.Mesh(fabricGeometry, materialFabric);
	fabricMat.rotation.x = -Math.PI / 2;
	fabricMat.position.y -= 20;
	fabricMat.receiveShadow = true;
	scene.add(fabricMat);

	let wallRight = createPlane('assets/textures/brick.jpg', [4, 2], {
		color: 0x333333, specular: 0xaabbcc, shininess: 0, flatShading: true
	}, [200, 80]);
	// fabricMat.rotation.x = -Math.PI / 2;
	wallRight.position.z -= 99;
	wallRight.position.y += 19;
	scene.add(wallRight);

	let wallBack = createPlane('assets/textures/brick.jpg', [4, 2], {
		color: 0x333333, specular: 0xaabbcc, shininess: 0, flatShading: true
	}, [200, 80]);
	wallBack.rotation.y = Math.PI / 2;
	wallBack.position.x -= 99;
	wallBack.position.y += 19;
	scene.add(wallBack);
};

const addLights = scene => {
	scene.add(new THREE.AmbientLight(0xcccccc, 0.2));
	// scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
	// scene.add(new THREE.PointLight(0xffffff, 0.3));
	let dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.color.setHSL(0.1, 0, 0.3);
	dirLight.position.set(0.5, 1.5, -1);
	dirLight.position.multiplyScalar(30);
	dirLight.castShadow = true;
	dirLight.shadowCameraVisible = true;
	// var d = 200;
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 1024;
	dirLight.shadow.mapSize.height = 1024;
	var d = 700;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 2000;
	dirLight.shadow.bias = -0.001;
	scene.add(dirLight);

	let dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
	// scene.add(dirLightHeper);
};

const init = parentNode => {
	let width = parentNode.offsetWidth;
	let height = parentNode.offsetHeight;

	// let camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
	let camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
	camera.position.z = 100;
	camera.position.y = 50;

	let scene = new THREE.Scene();

	// lights
	addLights(scene);

	// ground
	addGround(scene);

	// cube
	// let texture = new THREE.TextureLoader().load('assets/textures/red-tile.png');
	// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	// texture.repeat.set(2, 2);
	// let geometry = new THREE.BoxBufferGeometry(200, 200, 200);
	// let material = new THREE.MeshBasicMaterial({map: texture});
	// let mesh = new THREE.Mesh(geometry, material);
	// scene.add(mesh);
	var items = [];

	colladaLoader.load('assets/model/chair.dae')
		.subscribe(collada => {
			let object = collada.scene;
			object.castShadow = true;
			object.receiveShadow = true;
			items.push(object);
			console.log(object);
			object.scale.set(40, 40, 40);
			updateMaterials(object);
			scene.add(object);
			object.position.copy(new THREE.Vector3().fromArray([0, -20, 0]));
			camera.lookAt(object.position);
		});

	// plant
	colladaLoader.load('assets/model/plant.dae')
		.subscribe(collada => {
			let object = collada.scene;
			object.castShadow = true;
			object.receiveShadow = true;
			shadowize(object);
			items.push(object);
			scene.add(object);
			object.scale.set(40, 40, 40);
			object.position.copy(new THREE.Vector3().fromArray([-40, -20, -50]));
		});

	let renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	parentNode.innerHTML = '';
	parentNode.appendChild(renderer.domElement);
	return {
		scene,
		camera,
		renderer,
		items
	};
};

const render = ({items, scene, camera, renderer, state}) => {
	// console.log(items);
	if (items[0]) {
		// items[0].rotation.z += 0.01;
		// items[0].rotation.y += 0.01;
	}
	const centerPos = new THREE.Vector3().fromArray([0, 0, 0]);

	if (state.viewport.mouse.down) {
		const cameraAngle = calcucalateAngle(state.viewport, state.camera.range);

		camera.position.copy(new THREE.Vector3().fromArray([
			// x
			Math.cos(degreeToRadiant(cameraAngle.x)) *
				Math.cos(degreeToRadiant(cameraAngle.y)) * state.camera.distance,
			// y
			-Math.sin(degreeToRadiant(cameraAngle.y)) * state.camera.distance,
			// z
			-Math.cos(degreeToRadiant(cameraAngle.y)) *
				Math.sin(degreeToRadiant(cameraAngle.x)) * state.camera.distance
		]));
	}

	camera.aspect = state.viewport.screen.width / (state.viewport.screen.height);
	camera.updateProjectionMatrix();
	camera.lookAt(centerPos);
	renderer.setSize(state.viewport.screen.width, state.viewport.screen.height);
	renderer.render(scene, camera);
};

let unhook = () => {};
let hook = ({state$, actions}) => {
	let subs = [];

	let scene$ = $.interval(100)
		.map(() => document.querySelector('#view3d'))
		.distinctUntilChanged(el => el)
		.filter(el => el)
		.map(init)
		.share();

	subs.push(
		$.combineLatest(
			scene$,
			state$,
			time.frame(),
			(sceneItems, state, dt) => ({...sceneItems, state})
		)
			.subscribe(render)
	);

	subs.push(
		() => {
			console.log('cleaning up scene');
			let cleanupSub = $.just({}).withLatestFrom(scene$, (j, scene) => scene)
				.subscribe(({renderer}) => {
					renderer.dispose();
					cleanupSub.dispose();
				});
		}
	);

	unhook = () => {
		console.log(subs);

		subs.forEach(sub => sub.dispose ? sub.dispose() : sub());
	};
};

module.exports = {
	hook,
	unhook: () => unhook()
};
