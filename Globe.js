import * as THREE from './build/three.module.js';
import Stats from './jsm/libs/stats.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';

import * as param from './Param.js'
import * as country from './Country.js'
import * as curve from './Curve.js'


export let camera, controls, scene, renderer;
export let cube;
export let material;
export let stats, container;
export let latitude, longitude;

let VietNam,American,China,Belarus,Cameroon 



const objects = [];

function createStatsGUI() {

    var thisParent;

    //Create new Graph (FPS, MS, MB)
    let stats1 = new Stats();

    //Display different panel
    stats1.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats1.domElement.style.width = '400px';
    stats1.domElement.style.height = '400px';

    //Add Stats to Document - modal 4
    thisParent.appendChild( stats1.domElement );
}

const aboutGlobe = document.getElementById("aboutGlobe");



const TransformMatrix = function () {

    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    return function ( matrix ) {

        const cubePos = lglt2xyz(latitude, longitude, param.globeRadius); 

        position.x = cubePos.x;
        position.y = cubePos.y;
        position.z = cubePos.z;

        rotation.x = rotation.y = rotation.z = 0;

        quaternion.setFromEuler( rotation );

        scale.x = scale.y = scale.z = 1;

        matrix.compose( position, quaternion, scale );

    };

}();


const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

init(aboutGlobe);
main();
render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function degreeToRadian(angle) {
        const radians = Math.PI / 180
        return angle * radians;
    }

//longtidude, latitude to XYZ
function lglt2xyz(country,radius) {

    let longitude = country[0]
    let latitude = country[1]

    const r = degreeToRadian(90 - longitude)
    const s = degreeToRadian(latitude + (180))

    const x = (-radius * Math.sin(r) * Math.cos(s))
    const y = (radius * Math.cos(r))
    const z = (radius * Math.sin(r) * Math.sin(s))

    return new THREE.Vector3(x, y, z)

}


function init(target=null, showStat=true) {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFFFFFF );
    scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( target.offsetWidth, target.offsetHeight );
    if (target) {
        target.appendChild( renderer.domElement );
    } else {
        document.body.appendChild( renderer.domElement );
    }

    if (showStat) {
        stats = new Stats();
        document.body.appendChild( stats.dom );
    }

    camera = new THREE.PerspectiveCamera( 60, target.offsetWidth / target.offsetHeight, 1, 1000 );
    camera.position.set( 400, 200, 0 );


    // controls
    controls = new OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

}


function main() {

    let VietNam = lglt2xyz ( country.VietNam, param.globeRadius);
    let American = lglt2xyz ( country.American, param.globeRadius);
    let China = lglt2xyz ( country.China, param.globeRadius)
    let Belarus = lglt2xyz ( country.Belarus, param.globeRadius);
    let Cameroon = lglt2xyz (country.Cameroon, param.globeRadius);

    //Add Pin Location
    AddPin(VietNam);
    AddPin(American);
    AddPin(China);
    AddPin(Belarus);
    AddPin(Cameroon);

    var VN = new curve.Curves(VietNam, American).getCurve()
    
    // curve.getCurve(VietNam, American);
    // curve.getCurve(VietNam, China);
    // curve.getCurve(VietNam, Belarus);
    // curve.getCurve(VietNam, Cameroon);
    
    //DrawGlobe
    DrawGlobe();
    DrawSphereDot();
    Light();
    window.addEventListener( 'resize', onWindowResize );

};

function AddPin( country ) {

    let mesh = new THREE.Mesh(
        new THREE.SphereBufferGeometry(2,20,20),
        new THREE.MeshNormalMaterial()
    )

    mesh.position.set(country.x,country.y,country.z);
    scene.add(mesh);

}

function DrawGlobe() {

    const loader = new THREE.TextureLoader();
    
    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        map: loader.load('https://iamtung-0000.github.io/OCG-Globe/textures/earth_region.png'),
        });
    
    const materialMesh = new THREE.Mesh(
        new THREE.SphereGeometry(param.globeRadius-5,32,32),
        material
    )

    scene.add(materialMesh);

};


function visibilityForCoordinate(long, lat) {

    //const imagedata;
    //get long, lat corndinate, 
    //read image data if data = 255 true, else false

}

function latLonToOffsets(latitude, longitude, mapWidth, mapHeight) {
    const radius = mapWidth / (2 * Math.PI);
    const FE = 180; // false easting

    const lonRad = degreeToRadian(longitude + FE);
    const x = lonRad * radius;

    const latRad = degreeToRadian(latitude);
    const verticalOffsetFromEquator =
        radius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = mapHeight / 2 - verticalOffsetFromEquator;

    return { x, y };
    
}

function DrawSphereDot() {

    const BoxGeometry = new THREE.BoxBufferGeometry( 0.5, 0.5, 0.5 );
    const BoxMaterial = new THREE.MeshNormalMaterial();
    const matrix = new THREE.Matrix4();
    const mesh = new THREE.InstancedMesh( BoxGeometry, BoxMaterial, 32475 );
    let t = 1;

    for (  latitude = -90; latitude < 90; latitude += 1) { 
        const a = Math.abs((Math.abs(latitude)) - 90) ;

        for (  longitude = 0; longitude < 360; longitude += 360/(4*a) ) { 
            //find x,y offset
            const offset = latLonToOffsets(latitude, longitude, 2048, 1024);
            //find alpha base on x,y
            t++;
            TransformMatrix( matrix );
            //set matrix transformation
            mesh.setMatrixAt( t, matrix );
        }
    }

    scene.add( mesh );

}


function Light() {

    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );

}


function onWindowResize() {

    camera.aspect = aboutGlobe.offsetWidth / aboutGlobe.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( aboutGlobe.offsetWidth, aboutGlobe.offsetHeight );

}

function animate() {

    requestAnimationFrame( animate );



    //curve.icr+= 80;

    // curve.geometry.setDrawRange(0, curve.icr);

    // if (icr > 14000) {
    //     curve.icr = 0;
    //     console.log(curve.icr)
    // } 

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    //DrawSphereDot();
    render();
    stats.update()

}

function render() {
    renderer.setClearColor( 0x000000, 0 ); // the default
    renderer.render( scene, camera );
}