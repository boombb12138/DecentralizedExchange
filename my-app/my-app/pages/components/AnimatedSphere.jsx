import React, { memo } from "react";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
const AnimatedSphereSmall = memo(() => {
  return (
    <Sphere visible args={[1, 100, 200]} scale={0.8}>
      <MeshDistortMaterial
        color="#8352FD"
        attach="material"
        speed={1.5}
        roughness={2}
      />
    </Sphere>
  );
});
const AnimatedSphere = memo(() => {
  return (
    <Sphere visible args={[1, 100, 200]} scale={1.8}>
      <MeshDistortMaterial
        color="#8352FD"
        attach="material"
        speed={1.5}
        roughness={2}
      />
    </Sphere>
  );
});
const AnimatedSphereBig = memo(() => {
  return (
    <Sphere visible args={[1, 100, 200]} scale={2.8}>
      <MeshDistortMaterial
        color="#8352FD"
        attach="material"
        speed={1.5}
        roughness={0}
      />
    </Sphere>
  );
});

export { AnimatedSphereSmall, AnimatedSphere, AnimatedSphereBig };
