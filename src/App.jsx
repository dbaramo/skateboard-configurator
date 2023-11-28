import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { Perf } from "r3f-perf";
import { Loader, OrbitControls, useProgress } from "@react-three/drei";

import { useRef } from "react";

export default function App() {
  const canvasContainerRef = useRef();

  return (
    <div
      ref={canvasContainerRef}
      id="canvas-container"
      className="w-screen h-[100svh] fixed touch-none max-w-[2000px] left-[50%] translate-x-[-50%]"
    >
      <Canvas
        camera={{
          fov: 15,
        }}
      >
        <Scene canvasContainerRef={canvasContainerRef} />
        {/* <Perf /> */}
      </Canvas>
      <Loader />
    </div>
  );
}
