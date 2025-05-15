'use strict'
let gl;
const appInput = new Input();
const time = new Time();
const camera = new OrbitCamera(appInput);
const assetLoader = new AssetLoader();

// planetary bodies
let sunGeometry = null; // this will be created after loading from a file
let sphereGeometry = null;
let mercuryGeometry = null;
let venusGeometry = null;
let earthGeometry = null;
let atmoGeometry = null;
let moonGeometry = null;
let marsGeometry = null;
let jupiterGeometry = null;
let saturnGeometry = null;
let uranusGeometry = null;
let neptuneGeometry = null;
let asteroidGeometry = null;

// starfield
let bottomGeometry = null;
let backGeometry = null;
let foreGeometry = null;
let topGeometry = null;
let leftGeometry = null;
let rightGeometry = null;

// transformation matricies
let sunScale = null;
let mercuryScale = null;
let venusScale = null;
let earthScale = null;
let atmoScale = null;
let moonScale = null;
let marsScale = null;
let jupiterScale = null;
let saturnScale = null;
let uranusScale = null;
let neptuneScale = null;
let asteroidScale = null;

let sunRadius = null;
let mercuryRadius = null;
let venusRadius = null;
let earthRadius = null;
let atmoRadius = null;
let moonRadius = null;
let marsRadius = null;
let jupiterRadius = null;
let saturnRadius = null;
let uranusRadius = null;
let neptuneRadius = null;

let sunRotation = null;
let mercuryRotation = null;
let venusRotation = null;
let earthRotation = null;
let atmoRotation = null;
let moonRotation = null;
let marsRotation = null;
let jupiterRotation = null;
let saturnRotation = null;
let uranusRotation = null;
let neptuneRotation = null;

let mercuryOrbit = null;
let venusOrbit = null;
let earthOrbit = null;
let atmoOrbit = null;
let moonOrbit = null;
let marsOrbit = null;
let jupiterOrbit = null;
let saturnOrbit = null;
let uranusOrbit = null;
let neptuneOrbit = null;

let sunTranslation = null;
let mercuryTranslation = null;
let venusTranslation = null;
let earthTranslation = null;
let atmoTranslation = null;
let moonTranslation = null;
let marsTranslation = null;
let jupiterTranslation = null;
let saturnTranslation = null;
let uranusTranslation = null;
let neptuneTranslation = null;
let asteroidTranslation = null;

let useRealScale = true; // Default view mode
let useRealDistance = true;


// scale toggle
document.addEventListener('keydown', function(event) {
    if (event.key === 's') {
        useRealScale = !useRealScale;
        updatePlanetScales(); // update scene state
    }
});

// distance toggle
document.addEventListener('keydown', function(event) {
    if (event.key === 'd') {
        useRealDistance = !useRealDistance;
        updatePlanetDistances(); // update scene state
    }
});

const projectionMatrix = new Matrix4();
const lightPosition = new Vector4(0, 0, 0, 1);
// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
let phongShaderProgram;
let textureShaderProgram;
// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];
// List of assets to load
const assetList = [
    { name: 'textureTextVS', url: './shaders/unlit.textured.vs.glsl', type: 'text' },
    { name: 'textureTextFS', url: './shaders/unlit.textured.fs.glsl', type: 'text' },
    { name: 'phongTextVS', url: './shaders/phong.vs.glsl', type: 'text' },
    { name: 'phongTextFS', url: './shaders/phong.pointlight.fs.glsl', type: 'text' },
    { name: 'sphereJSON', url: './data/sphere.json', type: 'json' },
    { name: 'sunImage', url: './data/sun.png', type: 'image' },
    { name: 'mercuryImage', url: './data/mercury.png', type: 'image' },
    { name: 'venusImage', url: './data/venus.png', type: 'image' },
    { name: 'earthImage', url: './data/earth_day.png', type: 'image' },
    { name: 'atmoImage', url: './data/earth_clouds.png', type: 'image' },
    { name: 'moonImage', url: './data/moon.png', type: 'image' },
    { name: 'marsImage', url: './data/mars.png', type: 'image' },
    { name: 'jupiterImage', url: './data/jupiter.png', type: 'image' },
    { name: 'saturnImage', url: './data/saturn.png', type: 'image' },
    { name: 'uranusImage', url: './data/uranus.png', type: 'image' },
    { name: 'neptuneImage', url: './data/neptune.png', type: 'image' },
    { name: 'star1Image', url: './data/star_right1.png', type: 'image' },
    { name: 'star2Image', url: './data/star_left2.png', type: 'image' },
    { name: 'star3Image', url: './data/star_top3.png', type: 'image' },
    { name: 'star4Image', url: './data/star_bottom4.png', type: 'image' },
    { name: 'star5Image', url: './data/star_front5.png', type: 'image' },
    { name: 'star6Image', url: './data/star_back6.png', type: 'image' },
    { name: 'planeTest', url: './data/marble.jpg', type: 'image' },
];

