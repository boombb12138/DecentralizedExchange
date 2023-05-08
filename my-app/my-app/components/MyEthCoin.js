import { useLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function MyEthCoin() {
  const { scene } = useGLTF("./ethcoin.gltf");

  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.rotation.y += 0.01;
  });

  return <primitive object={scene} ref={meshRef} />;
}
