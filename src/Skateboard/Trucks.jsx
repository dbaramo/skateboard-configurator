import React, { useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import Wheels from "./Wheels";

export default function Trucks(props) {
  const { nodes, materials } = useGLTF("/trucks.glb");
  const { index, info, wheelUniformRef } = props;

  const xPosition = Number((0.4 * index).toFixed(3));

  const trucksTexture = useTexture(info.texture_url);
  const trucksMaterial = materials.SkateBoardSub.clone();

  trucksTexture.flipY = false;
  trucksMaterial.map = trucksTexture;
  trucksMaterial.transparent = true;

  useFrame(({ scene }) => {
    const currentTrucksGroup = scene.children[1].children[0].children[1];
    const opacityValue = Math.cos(
      (currentTrucksGroup.position.x + xPosition) * 5
    );

    console.log();
    if (currentTrucksGroup.position.z > 0 && index === 0) {
      trucksMaterial.opacity = Math.abs(
        currentTrucksGroup.position.z / 0.054 - 1
      );
    } else {
      trucksMaterial.opacity = opacityValue;
    }
  });
  return (
    <group name={`trucks-${info.name}`} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.FrontTruck_SkateBoardSub_0.geometry}
        material={trucksMaterial}
        position={[xPosition + 0.00034575, -0.3191779, 0.05499246]}
        rotation={[-3.09979441, -0.00693939, 3.14115289]}
        scale={0.01539029}
      />

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.RearTruck_SkateBoardSub_0.geometry}
        material={trucksMaterial}
        position={[xPosition + 0.00000446, 0.30811149, 0.05383722]}
        rotation={[3.10787983, -0.00983042, -3.14133554]}
        scale={0.01539029}
      />
      <Wheels position-x={xPosition} wheelUniformRef={wheelUniformRef} />
    </group>
  );
}

useGLTF.preload("/trucks.glb");
