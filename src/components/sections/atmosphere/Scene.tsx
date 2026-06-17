import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useRef } from "react";
import * as THREE from "three";
import { Earth, Clouds, Atmosphere } from "./Earth";
import { Particles } from "./Particles";

function CameraRig({
  scroll,
  isMobile,
}: {
  scroll: React.MutableRefObject<number>;
  isMobile?: boolean;
}) {
  const { camera } = useThree();
  // Mobile pulls camera closer so Earth fills ~70% of viewport.
  const mul = isMobile ? 0.72 : 1.0;
  useFrame(() => {
    const s = scroll.current;
    let targetZ: number;
    let targetY: number;
    if (s < 0.094) {
      targetZ = 3.4 * mul;
      targetY = 0;
    } else if (s < 0.262) {
      const k = (s - 0.094) / (0.262 - 0.094);
      targetZ = THREE.MathUtils.lerp(3.4 * mul, 1.08 * mul, k);
      targetY = THREE.MathUtils.lerp(0.0, -0.22, k);
    } else if (s < 0.365) {
      targetZ = 1.08 * mul;
      targetY = -0.22;
    } else if (s < 0.58) {
      const k = (s - 0.365) / (0.58 - 0.365);
      targetZ = THREE.MathUtils.lerp(1.08 * mul, 2.6 * mul, k);
      targetY = THREE.MathUtils.lerp(-0.22, -0.05, k);
    } else if (s < 0.701) {
      targetZ = 2.6 * mul;
      targetY = -0.05;
    } else {
      const k = (s - 0.701) / (1.0 - 0.701);
      targetZ = THREE.MathUtils.lerp(2.6 * mul, 1.8 * mul, k);
      targetY = THREE.MathUtils.lerp(-0.05, 0.12, k);
    }
    camera.position.x += (0 - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function AtmosphereScene({
  scroll,
  isMobile = false,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  scroll: React.MutableRefObject<number>;
  isMobile?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      className="pointer-events-none"
      camera={{ position: [0, 0, isMobile ? 2.45 : 3.4], fov: isMobile ? 46 : 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false, depth: true }}
      frameloop="always"
    >
      <color attach="background" args={["#030308"]} />
      <fog attach="fog" args={["#030308", 4, 10]} />
      <ambientLight intensity={0.05} />
      <Stars radius={60} depth={40} count={isMobile ? 1200 : 3500} factor={2.2} fade saturation={0} />
      <Particles count={isMobile ? 500 : 1400} />
      <group ref={groupRef}>
        <Atmosphere />
        <Earth />
        <Clouds />
      </group>
      <CameraRig scroll={scroll} isMobile={isMobile} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={isMobile ? 0.55 : 0.7} luminanceThreshold={0.55} luminanceSmoothing={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>

  );
}