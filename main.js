import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "lil-gui";

// const gui = new dat.GUI();

//canvas
const canvas = document.querySelector("#webgl");

//シーン
const scene = new THREE.Scene();

//背景用のテクスチャ
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load("./imgs/black.jpeg");
scene.background = bgTexture;

//サイズ
const sizes = {
  width: innerWidth,
  height: innerHeight,
};

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//オブジェクトの作成

const material = new THREE.MeshPhysicalMaterial({
  color: "#3c94d7",
  metalness: 0.86,
  roughness: 0.37,
  flatShading: true,
});

//メッシュの作成
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.OctahedronGeometry(), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
const mesh4 = new THREE.Mesh(new THREE.IcosahedronGeometry(), material);

mesh3.scale.set(2.5, 2.5, 2.5);

mesh1.position.set(7, 0, -7);
mesh2.position.set(-7, 2, -6);
mesh3.position.set(-5, -5, -9);
mesh4.position.set(3, 3, -7);

scene.add(mesh1, mesh2, mesh3, mesh4);

//animation用の配列
const meshes = [mesh1, mesh2, mesh3, mesh4];

//モデル読み込みローダー（3DCGモデル）
const loader = new GLTFLoader();
const model = await loader.loadAsync("/model/TV.gltf");
model.scene.scale.set(0.7, 0.7, 0.7);
model.scene.rotation.set(0, -1.56, 0);
model.scene.position.set(1.35, -0.5, -7);

scene.add(model.scene);

//線形補間でアニメーションを滑らかに = lerp(最初の地点、最終地点、ベストコマ数)
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start);
}

//スクロールアニメーション
const animationScripts = [];

// スクロールアニメーション01（z軸の移動）
animationScripts.push({
  start: 0,
  end: 20,
  function() {
    //線形補間
    model.scene.position.z = lerp(-7, -1.95, scalePercent(0, 20));
    mesh1.position.z = lerp(-7, -1.95, scalePercent(0, 20));
    mesh2.position.z = lerp(-6, -0.95, scalePercent(0, 20));
    mesh3.position.z = lerp(-9, -2.95, scalePercent(0, 20));
    mesh4.position.z = lerp(-7, -1.95, scalePercent(0, 20));
    model.scene.position.x = lerp(1.35, 1.55, scalePercent(0, 20));
  },
});

//スクロールアニメーション02（boxのrotation）
// animationScripts.push({
//   start: 20,
//   end: 40,
//   function() {
//     camera.lookAt(model.scene.position);
//     //線形補間
//     // camera.position.x = lerp(0, 1.2, scalePercent(20, 40));
//     model.scene.rotation.y = lerp(4.85, 4, scalePercent(20, 40));
//     model.scene.position.z = lerp(6.5, 9.8, scalePercent(20, 40));
//     model.scene.position.x = lerp(0.5, 2, scalePercent(20, 40));
//     camera.position.x = lerp(-0.5, 0.6, scalePercent(20, 40));
//     camera.position.z = lerp(10, 10.7, scalePercent(20, 40));
//     console.log("z" + camera.position.z);
//   },
// });

//スクロールアニメーション03（cameraの視点移動）
// animationScripts.push({
//   start: 40,
//   end: 60,
//   function() {
//     camera.lookAt(model.scene.position);
//     //線形補間
//     camera.position.x = lerp(-2, 0, scalePercent(40, 60));
//   },
// });

//スクロールアニメーション04（boxのrotationに回転を加える）
// animationScripts.push({
//   start: 60,
//   end: 80,
//   function() {
//     // camera.lookAt(model.scene.position);
//     // camera.rotateZ(-0.05);
//     // //線形補間
//     // camera.position.z = lerp(10, 8, scalePercent(60, 80));
//     // camera.position.x = lerp(1.2, 1, scalePercent(60, 80));
//     // model.scene.rotation.y = lerp(5.5, 4.91, scalePercent(60, 80));
//   },
// });

//アニメーションを開始する
function playScrollAnimation() {
  animationScripts.forEach((animation) => {
    if (scrollPercent >= animation.start && scrollPercent <= animation.end)
      animation.function();
  });
}

//ブラウザのスクロール率を取得する（コピペ対象）
let scrollPercent = 0;

document.body.onscroll = () => {
  scrollPercent =
    (document.documentElement.scrollTop /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight)) *
    100;
  console.log(document.documentElement.clientHeight);
};

//ライトの追加
const directionalLight = new THREE.DirectionalLight("#ffffff", 6);
directionalLight.position.set(0.5, 1.5, 0);
scene.add(directionalLight);

//スポットライト
const spotLight = new THREE.SpotLight(0xffffff, 100, 90, Math.PI / 6, 10, 0.5);
spotLight.position.set(5, 60, 0);
scene.add(spotLight);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// const light = new THREE.AmbientLight(0x404040, 10);
// scene.add(light);

//アニメーション
//tick：毎フレームごとに実行されるループアニメーション
const tick = () => {
  window.requestAnimationFrame(tick);
  playScrollAnimation();
  renderer.render(scene, camera);
};

tick();

//ブラウザのリサイズ操作
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});

///各PCごとのフレームを統一する
const clock = new THREE.Clock();

//animation
const animate = () => {
  renderer.render(scene, camera);

  let getDeltaTime = clock.getDelta();

  //meshを回転させる
  mesh1.rotation.x += 1 * getDeltaTime;
  mesh1.rotation.y += 0.5 * getDeltaTime;

  mesh2.rotation.x += 0.2 * getDeltaTime;
  mesh2.rotation.y += 0.6 * getDeltaTime;

  mesh3.rotation.x += 0.2 * getDeltaTime;
  mesh3.rotation.y += 0.2 * getDeltaTime;

  mesh4.rotation.x += 0.5 * getDeltaTime;
  mesh4.rotation.y += 0.7 * getDeltaTime;

  //カメラの制御
  // camera.position.x += cursor.x * getDeltaTime;
  // camera.position.y += -cursor.y * getDeltaTime;

  window.requestAnimationFrame(animate);
};

animate();

// gui
//   .add(model.scene.position, "x")
//   .name("MoPosition X")
//   .min(-15)
//   .max(15)
//   .listen();
// gui
//   .add(model.scene.position, "y")
//   .name("MoPosition Y")
//   .min(-15)
//   .max(15)
//   .listen();
// gui
//   .add(model.scene.position, "z")
//   .name("MoPosition Z")
//   .min(-15)
//   .max(15)
//   .listen();

// gui
//   .add(model.scene.rotation, "x")
//   .name("MoRotation X")
//   .min(-15)
//   .max(15)
//   .listen();

// gui
//   .add(model.scene.rotation, "y")
//   .name("MoRotation Y")
//   .min(-15)
//   .max(15)
//   .listen();

// gui
//   .add(model.scene.rotation, "z")
//   .name("MoRotation z")
//   .min(-15)
//   .max(15)
//   .listen();

// gui.add(camera.position, "x").name("CaPosition X").min(-15).max(15).listen();
// gui.add(camera.position, "y").name("CaPosition Y").min(-15).max(15).listen();
// gui.add(camera.position, "z").name("CaPosition Z").min(-15).max(15).listen();

// gui.add(camera.rotation, "x").name("CaRotation X").min(-15).max(15).listen();
// gui.add(camera.rotation, "y").name("CaRotation Y").min(-15).max(15).listen();
// gui.add(camera.rotation, "z").name("CaRotation Z").min(-15).max(15).listen();
