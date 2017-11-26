$(function() {
    initThree();
    initTwo();
    initEvent();
    initObject();
    initCamera();
    loop();
});

var renderer, scene, canvasFrame;
function initThree() {
    canvasFrame = document.getElementById('canvas3d');
    canvasFrame.width = window.innerWidth;
    canvasFrame.height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({antialias: true});

    if (!renderer) alert('Three.js の初期化に失敗しました');
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasFrame.appendChild(renderer.domElement);
    renderer.setClearColor(0xEEEEEE, 1.0);

    scene = new THREE.Scene();
}

var canvas2d, ctx;
function initTwo() {
    var canvas2d = document.getElementById('canvas2d');
    var ctx = canvas2d.getContext('2d');
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(120, 20);
    ctx.lineTo(120, 120);
    ctx.lineTo(20, 120);
    ctx.closePath();
    ctx.stroke();
}

var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.lookAt({x: 0, y: 1, z: 0});
}

var works = [];
var rayReceiveObjects = [];
function initObject() {
    var geometry = new THREE.CubeGeometry(30, 30, 30);
    var material = new THREE.MeshNormalMaterial();

    works[0] = new THREE.Mesh(geometry, material);
    scene.add(works[0]);
    works[0].position.set(0, -50, 0);

    works[1] = new THREE.Mesh(geometry, material);
    scene.add(works[1]);
    works[1].position.set(0, 0, 0);

    works[2] = new THREE.Mesh(geometry, material);
    scene.add(works[2]);
    works[2].position.set(0, 50, 0);

    works[0].name = "箱１";
    works[1].name = "箱２";
    works[2].name = "箱３";

    rayReceiveObjects.push(works[0]);
    rayReceiveObjects.push(works[1]);
    rayReceiveObjects.push(works[2]);
}

var step = 0;
function loop() {
    step++;
    works[0].rotation.set(step / 100, 0, 0);
    works[1].rotation.set(0, step / 100, 0);
    works[2].rotation.set(0, 0, step / 100);
    renderer.render(scene, camera);

    requestAnimationFrame(loop);
}

function initEvent() {
    $(window).mousedown(function(event) {
        alert(event.offsetX);
    });

    $(window).keydown(function(event) {
        alert(getIntersects(0, 0));
    });
}

function getIntersects(x, y) {
    var vector = new THREE.Vector3(x, y, 0.5);
    var projector = new THREE.Projector();
    //プロジェクターオブジェクトの生成
    var projector = new THREE.Projector();
    //逆投影変換を行うことで仮想空間内のベクトルへと変換する
    vector = projector.unprojectVector(vector, camera);
    //カメラ位置座標を起点として規格化を行う
    vector = vector.sub( camera.position ).normalize();
    //カメラ位置座標から光線を発射
    var raycaster = new THREE.Raycaster(camera.position, vector);
    //光線と交わるオブジェクトを収集
    var intersects = raycaster.intersectObjects(rayReceiveObjects);
    //交わるオブジェクトが１個以上の場合
    if (intersects.length > 0) {
        return intersects[0].object.name;
    }
    return false;
}