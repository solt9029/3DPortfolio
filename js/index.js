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
    canvas2d = document.getElementById('canvas2d');
    ctx = canvas2d.getContext('2d');
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
    camera.lookAt({x: 100, y: 0, z: 0});
}

var works = [];
var rayReceiveObjects = [];
var texts = [];
function initObject() {
    var geometry = new THREE.CubeGeometry(30, 30, 30);

    for (var i = 0; i < portfolioData.length; i++) {
        var texture = THREE.ImageUtils.loadTexture('../images/' + portfolioData[i].img);
        texture.anisotropy = renderer.getMaxAnisotropy();
        var material = new THREE.MeshBasicMaterial({map: texture});

        works[i] = new THREE.Mesh(geometry, material);
        scene.add(works[i]);
        works[i].position.set(
            Math.cos(Math.radians(i * 360 / portfolioData.length)) * 100, 
            Math.sin(Math.radians(i * 360 / portfolioData.length)) * 100, 0);
        rayReceiveObjects.push(works[i]);
        works[i].name = portfolioData[i].name;
        works[i].url = portfolioData[i].url;
        works[i].degree = 0;
    }

    for (var i = 0; i < portfolioData.length; i++) {
        var parameters = {
            size: 5, height: 2, curveSegments: 2,
            font: 'helvetiker', weight: 'normal', style: 'normal',
            bevelEnabled: false, bevelThickness: 2, bevelSize:2
        }
        var geometry = new THREE.TextGeometry(portfolioData[i].name, parameters);
        var material = new THREE.MeshNormalMaterial();
        texts[i] = new THREE.Mesh(geometry, material);
        scene.add(texts[i]);
        geometry.computeBoundingBox();
        texts[i].width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        texts[i].position.set(
            Math.cos(Math.radians(i * 360 / portfolioData.length)) * 100, 
            Math.sin(Math.radians(i * 360 / portfolioData.length)) * 100 + texts[i].width / 2, 27.5);
        texts[i].rotation.set(Math.radians(90), Math.radians(270), 0);
        texts[i].degree = 0;
    }
}

var step = 0;
var translateValue = 0;
function loop() {
    step++;
    for (var i = 0; i < works.length; i++) {
        works[i].rotation.set(step / 100, step / 100, step / 100);

        if (translateValue !== 0) {
            if (translateValue > 0) {
                works[i].degree++;
                texts[i].degree++;
                translateValue--;
            } else if (translateValue < 0) {
                works[i].degree--;
                texts[i].degree--;
                translateValue++;
            }
            works[i].position.set(
                Math.cos(Math.radians(i * 360 / portfolioData.length + works[i].degree)) * 100, 
                Math.sin(Math.radians(i * 360 / portfolioData.length + works[i].degree)) * 100, 0);
            texts[i].position.set(
                Math.cos(Math.radians(i * 360 / portfolioData.length + texts[i].degree)) * 100, 
                Math.sin(Math.radians(i * 360 / portfolioData.length + texts[i].degree)) * 100 + texts[i].width / 2, 27.5);
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

function initEvent() {
    $(window).mousedown(function(event) {
        var obj = getIntersects(
            (event.clientX / window.innerWidth) * 2 - 1, 
            (event.clientY / window.innerHeight) * 2 - 1);
        if (obj !== false) {
            window.open(obj.url, '_blank');
        }
    });

    $(window).keydown(function(event) {
        var RIGHT = 39;
        var LEFT = 37;
        var SPACE = 32;
        switch (event.keyCode) {
            case RIGHT:
                translateValue -= 360;
                break;
            case LEFT:
                translateValue += 360;
                break;
            case SPACE:
                var obj = getIntersects(0, 0);
                if (obj !== false) {
                    window.open(obj.url, '_blank');
                }
                break;
            default:
                break;
        }
    });

    $(window).resize(function(event) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
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
        return intersects[0].object;
    }
    return false;
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};
   
// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};