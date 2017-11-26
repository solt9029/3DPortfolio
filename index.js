window.addEventListener("load", function () {
    initThree();
    initEvent();
    initObject();
    initCamera();
    loop();

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

var camera;

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.lookAt({x: 0, y: 1, z: 0});
}

var axis;
var cubes = [];
var rayReceiveObjects = [];
function initObject() {
    var geometry = new THREE.CubeGeometry(30, 30, 30);
    var material = new THREE.MeshNormalMaterial();

    cubes[0] = new THREE.Mesh(geometry, material);
    scene.add(cubes[0]);
    cubes[0].position.set(0, -50, 0);

    cubes[1] = new THREE.Mesh(geometry, material);
    scene.add(cubes[1]);
    cubes[1].position.set(0, 0, 0);

    cubes[2] = new THREE.Mesh(geometry, material);
    scene.add(cubes[2]);
    cubes[2].position.set(0, 50, 0);

    cubes[0].name = "箱１";
    cubes[1].name = "箱２";
    cubes[2].name = "箱３";

    rayReceiveObjects.push(cubes[0]);
    rayReceiveObjects.push(cubes[1]);
    rayReceiveObjects.push(cubes[2]);
}

var step = 0;
function loop() {
    step++;
    cubes[0].rotation.set(step / 100, 0, 0);
    cubes[1].rotation.set(0, step / 100, 0);
    cubes[2].rotation.set(0, 0, step / 100);
    renderer.render(scene, camera);

    requestAnimationFrame(loop);
}

function initEvent() {
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    function onDocumentMouseDown(event) {
        event.preventDefault();
        //マウスポインタの位置座標の取得
        var mx = (event.clientX / canvasFrame.clientWidth) * 2 - 1;
        var my = -(event.clientY / canvasFrame.clientHeight) * 2 + 1;
        var vector = new THREE.Vector3(mx, my, 0.5);

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
            //最も近いオブジェクトの名前をアラート表示する
            alert(intersects[0].object.name + "がクリックされました！");
            console.log("カメラ位置座標からの距離：" + intersects[0].distance);
            console.log("光線との交差座標(" + intersects[0].point.x + ", " + intersects[0].point.y + ", " + intersects[0].point.z + ")" );
        }
    }

    $(window).mousedown(function(event) {
        alert(event.offsetX);
    });

    $(window).keydown(function(event) {
        event.preventDefault();
        var mx = 0;
        var my = 0;
        var vector = new THREE.Vector3(mx, my, 0.5);
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
            //最も近いオブジェクトの名前をアラート表示する
            alert(intersects[0].object.name + "がクリックされました！");
            console.log("カメラ位置座標からの距離：" + intersects[0].distance);
            console.log("光線との交差座標(" + intersects[0].point.x + ", " + intersects[0].point.y + ", " + intersects[0].point.z + ")" );
        }
    });
}