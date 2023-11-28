import { useGLTF, useTexture } from "@react-three/drei";

import * as THREE from "three";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { wheelsInfo } from "../info";

function WheelMaterial({ wheelUniformRef }) {
  const blackTexture = useTexture("black.jpg");
  const wheelsTexture = useTexture(wheelsInfo[0].texture_url);
  const wheelsTexture2 = useTexture(wheelsInfo[1].texture_url);
  wheelsTexture.flipY = false;
  wheelsTexture2.flipY = false;

  return (
    <meshStandardMaterial
      map={blackTexture}
      transparent={true}
      needsUpdate={true}
      onBeforeCompile={(shader) => {
        wheelUniformRef.current = shader.uniforms;
        wheelUniformRef.current.texture1 = { value: wheelsTexture };
        wheelUniformRef.current.texture2 = { value: wheelsTexture2 };
        wheelUniformRef.current.mixValue = { value: 0 };

        shader.fragmentShader = `
              uniform sampler2D texture1;
              uniform sampler2D texture2;
              uniform float mixValue;
              ${shader.fragmentShader.replace(
                "#include <map_fragment>",
                `

                vec4 tex1 = texture2D( texture1, vMapUv );
                vec4 tex2 = texture2D( texture2, vMapUv );
                // tex2 = vec4( mix( pow( tex2.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), tex2.rgb * 0.0773993808, vec3( lessThanEqual( tex2.rgb, vec3( 0.04045 ) ) ) ), tex2.w );

                vec4 sampledDiffuseColor = mix(tex1, tex2, mixValue);
                
                // if(mixValue > 0.01){
                  sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
                // }

                diffuseColor *= sampledDiffuseColor;
                `
              )}
            `;
      }}
    />
  );
}

export default function Wheels(props) {
  const { wheelUniformRef } = props;

  const { nodes, materials } = useGLTF("/wheels.glb");
  const mainWheelRef = useRef();
  const groupRef = useRef();
  useEffect(() => {
    groupRef.current.children.forEach((mesh) => {
      if (mesh !== mainWheelRef.current) {
        mesh.material = mainWheelRef.current.material;
      }
    });
  }, []);

  return (
    <group
      name={`wheels`}
      {...props}
      dispose={null}
      visible={false}
      ref={groupRef}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["front-left-wheel"].geometry}
        position={[0.12981272, -0.33585542, 0.09138285]}
        rotation={[-3.09979441, -0.00693939, 3.14115289]}
        scale={0.01539029}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["front-right-wheel"].geometry}
        position={[-0.12914905, -0.33604428, 0.09317359]}
        rotation={[-3.09979441, -0.00693939, 3.14115289]}
        scale={0.01539029}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["rear-left-wheel"].geometry}
        position={[0.1298437, 0.32442358, 0.08996219]}
        rotation={[3.10787983, -0.00983042, -3.14133554]}
        scale={0.01539029}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["rear-right-wheel"].geometry}
        position={[-0.12911181, 0.32457632, 0.0925042]}
        rotation={[3.10787983, -0.00983042, -3.14133554]}
        scale={0.01539029}
        ref={mainWheelRef}
      >
        <WheelMaterial wheelUniformRef={wheelUniformRef} />
      </mesh>
    </group>
  );
}