let yaw = 0;
let pitch = 0;
// -------------------------------------------------------------------------
async function initializeAndStartRendering() {
    gl = getWebGLContext("webgl-canvas");
    gl.enable(gl.DEPTH_TEST);
    await assetLoader.loadAssets(assetList);
    createShaders();
    createScene();
    updateAndRender();
}
// -------------------------------------------------------------------------
function createShaders() {
    // Phong shader
    const phongTextVS = assetLoader.assets.phongTextVS;
    const phongTextFS = assetLoader.assets.phongTextFS;
    phongShaderProgram = createCompiledAndLinkedShaderProgram(gl, phongTextVS, phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"), // Changed to lightPosition
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    // flat texture shader (for sun)
    const textureTextVS = assetLoader.assets.textureTextVS;
    const textureTextFS = assetLoader.assets.textureTextFS;

    textureShaderProgram = createCompiledAndLinkedShaderProgram(gl, textureTextVS, textureTextFS);

    textureShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(textureShaderProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(textureShaderProgram, "aTexcoords")
    };

    textureShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(textureShaderProgram, "uTexture"),
        alphaUniform: gl.getUniformLocation(textureShaderProgram, "uAlpha"),
    };
}
// -------------------------------------------------------------------------
function createScene() {;
    let scale = new Matrix4().makeScale(0, 0, 0);
    let rotation = new Matrix4().makeRotationX(0);
    let translation = new Matrix4().makeTranslation(0, 0, 0);
    // planetary bodies
        // sun
        sunGeometry = new WebGLGeometryJSON(gl, textureShaderProgram);
        sunGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.sunImage);
        // mercury
        mercuryGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        mercuryGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.mercuryImage);
        // venus
        venusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        venusGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.venusImage);;
        // earth
        earthGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        earthGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.earthImage);
        // earth's atmosphere
        atmoGeometry = new WebGLGeometryJSON(gl, textureShaderProgram);
        atmoGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.atmoImage);
        // earth's moon
        moonGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        moonGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.moonImage);
        // mars
        marsGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        marsGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.marsImage);
        // jupiter
        jupiterGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        jupiterGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.jupiterImage);
        // saturn
        saturnGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        saturnGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.saturnImage);
        // uranus
        uranusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        uranusGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.uranusImage);
        // neptune
        neptuneGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
        neptuneGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.neptuneImage);
        

    // starfield
        // top
        topGeometry = new WebGLGeometryQuad(gl, textureShaderProgram);
        topGeometry.create(assetLoader.assets.star3Image);
        scale = new Matrix4().makeScale(350.0, 350.0, 350.0);
        rotation = new Matrix4().makeRotationX(90);
        translation = new Matrix4().makeTranslation(0, (350), 0);
        topGeometry.worldMatrix.makeIdentity();
        topGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
        // bottom
        bottomGeometry = new WebGLGeometryQuad(gl, textureShaderProgram);
        bottomGeometry.create(assetLoader.assets.star4Image);
        rotation = new Matrix4().makeRotationX(90);
        translation = new Matrix4().makeTranslation(0, -(350), 0);
        bottomGeometry.worldMatrix.makeIdentity();
        bottomGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
        // back
        backGeometry = new WebGLGeometryQuad(gl, textureShaderProgram);
        backGeometry.create(assetLoader.assets.star6Image);
        rotation = new Matrix4().makeRotationY(180);
        translation = new Matrix4().makeTranslation(0, 0, -(350));
        backGeometry.worldMatrix.makeIdentity();
        backGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
        // fore
        foreGeometry = new WebGLGeometryQuad(gl, textureShaderProgram);
        foreGeometry.create(assetLoader.assets.star5Image);
        rotation = new Matrix4().makeRotationY(180);
        translation = new Matrix4().makeTranslation(0, 0, (350));
        foreGeometry.worldMatrix.makeIdentity();
        foreGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
        // left
        leftGeometry = new WebGLGeometryQuad(gl, textureShaderProgram);
        leftGeometry.create(assetLoader.assets.star2Image);
        rotation = new Matrix4().makeRotationY(90);
        translation = new Matrix4().makeTranslation(-(350), 0, 0);
        leftGeometry.worldMatrix.makeIdentity();
        leftGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
        // right
        rightGeometry = new WebGLGeometryQuad(gl, textureShaderProgram);
        rightGeometry.create(assetLoader.assets.star1Image);
        rotation = new Matrix4().makeRotationY(-90);
        translation = new Matrix4().makeTranslation((350), 0, 0);
        rightGeometry.worldMatrix.makeIdentity();
        rightGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
    
    updatePlanetScales();
    updatePlanetDistances();

}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);
    const aspectRatio = gl.canvasWidth / gl.canvasHeight;
    time.update();
    camera.update();
    camera.update(time.deltaTime);
    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 5000);


    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(textureShaderProgram);
    const textureUniforms = textureShaderProgram.uniforms;
    // starfield
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    topGeometry.render(camera, projectionMatrix, textureShaderProgram);
    bottomGeometry.render(camera, projectionMatrix, textureShaderProgram);
    backGeometry.render(camera, projectionMatrix, textureShaderProgram);
    leftGeometry.render(camera, projectionMatrix, textureShaderProgram);
    rightGeometry.render(camera, projectionMatrix, textureShaderProgram);
    foreGeometry.render(camera, projectionMatrix, textureShaderProgram);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    
    //planetary bodies
    sunGeometry.render(camera, projectionMatrix, textureShaderProgram);

    // Render Phong shaded objects
    gl.useProgram(phongShaderProgram);
    const uniforms = phongShaderProgram.uniforms;
    let cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    // planetary bodies
    mercuryGeometry.render(camera, projectionMatrix, phongShaderProgram);
    venusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    earthGeometry.render(camera, projectionMatrix, phongShaderProgram);

    gl.useProgram(textureShaderProgram);
    gl.uniform1f(textureShaderProgram.uniforms.uAlpha, atmoGeometry.alpha || 0.5);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    atmoGeometry.render(camera, projectionMatrix, textureShaderProgram);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.cullFace(gl.BACK);

    moonGeometry.render(camera, projectionMatrix, phongShaderProgram);
    marsGeometry.render(camera, projectionMatrix, phongShaderProgram);
    jupiterGeometry.render(camera, projectionMatrix, phongShaderProgram);
    saturnGeometry.render(camera, projectionMatrix, phongShaderProgram);
    uranusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    neptuneGeometry.render(camera, projectionMatrix, phongShaderProgram);

    let multConst = 10000;

    const sunAngularSpeed = 0.0004805481283 * multConst;
    let sunAngle = time.secondsElapsedSinceStart * sunAngularSpeed;
    sunRotation = new Matrix4().makeRotationY(sunAngle);
    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix
        .multiply(sunRotation)
        .multiply(sunTranslation)
        .multiply(sunScale);

    const mercuryAngularSpeed = 0.0000007239304813 * multConst;
    const mercuryOrbitalSpeed = 0.01139725936 * multConst;
    let mercuryAngle = time.secondsElapsedSinceStart * mercuryAngularSpeed;
    let mercuryOrbitalAngle = time.secondsElapsedSinceStart * mercuryOrbitalSpeed;
    mercuryRotation = new Matrix4().makeRotationY(mercuryAngle);
    mercuryOrbit = new Matrix4().makeRotationY(mercuryOrbitalAngle);
    mercuryGeometry.worldMatrix.makeIdentity();
    mercuryGeometry.worldMatrix
        .multiply(mercuryOrbit)        // orbit around sun
        .multiply(mercuryTranslation)  // push outward
        .multiply(mercuryRotation)     // spin on axis
        .multiply(mercuryScale);       // size

    const venusAngularSpeed = 0.000000435828877 * multConst;
    const venusOrbitalSpeed = 0.008427406417 * multConst;
    let venusAngle = time.secondsElapsedSinceStart * venusAngularSpeed;
    let venusOrbitalAngle = time.secondsElapsedSinceStart * venusOrbitalSpeed;
    venusRotation = new Matrix4().makeRotationY(venusAngle);
    venusOrbit = new Matrix4().makeRotationY(venusOrbitalAngle);
    venusGeometry.worldMatrix.makeIdentity();
    venusGeometry.worldMatrix
        .multiply(venusOrbit)
        .multiply(venusTranslation)
        .multiply(venusRotation)
        .multiply(venusScale);
        
    const earthAngularSpeed = 0.0001052139037 * multConst;
    const earthOrbitalSpeed = 0.00716697861 * multConst;
    let earthAngle = time.secondsElapsedSinceStart * earthAngularSpeed;
    let earthOrbitalAngle = time.secondsElapsedSinceStart * earthOrbitalSpeed;
    earthRotation = new Matrix4().makeRotationY(earthAngle);
    earthOrbit = new Matrix4().makeRotationY(earthOrbitalAngle);
    earthGeometry.worldMatrix.makeIdentity();
    earthGeometry.worldMatrix
        .multiply(earthOrbit)
        .multiply(earthTranslation)
        .multiply(earthRotation)
        .multiply(earthScale);

    const atmoAngularSpeed = 0.0000052139037 * multConst;
    let atmoAngle = time.secondsElapsedSinceStart * atmoAngularSpeed;
    atmoRotation = new Matrix4().makeRotationY(atmoAngle);
    atmoGeometry.worldMatrix.makeIdentity();
    atmoGeometry.worldMatrix
        .multiply(earthOrbit)
        .multiply(earthTranslation)
        .multiply(atmoRotation)
        .multiply(atmoScale);

    const moonAngularSpeed = 0.00000111 * multConst;
    const moonOrbitalSpeed = 0.000246 * multConst;
    let moonAngle = time.secondsElapsedSinceStart * moonAngularSpeed;
    let moonOrbitalAngle = time.secondsElapsedSinceStart * moonOrbitalSpeed;
    moonRotation = new Matrix4().makeRotationY(moonAngle);
    moonOrbit = new Matrix4().makeRotationY(moonOrbitalAngle);
    moonGeometry.worldMatrix.makeIdentity();
    moonGeometry.worldMatrix
        .multiply(earthOrbit)
        .multiply(earthTranslation)
        .multiply(moonOrbit)
        .multiply(moonTranslation)
        .multiply(moonRotation)
        .multiply(moonScale);

    const marsAngularSpeed = 0.00005788770053 * multConst;
    const marsOrbitalSpeed = 0.005793917112 * multConst;
    let marsAngle = time.secondsElapsedSinceStart * marsAngularSpeed;
    let marsOrbitalAngle = time.secondsElapsedSinceStart * marsOrbitalSpeed;
    marsRotation = new Matrix4().makeRotationY(marsAngle);
    marsOrbit = new Matrix4().makeRotationY(marsOrbitalAngle);
    marsGeometry.worldMatrix.makeIdentity();
    marsGeometry.worldMatrix
        .multiply(marsOrbit)
        .multiply(marsTranslation)
        .multiply(marsRotation)
        .multiply(marsScale);

    const jupiterAngularSpeed = 0.003046991979 * multConst;
    const jupiterOrbitalSpeed = 0.00314184492 * multConst;
    let jupiterAngle = time.secondsElapsedSinceStart * jupiterAngularSpeed;
    let jupiterOrbitalAngle = time.secondsElapsedSinceStart * jupiterOrbitalSpeed;
    jupiterRotation = new Matrix4().makeRotationY(jupiterAngle);
    jupiterOrbit = new Matrix4().makeRotationY(jupiterOrbitalAngle);
    jupiterGeometry.worldMatrix.makeIdentity();
    jupiterGeometry.worldMatrix
        .multiply(jupiterOrbit)
        .multiply(jupiterTranslation)
        .multiply(jupiterRotation)
        .multiply(jupiterScale);

    const saturnAngularSpeed = 0.002462566845 * multConst;
    const saturnOrbitalSpeed = 0.002319585561 * multConst;
    let saturnAngle = time.secondsElapsedSinceStart * saturnAngularSpeed;
    let saturnOrbitalAngle = time.secondsElapsedSinceStart * saturnOrbitalSpeed;
    saturnRotation = new Matrix4().makeRotationY(saturnAngle);
    saturnOrbit = new Matrix4().makeRotationY(saturnOrbitalAngle);
    saturnGeometry.worldMatrix.makeIdentity()
    saturnGeometry.worldMatrix
        .multiply(saturnOrbit)
        .multiply(saturnTranslation)
        .multiply(saturnRotation)
        .multiply(saturnScale);

    const uranusAngularSpeed = 0.0009889037433 * multConst;
    const uranusOrbitalSpeed = 0.001636163102 * multConst;
    let uranusAngle = time.secondsElapsedSinceStart * uranusAngularSpeed;
    let uranusOrbitalAngle = time.secondsElapsedSinceStart * uranusOrbitalSpeed;
    uranusRotation = new Matrix4().makeRotationY(uranusAngle);
    uranusOrbit = new Matrix4().makeRotationY(uranusOrbitalAngle);
    uranusGeometry.worldMatrix.makeIdentity();
    uranusGeometry.worldMatrix
        .multiply(uranusOrbit)
        .multiply(uranusTranslation)
        .multiply(uranusRotation)
        .multiply(uranusScale);

    const neptuneAngularSpeed = 0.00006496657754 * multConst;
    const neptuneOrbitalSpeed = 0.001307887701 * multConst;
    let neptuneAngle = time.secondsElapsedSinceStart * neptuneAngularSpeed;
    let neptuneOrbitalAngle = time.secondsElapsedSinceStart * neptuneOrbitalSpeed;
    neptuneRotation = new Matrix4().makeRotationY(neptuneAngle);
    neptuneOrbit = new Matrix4().makeRotationY(neptuneOrbitalAngle);
    neptuneGeometry.worldMatrix.makeIdentity();
    neptuneGeometry.worldMatrix
        .multiply(neptuneOrbit)
        .multiply(neptuneTranslation)
        .multiply(neptuneRotation)
        .multiply(neptuneScale);

}

