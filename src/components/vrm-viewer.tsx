"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useFBX, useAnimations, Environment, Gltf, useProgress } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { VRMLoaderPlugin, VRM, VRMUtils } from "@pixiv/three-vrm";
import { lerp } from "three/src/math/MathUtils.js";
import { remapMixamoAnimationToVrm } from "@/lib/vrm/remap-mixamo-animation";

const ANIMATIONS = ["Thriller", "Idle", "Swing Dancing"] as const;
type AnimationName = (typeof ANIMATIONS)[number];

function VrmModel({
  url,
  animation,
  loaderDone,
}: {
  url: string;
  animation: AnimationName;
  loaderDone: boolean;
}) {
  const { scene, userData } = useGLTF(
    url,
    undefined,
    undefined,
    (loader: THREE.Loader) => {
      (loader as THREE.Loader & { register: (cb: (parser: unknown) => VRMLoaderPlugin) => void }).register(
        (parser: unknown) => new VRMLoaderPlugin(parser as ConstructorParameters<typeof VRMLoaderPlugin>[0])
      );
    }
  );

  const currentVrm = userData.vrm as VRM | undefined;

  // Load all Mixamo animations
  const idleFbx = useFBX("/models/animations/Breathing Idle.fbx");
  const swingFbx = useFBX("/models/animations/Swing Dancing.fbx");
  const thrillerFbx = useFBX("/models/animations/Thriller Part 2.fbx");

  // Remap all animations to VRM skeleton
  const clips = useMemo(() => {
    if (!currentVrm) return [];
    const idle = remapMixamoAnimationToVrm(currentVrm, idleFbx);
    idle.name = "Idle";
    const swing = remapMixamoAnimationToVrm(currentVrm, swingFbx);
    swing.name = "Swing Dancing";
    const thriller = remapMixamoAnimationToVrm(currentVrm, thrillerFbx);
    thriller.name = "Thriller";
    return [idle, swing, thriller];
  }, [currentVrm, idleFbx, swingFbx, thrillerFbx]);

  const { actions } = useAnimations(clips, currentVrm?.scene);

  // Blink state
  const blinkTimer = useRef(2 + Math.random() * 3);
  const blinkState = useRef<"open" | "closing" | "opening">("open");
  const blinkProgress = useRef(0);

  // Mouse tracking
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const lookAtTarget = useRef<THREE.Object3D | null>(null);
  const lookAtDestination = useRef(new THREE.Vector3(0, 0, 0));
  const camera = useThree((state) => state.camera);

  // VRM setup
  useEffect(() => {
    if (!currentVrm) return;

    VRMUtils.removeUnnecessaryVertices(scene);
    VRMUtils.combineSkeletons(scene);

    currentVrm.scene.traverse((obj: THREE.Object3D) => {
      obj.frustumCulled = false;
    });

    currentVrm.expressionManager?.setValue("happy", 0.3);

    const target = new THREE.Object3D();
    camera.add(target);
    lookAtTarget.current = target;

    return () => {
      camera.remove(target);
    };
  }, [currentVrm, scene, camera]);

  // Play selected animation — wait for loader to finish on first play
  const hasPlayedOnce = useRef(false);
  useEffect(() => {
    if (!actions[animation]) return;
    if (!hasPlayedOnce.current && !loaderDone) return; // wait for loader

    const delay = !hasPlayedOnce.current ? 800 : 0;
    hasPlayedOnce.current = true;

    const t = setTimeout(() => {
      Object.values(actions).forEach((action) => {
        if (action && action.isRunning()) {
          action.fadeOut(0.5);
        }
      });
      actions[animation]!.reset().fadeIn(0.5).play();
    }, delay);

    return () => {
      clearTimeout(t);
      actions[animation]?.fadeOut(0.5);
    };
  }, [actions, animation, loaderDone]);

  // Mouse listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const lerpExpression = useCallback(
    (name: string, value: number, factor: number) => {
      if (!currentVrm?.expressionManager) return;
      const current = currentVrm.expressionManager.getValue(name) ?? 0;
      currentVrm.expressionManager.setValue(name, lerp(current, value, factor));
    },
    [currentVrm]
  );

  useFrame((_, delta) => {
    if (!currentVrm) return;

    // Mouse-follow eyes
    if (currentVrm.lookAt && lookAtTarget.current) {
      currentVrm.lookAt.target = lookAtTarget.current;
      lookAtDestination.current.set(
        -mousePos.current.x * 1.5,
        mousePos.current.y * 1.0,
        0
      );
      lookAtTarget.current.position.lerp(lookAtDestination.current, delta * 4);
    }

    // Random blinking
    blinkTimer.current -= delta;

    if (blinkState.current === "open" && blinkTimer.current <= 0) {
      blinkState.current = "closing";
      blinkProgress.current = 0;
    }
    if (blinkState.current === "closing") {
      blinkProgress.current += delta * 12;
      if (blinkProgress.current >= 1) {
        blinkProgress.current = 1;
        blinkState.current = "opening";
      }
      lerpExpression("blink", blinkProgress.current, 0.8);
    }
    if (blinkState.current === "opening") {
      blinkProgress.current -= delta * 8;
      if (blinkProgress.current <= 0) {
        blinkProgress.current = 0;
        blinkState.current = "open";
        blinkTimer.current =
          Math.random() < 0.2
            ? 0.15 + Math.random() * 0.2
            : 2 + Math.random() * 5;
      }
      lerpExpression("blink", blinkProgress.current, 0.8);
    }

    currentVrm.update(delta);
  });

  return (
    <group position-y={-1.25}>
      <primitive object={scene} rotation-y={Math.PI} />
    </group>
  );
}

