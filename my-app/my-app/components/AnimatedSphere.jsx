import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import React, { memo } from "react";
import {
  Sphere,
  MeshDistortMaterial,
  useTexture,
  MeshStandardMaterial,
} from "@react-three/drei";
const AnimatedSphereSmall = memo(() => {
  return (
    <Sphere
      visible
      args={[1, 100, 200]}
      scale={0.8}
      style={{ position: "absolute" }}
    >
      <MeshDistortMaterial
        color="#8352FD"
        attach="material"
        speed={1.5}
        roughness={2}
      />
    </Sphere>
  );
});
const EarthSphere = memo(() => {
  const textureEarth = useTexture("texture.png");
  const earthRef = useRef();

  useFrame((state, delta) => {
    const angle = state.clock.elapsedTime;
    earthRef.current.rotation.x += 0.01;
  });

  return (
    <mesh ref={earthRef} scale={1.5}>
      <sphereGeometry scale={1.5} />
      <meshStandardMaterial map={textureEarth} />
    </mesh>
  );
});
export default function AnimatedSphere() {
  return (
    <Sphere
      visible
      args={[1, 100, 200]}
      scale={1.8}
      style={{ position: "absolute" }}
    >
      <MeshDistortMaterial
        color="#8352FD"
        attach="material"
        speed={1.5}
        roughness={2}
      />
    </Sphere>
  );
}

const AnimatedSphereBig = memo(() => {
  return (
    <Sphere
      visible
      args={[1, 100, 200]}
      scale={2.8}
      style={{ position: "absolute" }}
    >
      <MeshDistortMaterial
        color="#8352FD"
        attach="material"
        speed={1.5}
        roughness={2}
      />
    </Sphere>
  );
});

export { AnimatedSphereSmall, AnimatedSphereBig, EarthSphere };