function updatePlanetScales() {
    if (useRealScale) {
        sunRadius = (0.09300802139/4);
        mercuryRadius = (0.000326074/2);
        venusRadius = (0.000809102/2);
        earthRadius = (0.000852686/2);
        atmoRadius = earthRadius * 1.4;
        moonRadius = (0.0002322860963/2);
        marsRadius = (0.000454017/2);
        jupiterRadius = (0.009557754011/2);
        saturnRadius = (0.008057219251/2);
        uranusRadius = (0.00341697861/2);
        neptuneRadius = (0.003310695187/2);
    } else {
        sunRadius = (0.09300802139/4);
        mercuryRadius = (0.000326074/2)*16;
        venusRadius = (0.000809102/2)*16;
        earthRadius = (0.000852686/2)*16;
        atmoRadius = earthRadius * 1.4;
        moonRadius = (0.0002322860963/2)*20;
        marsRadius = (0.000454017/2)*16;
        jupiterRadius = (0.009557754011/2)*4;
        saturnRadius = (0.008057219251/2)*4;
        uranusRadius = (0.00341697861/2)*4;
        neptuneRadius = (0.003310695187/2)*4;
    }
    sunScale = new Matrix4().makeScale(sunRadius*2, sunRadius*2, sunRadius*2);
    mercuryScale = new Matrix4().makeScale(mercuryRadius*2, mercuryRadius*2, mercuryRadius*2);
    venusScale = new Matrix4().makeScale(venusRadius*2, venusRadius*2, venusRadius*2);
    earthScale = new Matrix4().makeScale(earthRadius*2, earthRadius*2, earthRadius*2);
    atmoScale = new Matrix4().makeScale(atmoRadius*2, atmoRadius*2, atmoRadius*2);
    moonScale = new Matrix4().makeScale(moonRadius*2, moonRadius*2, moonRadius*2);
    marsScale = new Matrix4().makeScale(marsRadius*2, marsRadius*2, marsRadius*2);
    jupiterScale = new Matrix4().makeScale(jupiterRadius*2, jupiterRadius*2, jupiterRadius*2);
    saturnScale = new Matrix4().makeScale(saturnRadius*2, saturnRadius*2, saturnRadius*2);
    uranusScale = new Matrix4().makeScale(uranusRadius*2, uranusRadius*2, uranusRadius*2);
    neptuneScale = new Matrix4().makeScale(neptuneRadius*2, neptuneRadius*2, neptuneRadius*2);
}

