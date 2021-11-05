'use strict';

var _threeModule = require('./build/three.module.js');

var THREE = _interopRequireWildcard(_threeModule);

var _statsModule = require('./jsm/libs/stats.module.js');

var _statsModule2 = _interopRequireDefault(_statsModule);

var _OrbitControls = require('./jsm/controls/OrbitControls.js');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};if (obj != null) {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
        }newObj.default = obj;return newObj;
    }
}

function createStatsGUI() {

    var thisParent;

    //Create new Graph (FPS, MS, MB)
    stats1 = new _statsModule2.default();

    //Display different panel
    stats1.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats1.domElement.style.width = '200px';
    stats1.domElement.style.height = '200px';

    //Add Stats to Document - modal 4
    thisParent.appendChild(stats1.domElement);
}

var camera = void 0,
    controls = void 0,
    scene = void 0,
    renderer = void 0;
var cube = void 0;
var material = void 0;
var stats = void 0,
    container = void 0;
var latitude = void 0,
    longitude = void 0;

var objects = [];

var sphereLon = 50;
var sphereLat = sphereLon / 2;
var globeRadius = 100;

var TransformMatrix = function () {

    var position = new THREE.Vector3();
    var rotation = new THREE.Euler();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();

    return function (matrix) {

        var cubePos = lglt2xyz(latitude, longitude, globeRadius);

        position.x = cubePos.x;
        position.y = cubePos.y;
        position.z = cubePos.z;

        rotation.x = rotation.y = rotation.z = 0;

        quaternion.setFromEuler(rotation);

        scale.x = scale.y = scale.z = 1;

        matrix.compose(position, quaternion, scale);
    };
}();

var clamp = function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
};

init("aboutGlobeFull");
main();
render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function degreeToRadian(angle) {
    var radians = Math.PI / 180;
    return angle * radians;
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

//longtidude, latitude to XYZ
function lglt2xyz(longitude, latitude, radius) {
    var r = degreeToRadian(90 - longitude);
    var s = degreeToRadian(latitude + 180);
    var x = -radius * Math.sin(r) * Math.cos(s);
    var y = radius * Math.cos(r);
    var z = radius * Math.sin(r) * Math.sin(s);
    return new THREE.Vector3(x, y, z);
}

function init() {
    var targetId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var showStat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (targetId) {
        document.getElementById(targetId).appendChild(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
    }

    if (showStat) {
        stats = new _statsModule2.default();
        document.body.appendChild(stats.dom);
    }

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(400, 200, 0);

    // controls
    controls = new _OrbitControls.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
}

function main() {

    var VietNam = lglt2xyz(14.05, 108.27, globeRadius);
    var American = lglt2xyz(41.81, -94.40, globeRadius);
    var China = lglt2xyz(37.98, 103.37, globeRadius);
    var Belarus = lglt2xyz(53.00, 28.00, globeRadius);
    var Cameroon = lglt2xyz(6, 12, globeRadius);

    //Add Pin Location
    AddPin(VietNam.x, VietNam.y, VietNam.z);
    AddPin(American.x, American.y, American.z);
    AddPin(China.x, China.y, China.z);

    //curve
    getCurve(VietNam, American);
    getCurve(VietNam, China);
    getCurve(VietNam, Belarus);
    getCurve(VietNam, Cameroon);

    DrawGlobe();
    DrawSphereDot();
    Light();
    window.addEventListener('resize', onWindowResize);
};

function getCurve(p1, p2) {

    var v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
    var v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
    var pointCount = 20;

    var points = [];

    for (var i = 0; i < pointCount; i++) {
        var p = new THREE.Vector3().lerpVectors(v1, v2, i / pointCount);
        p.normalize();
        p.multiplyScalar(globeRadius);

        p.multiplyScalar(1 + 0.2 * Math.sin(Math.PI * i / pointCount));

        console.log(p.x);
        points.push(p);
    }

    var path = new THREE.CatmullRomCurve3(points);
    //console.log(path);

    var geometry = new THREE.TubeGeometry(path, 64, 0.5, 32, false);
    var material = new THREE.MeshNormalMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

function AddPin(x, y, z) {

    //add pin
    var mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(2, 20, 20), new THREE.MeshNormalMaterial());

    mesh.position.set(x, y, z);
    scene.add(mesh);
}

function DrawGlobe() {

    var loader = new THREE.TextureLoader();

    var material = new THREE.MeshBasicMaterial({
        //color: 0xFF8844,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        map: loader.load('./textures/earth_region.png')
    });

    var materialMesh = new THREE.Mesh(new THREE.SphereGeometry(globeRadius - 5, 32, 32), material);

    scene.add(materialMesh);
};

function visibilityForCoordinate(long, lat) {

    //const imagedata;
    //get long, lat corndinate, 
    //read image data if data = 255 true, else false

}

function latLonToOffsets(latitude, longitude, mapWidth, mapHeight) {
    var radius = mapWidth / (2 * Math.PI);
    var FE = 180; // false easting

    var lonRad = degreeToRadian(longitude + FE);
    var x = lonRad * radius;

    var latRad = degreeToRadian(latitude);
    var verticalOffsetFromEquator = radius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    var y = mapHeight / 2 - verticalOffsetFromEquator;

    return { x: x, y: y };
}

function DrawSphereDot() {

    var BoxGeometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
    var BoxMaterial = new THREE.MeshNormalMaterial();
    var matrix = new THREE.Matrix4();
    var mesh = new THREE.InstancedMesh(BoxGeometry, BoxMaterial, 32475);
    var t = 1;

    for (latitude = -90; latitude < 90; latitude += 1) {
        var a = Math.abs(Math.abs(latitude) - 90);

        for (longitude = 0; longitude < 360; longitude += 360 / (4 * a)) {
            //find x,y offset
            var offset = latLonToOffsets(latitude, longitude, 2048, 1024);
            //find alpha base on x,y
            t++;
            TransformMatrix(matrix);
            //set matrix transformation
            mesh.setMatrixAt(t, matrix);
        }
    }

    scene.add(mesh);
}

function Light() {

    var dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    var dirLight2 = new THREE.DirectionalLight(0x002288);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);

    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

    requestAnimationFrame(animate);
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    //DrawSphereDot();
    render();
    stats.update();
}

function render() {

    renderer.render(scene, camera);
}
//# sourceMappingURL=Globe-dist.js.map