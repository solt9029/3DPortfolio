////////////////////////////////////////////////////////////////////
    // windowイベントの定義
    ////////////////////////////////////////////////////////////////////
    window.addEventListener("load", function () {
        threeStart(); //Three.jsのスタート関数の実行

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
    
    ////////////////////////////////////////////////////////////////////
    // Three.jsスタート関数の定義
    ////////////////////////////////////////////////////////////////////
    function threeStart() {
        initThree();  //Three.js初期化関数の実行
        initEvent();  //イベント準備関数の実行
        initObject(); //オブジェクト初期化関数の実行
        initCamera(); //カメラ初期化関数の実行
        loop();       //無限ループ関数の実行
    }
    ////////////////////////////////////////////////////////////////////
    // Three.js初期化関数の定義
    ////////////////////////////////////////////////////////////////////
    //グローバル変数の宣言
    var renderer,    //レンダラーオブジェクト
        scene,       //シーンオブジェクト
        canvasFrame; //キャンバスフレームのDOM要素
    function initThree() {
        //キャンバスフレームDOM要素の取得
        canvasFrame = document.getElementById('canvas3d');
        canvasFrame.width = window.innerWidth;
        canvasFrame.height = window.innerHeight;
        //レンダラーオブジェクトの生成
        renderer = new THREE.WebGLRenderer({ antialias: true });
        //renderer = new THREE.CanvasRenderer();//<-----------------------------------------（canvasレンダラー）

        if (!renderer) alert('Three.js の初期化に失敗しました');
        //レンダラーのサイズの設定
        renderer.setSize(window.innerWidth, window.innerHeight);
        //キャンバスフレームDOM要素にcanvas要素を追加
        canvasFrame.appendChild(renderer.domElement);

        //レンダラークリアーカラーの設定
        renderer.setClearColor(0xEEEEEE, 1.0);

        //シーンオブジェクトの生成
        scene = new THREE.Scene();
    }
    ////////////////////////////////////////////////////////////////////
    // カメラ初期化関数の定義
    ////////////////////////////////////////////////////////////////////
    //グローバル変数の宣言
    var camera;    //カメラオブジェクト
    function initCamera() {
        //カメラオブジェクトの生成
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        //カメラの位置の設定
        camera.position.set(0, 0, 0);
        //カメラの上ベクトルの設定
        camera.up.set(0, 0, 1);
        //カメラの中心位置ベクトルの設定
        camera.lookAt({ x: 0, y: 1, z: 0 }); //トラックボール利用時は自動的に無効

    }

    ////////////////////////////////////////////////////////////////////
    // オブジェクト初期化関数の定義
    ////////////////////////////////////////////////////////////////////
    //グローバル変数の宣言
    var axis;         //軸オブジェクト
    var cubes = [];   //立方体オブジェクト
    var rayReceiveObjects = []; //光線を受けるオブジェクト配列
    function initObject() {
        //軸オブジェクトの生成
        axis = new THREE.AxisHelper(100);
        //軸オブジェクトのシーンへの追加
        scene.add(axis);
        //軸オブジェクトの位置座標を設定
        axis.position.set(0, 0, 0);

        ///////////////立方体の形状と材質の定義//////////////////
        //形状オブジェクトの宣言と生成
        var geometry = new THREE.CubeGeometry(30, 30, 30);
        //材質オブジェクトの宣言と生成
        var material = new THREE.MeshNormalMaterial();

        ///////////////立方体オブジェクトの準備//////////////////
        //立方体オブジェクトの生成
        cubes[0] = new THREE.Mesh(geometry, material);
        //立方体オブジェクトのシーンへの追加
        scene.add(cubes[0]);
        //立方体オブジェクトの位置座標を設定
        cubes[0].position.set(0, -50, 0);

        //立方体オブジェクトの生成
        cubes[1] = new THREE.Mesh(geometry, material);
        //立方体オブジェクトのシーンへの追加
        scene.add(cubes[1]);
        //立方体オブジェクトの位置座標を設定
        cubes[1].position.set(0, 0, 0);

        //立方体オブジェクトの生成
        cubes[2] = new THREE.Mesh(geometry, material);
        //立方体オブジェクトのシーンへの追加
        scene.add(cubes[2]);
        //立方体オブジェクトの位置座標を設定
        cubes[2].position.set(0, 50, 0);

        //光線受信判定用
        cubes[0].name = "箱１";
        cubes[1].name = "箱２";
        cubes[2].name = "箱３";
        //光線受信オブジェクト配列へ追加
        rayReceiveObjects.push( cubes[0] );
        rayReceiveObjects.push( cubes[1] );
        rayReceiveObjects.push( cubes[2] );
    }

    ////////////////////////////////////////////////////////////////////
    // 無限ループ関数の定義
    ////////////////////////////////////////////////////////////////////
    //グローバル変数の宣言
    var step = 0; //ステップ数
    function loop() {
        //ステップ数のインクリメント
        step++;
        //各立方体の角度の変更
        cubes[0].rotation.set(step / 100, 0, 0);
        cubes[1].rotation.set(0, step / 100, 0);
        cubes[2].rotation.set(0, 0, step / 100);

        //レンダリング
        renderer.render(scene, camera);

        //「loop()」関数の呼び出し
        requestAnimationFrame(loop);
    }
    ////////////////////////////////////////////////////////////////////
    // イベント準備関数
    ////////////////////////////////////////////////////////////////////
    function initEvent() {
        //マウスダウンイベント
        canvasFrame.addEventListener( 'mousedown', onDocumentMouseDown, false );
        function onDocumentMouseDown( event ) {
            //イベントの伝播の無効化
            event.preventDefault();
            //マウスポインタの位置座標の取得
            var mx = (event.clientX / canvasFrame.clientWidth) * 2 - 1;
            var my = -(event.clientY / canvasFrame.clientHeight) * 2 + 1;
            var vector = new THREE.Vector3(mx, my, 0.5);

            //プロジェクターオブジェクトの生成
            var projector = new THREE.Projector();
            //逆投影変換を行うことで仮想空間内のベクトルへと変換する
            vector = projector.unprojectVector( vector, camera );
            //カメラ位置座標を起点として規格化を行う
            vector = vector.sub( camera.position ).normalize();
            //カメラ位置座標から光線を発射
            var raycaster = new THREE.Raycaster( camera.position, vector );
            //光線と交わるオブジェクトを収集
            var intersects = raycaster.intersectObjects( rayReceiveObjects );
            //交わるオブジェクトが１個以上の場合
            if ( intersects.length > 0 ) {
                //最も近いオブジェクトの名前をアラート表示する
                alert(intersects[0].object.name + "がクリックされました！");
                console.log("カメラ位置座標からの距離：" + intersects[0].distance);
                console.log("光線との交差座標(" + intersects[0].point.x + ", " + intersects[0].point.y + ", " + intersects[0].point.z + ")" );
            }
        }
    }