function updatePlanetDistances() {
    if (useRealDistance) {
        sunTranslation = new Matrix4().makeTranslation((0), 0, 0);
        mercuryTranslation = new Matrix4().makeTranslation((3.9), 0, 0);
        venusTranslation = new Matrix4().makeTranslation((7.2), 0, 0);
        earthTranslation = new Matrix4().makeTranslation((10), 0, 0);
        atmoTranslation = new Matrix4().makeTranslation((10), 0, 0);
        moonTranslation = new Matrix4().makeTranslation((1.5), 0, 0);
        marsTranslation = new Matrix4().makeTranslation((15.2), 0, 0);
        jupiterTranslation = new Matrix4().makeTranslation((52.0), 0, 0);
        saturnTranslation = new Matrix4().makeTranslation((95.8), 0, 0);
        uranusTranslation = new Matrix4().makeTranslation((192.0), 0, 0);
        neptuneTranslation = new Matrix4().makeTranslation((300.5), 0, 0);
    } else {
        sunTranslation = new Matrix4().makeTranslation((0), 0, 0);
        mercuryTranslation = new Matrix4().makeTranslation(Math.log2(3.9), 0, 0);
        venusTranslation = new Matrix4().makeTranslation(Math.log2(7.2), 0, 0);
        earthTranslation = new Matrix4().makeTranslation(Math.log2(10), 0, 0);
        atmoTranslation = new Matrix4().makeTranslation(Math.log2(10), 0, 0);
        moonTranslation = new Matrix4().makeTranslation(Math.log2(1.5), 0, 0);
        marsTranslation = new Matrix4().makeTranslation(Math.log2(15.2), 0, 0);
        jupiterTranslation = new Matrix4().makeTranslation(Math.log2(52.0), 0, 0);
        saturnTranslation = new Matrix4().makeTranslation(Math.log2(95.8), 0, 0);
        uranusTranslation = new Matrix4().makeTranslation(Math.log2(192.0), 0, 0);
        neptuneTranslation = new Matrix4().makeTranslation(Math.log2(300.5), 0, 0);
    }
}