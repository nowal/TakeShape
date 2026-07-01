import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import cabinAsset from "../assets/cabin.glb.asset.json";

useGLTF.preload(cabinAsset.url);

type CabinProps = {
  progress: number;
};

function Cabin({ progress }: CabinProps) {
  const { scene } = useGLTF(cabinAsset.url);
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  // Center the model on the origin and frame the camera so it fills the view.
  const fitted = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    const sphere = new THREE.Sphere();
    box.getCenter(center);
    box.getBoundingSphere(sphere);
    cloned.position.sub(center);
    // Lower the model slightly so the roof doesn't crowd the top of the frame.
    cloned.position.y -= sphere.radius * 0.05;
    return { object: cloned, radius: sphere.radius };
  }, [scene]);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);
    cam.aspect = aspect;
    // Fit the bounding sphere to whichever axis is tighter.
    const fovV = THREE.MathUtils.degToRad(cam.fov);
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * aspect);
    const distV = fitted.radius / Math.sin(fovV / 2);
    const distH = fitted.radius / Math.sin(fovH / 2);
    const dist = Math.max(distV, distH) * 0.85; // pull in a touch so the cabin fills more of the frame
    // Camera at slight elevation, looking at origin.
    const elevation = fitted.radius * 0.25;
    cam.position.set(0, elevation, dist);
    cam.near = Math.max(0.1, dist - fitted.radius * 2);
    cam.far = dist + fitted.radius * 4;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height, fitted.radius]);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Slow continuous spin (~45s per rotation) + small scroll-driven nudge.
    const baseSpeed = (Math.PI * 2) / 45;
    group.current.rotation.y += delta * baseSpeed;
  });

  // Apply the scroll nudge as an additive offset on top of continuous rotation.
  const nudgeRef = useRef(0);
  useFrame(() => {
    if (!group.current) return;
    const targetNudge = progress * 0.6;
    nudgeRef.current += (targetNudge - nudgeRef.current) * 0.08;
    group.current.rotation.y += nudgeRef.current - (group.current.userData.lastNudge ?? 0);
    group.current.userData.lastNudge = nudgeRef.current;
  });

  return (
    <group ref={group}>
      <primitive object={fitted.object} />
    </group>
  );
}

export function HeroScene({ progress }: { progress: number }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ fov: 38, position: [0, 0, 10] }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={1.6}
          color={"#ffd9a8"}
        />
        <directionalLight
          position={[-5, 3, -3]}
          intensity={0.4}
          color={"#9fc2ff"}
        />
        <Environment preset="sunset" />
        <Cabin progress={progress} />
      </Suspense>
    </Canvas>
  );
}
