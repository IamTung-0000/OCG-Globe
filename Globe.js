function createStatsGUI(){

    var thisParent;
    const aboutGlobe = document.getElementById("aboutGlobeFull");

    //Create new Graph (FPS, MS, MB)
    stats1 = new Stats();

    //Display different panel
    stats1.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats1.domElement.style.width = '200px';
    stats1.domElement.style.height = '200px';

    //Add Stats to Document - modal 4
    thisParent.appendChild( stats1.domElement );  

    import * as THREE from './build/three.module.js';
    import Stats from './jsm/libs/stats.module.js';
    import { OrbitControls } from './jsm/controls/OrbitControls.js';

    let camera, controls, scene, renderer;
    let cube;
    let material;
    let stats, container;
    let latitude, longitude;

    const objects = [];


    const sphereLon = 50
    const sphereLat = sphereLon/2;
    const globeRadius = 100;


    const TransformMatrix = function () {

        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        return function ( matrix ) {

            const cubePos = lglt2xyz(latitude, longitude, globeRadius); 

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

    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    //longtidude, latitude to XYZ
    function lglt2xyz(longitude,latitude,radius){
        const r = degreeToRadian(90 - longitude)
        const s = degreeToRadian(latitude + (180));
        const x = (-radius * Math.sin(r) * Math.cos(s));
        const y = (radius * Math.cos(r));
        const z = (radius * Math.sin(r) * Math.sin(s));
        return new THREE.Vector3(x, y, z)
    }
    


    function init(target=null, showStat=true) {

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xcccccc );
        scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
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

        let VietNam = lglt2xyz ( 14.05, 108.27, globeRadius);
        let American = lglt2xyz ( 41.81, -94.40, globeRadius);
        let China = lglt2xyz ( 37.98, 103.37, globeRadius)
        let Belarus = lglt2xyz (53.00, 28.00, globeRadius);
        let Cameroon = lglt2xyz (6, 12, globeRadius);


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
        window.addEventListener( 'resize', onWindowResize );

    };

    function getCurve(p1, p2) {

        let v1 = new THREE.Vector3(p1.x, p1.y , p1.z);
        let v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
        let pointCount = 20;

        let points = []

        for (let i = 0; i < pointCount; i++) {
            let p = new THREE.Vector3().lerpVectors(v1, v2, ( i/pointCount ));
            p.normalize()
            p.multiplyScalar(globeRadius)

            p.multiplyScalar(1 + 0.2*Math.sin(Math.PI*i/pointCount))
            
            console.log(p.x);
            points.push(p)
        }

        let path = new THREE.CatmullRomCurve3(points);
        //console.log(path);

        const geometry = new THREE.TubeGeometry (path, 64, 0.5, 32, false);
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh ( geometry, material);
        scene.add( mesh )

    }


    function AddPin(x,y,z) {

        //add pin
        let mesh = new THREE.Mesh(
            new THREE.SphereBufferGeometry(2,20,20),
            new THREE.MeshNormalMaterial()
        )

        mesh.position.set(x,y,z);
        scene.add(mesh);

    }


    function DrawGlobe() {

        const loader = new THREE.TextureLoader();
        
        const material = new THREE.MeshBasicMaterial({
            //color: 0xFF8844,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
            map: loader.load('./textures/earth_region.png'),
            });
        
        const materialMesh = new THREE.Mesh(
            new THREE.SphereGeometry(globeRadius-5,32,32),
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
        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
        //DrawSphereDot();
        render();
        stats.update()

    }

    function render() {
        
        renderer.render( scene, camera );

    }