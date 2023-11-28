/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { deckInfo, trucksInfo } from "../info.js";
import Trucks from "./Trucks";

export default function Deck(props) {
  const { nodes, materials } = useGLTF("/board.glb");
  const {
    info,
    position,
    index,
    currentSection,
    scale,
    snapScroll,
    wheelUniformRef,
  } = props;
  const { texture_url } = info;
  const texture = useTexture(texture_url);

  const boardMeshRef = useRef();
  const groupRef = useRef();

  const { camera } = useThree();

  useEffect(() => {
    groupRef.current.position.copy(position);
  }, []);

  useFrame((state, delta) => {
    if (currentSection === "board") {
      const cameraX = camera.position.x;
      const scaleFactor = Math.cos((cameraX - position.x) * 2);

      groupRef.current.scale.x = 0.8 * Math.max(0.63, scaleFactor);
      groupRef.current.scale.y = 0.8 * Math.max(0.63, scaleFactor);
      groupRef.current.scale.z = 0.8 * Math.max(0.63, scaleFactor);
    }
  });

  function moveCameraToDeck() {
    if (currentSection === "board") {
      snapScroll(index);
    }
  }
  return (
    <group
      ref={groupRef}
      name="deck-group"
      onClick={moveCameraToDeck}
      onPointerOver={() => {
        if (currentSection === "board") {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh
        ref={boardMeshRef}
        castShadow
        receiveShadow
        geometry={
          nodes["Skate_Deck_RAW_004_ONEMAT_001__Bahman-Texture_jpg_0"].geometry
        }
        rotation={[-Math.PI / 2, 0, 0]}
        scale={1.428}
      >
        <meshBasicMaterial
          side={2}
          map={texture}
          transparent={true}
          opacity={0}
        />
      </mesh>

      <group visible={false} name="trucks-group-2" position-z={0.054}>
        {trucksInfo.map((t, i) => (
          <Trucks
            key={i}
            index={i}
            info={t}
            wheelUniformRef={wheelUniformRef}
          />
        ))}
      </group>
    </group>
  );
}

useGLTF.preload("/board.glb");