function Loader({ onDone }: { onDone?: () => void }) {
  const { progress, active } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const doneRef = useRef(false);
  const realDone = useRef(false);
  const rafRef = useRef<number>(0);

  // Track when real loading finishes
  useEffect(() => {
    if (!active && progress === 100) {
      realDone.current = true;
    }
  }, [active, progress]);

  // Smooth animated progress: ticks up steadily, accelerates once real loading is done
  useEffect(() => {
    let current = 0;
    const tick = () => {
      if (doneRef.current) return;

      if (realDone.current) {
        // Loading done — rush to 100
        current = Math.min(100, current + 3);
      } else if (current < 30) {
        // Quick initial ramp
        current += 0.8;
      } else if (current < 70) {
        // Slow middle
        current += 0.3;
      } else if (current < 90) {
        // Even slower near end
        current += 0.1;
      }
      // Never exceed 95 until real loading is done
      if (!realDone.current && current > 95) current = 95;

      setDisplayProgress(current);

      if (current >= 100) {
        doneRef.current = true;
        setTimeout(() => setFading(true), 200);
        setTimeout(() => {
          setHidden(true);
          onDone?.();
        }, 700);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Safety net: dismiss after 15s
  useEffect(() => {
    const t = setTimeout(() => {
      realDone.current = true;
    }, 15000);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            CoffeeJG
          </span>
        </div>

        {/* Spinner dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-56">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-pink-500 transition-[width] duration-500 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
            Loading experience...
          </p>
        </div>
      </div>
    </div>
  );
}

export function VrmViewer({
  url,
  className,
  showStage = false,
}: {
  url: string;
  className?: string;
  showStage?: boolean;
}) {
  const [animation, setAnimation] = useState<AnimationName>("Thriller");
  const [loaderDone, setLoaderDone] = useState(false);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Loader onDone={() => setLoaderDone(true)} />
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 35 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "transparent" }}
      >
        <Environment preset="sunset" />
        <directionalLight intensity={2} position={[10, 10, 5]} />
        <directionalLight intensity={1} position={[-10, 10, 5]} />

        <VrmModel url={url} animation={animation} loaderDone={loaderDone} />

        {showStage && (
          <Gltf
            src="/models/sound-stage-final.glb"
            position={[-0.5, -1.25, -1.4]}
            scale={0.65}
          />
        )}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />

        <EffectComposer>
          <Bloom mipmapBlur intensity={0.7} />
        </EffectComposer>
      </Canvas>

      {/* Animation picker */}
      <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-2">
        {ANIMATIONS.map((name) => (
          <button
            key={name}
            onClick={() => setAnimation(name)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              animation === name
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
