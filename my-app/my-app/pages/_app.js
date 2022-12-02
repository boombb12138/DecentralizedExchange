import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
// useEffect(() => {
//   const scene = new THREE.Scene();
//   // scene.background = null;
//   const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
//   );

//   const canvas = document.getElementById("webgl");
//   const renderer = new THREE.WebGLRenderer({ canvas: canvas });
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   // document.body.appendChild(renderer.domElement); //创建画布canvas

//   const controls = new OrbitControls(camera, canvas);
//   controls.update();

//   const geometry = new THREE.SphereGeometry(2, 32, 32);
//   // 换球体的材质为宇宙背景的图片
//   const textureLoader = new THREE.TextureLoader();
//   const texture = textureLoader.load("texture.png");
//   const material = new THREE.MeshBasicMaterial({ map: texture });
//   const cube = new THREE.Mesh(geometry, material);
//   scene.add(cube);

//   camera.position.z = 5;

//   function animate() {
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
//     requestAnimationFrame(animate);
//     controls.update();
//     renderer.render(scene, camera);
//   }

//   animate();
// }, []);
