import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Importieren von Bilddateien und Assets
import nebula from '../img/nebula.jpg';
import stars from '../img/stars.jpg';

// Pfad zur 3D-Modell-Datei
const human = new URL('../assets/human.glb', import.meta.url);

// Erstellung des Renderers
const renderer = new THREE.WebGLRenderer();
const textureLoader = new THREE.TextureLoader();

// Einstellungen für Schatten und Renderer-Größe
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Definition der Szene und Kamera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// Erstellung der OrbitControls für die Kamerasteuerung
const orbit = new OrbitControls(camera, renderer.domElement);
const axesHelper = new THREE.AxesHelper(5); // Hinzufügen eines Achsen-Hilfsobjekts zur Szene
scene.add(axesHelper);

// Kameraposition und Aktualisierung der OrbitControls
camera.position.set(-10, 30, 30);
orbit.update();

// Erstellung und Hinzufügen einer Box zur Szene
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// Erstellung einer Plane und Erzeugung einer farbigen Heightmap-Textur
const planeGeometry = new THREE.PlaneGeometry(30, 30, 100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({side: THREE.DoubleSide});

// Funktion zur Erzeugung einer farbigen Heightmap-Textur
const generateColorfulHeightmap = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'red'); // Lowest elevation (red)
    gradient.addColorStop(0.5, 'green'); // Middle elevation (green)
    gradient.addColorStop(1, 'blue'); // Highest elevation (blue)

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return new THREE.CanvasTexture(canvas);
};
const width = 256; // Adjust according to your needs
const height = 256; // Adjust according to your needs
const colorfulHeightmap = generateColorfulHeightmap(width, height);

// Konfiguration der farbigen Heightmap-Textur
colorfulHeightmap.encoding = THREE.sRGBEncoding; // Ensure correct color interpretation
colorfulHeightmap.wrapS = THREE.RepeatWrapping;
colorfulHeightmap.wrapT = THREE.RepeatWrapping;
colorfulHeightmap.repeat.set(10, 10); // Adjust tiling

planeMaterial.displacementMap = colorfulHeightmap;
planeMaterial.displacementScale = 2.5;

// Erstellung der Plane und Hinzufügen zur Szene
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI * 0.5;
plane.receiveShadow = true;
scene.add(plane);


const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF, wireframe: false
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;

// Hinzufügen von Lichtquellen (Ambient, Directional, Spot)
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);

const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

// Hinzufügen von Texturen und Hintergründen
scene.background = textureLoader.load(stars);
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([nebula, nebula, stars, stars, stars, stars]);

const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2Material = new THREE.MeshBasicMaterial({
    color: 0x00FF00, map: textureLoader.load(nebula)
});
const box2MultiMaterial = [new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}), new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}), new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}), new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}), new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}), new THREE.MeshBasicMaterial({map: textureLoader.load(stars)})];
const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.position.set(0, 15, 10);

const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const plane2Material = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, wireframe: true
});
const plane2 = new THREE.Mesh(plane2Geometry, plane2Material);
scene.add(plane2);
plane2.position.set(10, 10, 15);

plane2.geometry.attributes.position.array[0] -= 10 * Math.random();
plane2.geometry.attributes.position.array[1] -= 10 * Math.random();
plane2.geometry.attributes.position.array[2] -= 10 * Math.random();
const lastPointZ = plane2.geometry.attributes.position.array.length - 1;
plane2.geometry.attributes.position.array[lastPointZ] -= 10 * Math.random();

const sphere2Geometry = new THREE.SphereGeometry(4, 64, 64); // Adjust segments as needed for the heightmap

const sphere2Material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide, // Ensure the material is visible from both sides
    displacementMap: colorfulHeightmap, // Apply the heightmap as a displacement map
    displacementScale: 5 // Adjust the scale to control the displacement effect
});

const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
scene.add(sphere2);
sphere2.position.set(-10, 20, 10);

// Laden eines GLTF-Modells
const assetLoader = new GLTFLoader();

let mixer;
assetLoader.load(human.href, function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-10, 2, 10);

}, undefined, function (error) {
    console.error(error);
});

// Konfiguration einer GUI für Benutzerinteraktionen
const gui = new dat.GUI();
// Konfiguration einer GUI für Benutzerinteraktionen
const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01,
    angle: 0.2,
    intensity: 1
};

gui.addColor(options, 'sphereColor').onChange(function (e) {
    sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function (e) {
    sphere.material.wireframe = e;
});
gui.add(options, 'speed', 0, 0.1);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'intensity', 0, 1);

let step = 0;
const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function (e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();

const sphereId = sphere.id;
box2.name = 'theBox';
const clock = new THREE.Clock();

// Hinzufügen von post-processing Effekten für ein verbessertes Erscheinungsbild
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.5;
bloomPass.radius = 0.1;
composer.addPass(bloomPass);

// ... (Rest des vorhandenen Codes bleibt unverändert)

// Animations-Loop
function animate(time) {
    // ... (Rest des vorhandenen Codes bleibt unverändert)
    if (mixer) mixer.update(clock.getDelta());
    box.rotation.x = time / 1000;
    box.rotation.y = time / 1000;

    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));

    spotLight.angle = options.angle;
    spotLight.intensity = options.intensity;
    sLightHelper.update();

    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    //console.log(intersects);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.id === sphereId) intersects[i].object.material.color.set(0xFF0000);

        if (intersects[i].object.name === 'theBox') {
            intersects[i].object.rotation.x = time / 1000;
            intersects[i].object.rotation.y = time / 1000;
        }
        // Rendern der Szene über den Composer für die post-processing Effekte
        composer.render();

        // Weiterer Code bleibt unverändert
    }
    plane2.geometry.attributes.position.array[0] = 10 * Math.random();
    plane2.geometry.attributes.position.array[1] = 10 * Math.random();
    plane2.geometry.attributes.position.array[2] = 10 * Math.random();
    plane2.geometry.attributes.position.array[lastPointZ] = 10 * Math.random();
    plane2.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Änderungen der Fenstergröße berücksichtigen
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Größe des EffectComposers aktualisieren
    composer.setSize(window.innerWidth, window.innerHeight);
});
