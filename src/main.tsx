import { render } from "react-dom";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Joystick } from "react-joystick-component";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { FogExp2, Vector3, BufferGeometry } from "three";
import { TextureLoader } from "three/src/loaders/TextureLoader";

// import limits from './json/limits.json'

import Map from "./map";
import Camera from "./Camera";
import Menu from "./Menu";

import "./css/style.css";
import { MeshWobbleMaterial } from "@react-three/drei";

const Model = () => {
  const gltf = useLoader(
    GLTFLoader,
    `${location.href}/models/tuneles2.glb`,
    (loader) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(`${location.href}/js/`);
      loader.setDRACOLoader(dracoLoader);
    }
  );

  return (
    <>
      <primitive object={gltf.scene} />
    </>
  );
};

const Mobile_control = ({
  set_enable_pointer_control,

  set_camera_rotation_rate_y,

  set_move_forward,
  set_move_backward,
}: {
  set_enable_pointer_control: (d: boolean) => void;
  set_camera_rotation_rate_y: (d: number) => void;
  set_move_forward: (d: boolean) => void;
  set_move_backward: (d: boolean) => void;
}) => {
  const stop_moving: (evt: any) => void = useCallback(() => {
    set_move_forward(false);
    set_move_backward(false);
    set_camera_rotation_rate_y(0);
    setTimeout(() => {
      set_enable_pointer_control(true);
    }, 100);
  }, []);

  const handle_joystick: ({ x, y }: { x: number; y: number }) => void =
    useCallback(({ x, y }) => {
      set_camera_rotation_rate_y(Math.PI * 2 * x);

      set_move_forward(y >= 0);
      set_move_backward(y < 0);
      set_enable_pointer_control(false);
    }, []);

  return (
    <div id="angle-control">
      <Joystick
        move={handle_joystick}
        stop={stop_moving}
        stickColor="#ffffff5e"
        baseColor="#ffffff5e"
      />
    </div>
  );
};

const Sprites = () => {
  const mat = useLoader(TextureLoader, `${location.href}/img/sprites/glow.png`);

  return (
    <mesh
      position={[-156.41656252745665, 1.7000000000001547, -38.47951062141615]}
      name="sprite"
    >
      <sphereGeometry></sphereGeometry>
      <MeshWobbleMaterial map={mat} factor={1} speed={10} transparent={true} />
    </mesh>
  );
};

const Scene = () => {
  const { scene, camera } = useThree();

  useEffect(() => {
    scene.fog = new FogExp2(0xcccccc, 0.01);
    console.info({ camera, scene });
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <Sprites></Sprites>
      </Suspense>
      <scene />
    </>
  );
};

const App = () => {
  const [camera_rotation_rate_y, set_camera_rotation_rate_y] = useState(0);
  const [camera_rotation_rate_x, set_camera_rotation_rate_x] = useState(0);

  const [move_forward, set_move_forward] = useState(false);
  const [move_backward, set_move_backward] = useState(false);
  const [move_right, set_move_right] = useState(false);
  const [move_left, set_move_left] = useState(false);

  const [polygon, set_polygon] = useState<Vector3[]>([]);
  const [enable_pointer_control, set_enable_pointer_control] = useState(false);

  const [region, set_region] = useState("unknown");
  const [floor, set_floor] = useState("underground");

  const [pos_norm, set_pos_norm] = useState([0, 0]);
  const [cam_rot, set_cam_rot] = useState(0);

  useEffect(() => {
    console.debug("polis", polygon, set_polygon);
  }, [polygon]);

  useEffect(() => {
    // console.debug(pos_norm)
  }, [pos_norm]);

  return (
    <>
      <Map region={region} pos_norm={pos_norm} />
      <Menu
        enable_pointer_control={enable_pointer_control}
        set_enable_pointer_control={set_enable_pointer_control}
        region={region}
      />
      <Mobile_control
        set_camera_rotation_rate_y={set_camera_rotation_rate_y}
        set_move_forward={set_move_forward}
        set_move_backward={set_move_backward}
        set_enable_pointer_control={set_enable_pointer_control}
      />
      <Canvas>
        <Scene />
        <Camera
          enable_pointer_control={enable_pointer_control}
          set_polygon={set_polygon}
          set_region={set_region}
          region={region}
          floor={floor}
          set_floor={set_floor}
          set_pos_norm={set_pos_norm}
          set_cam_rot={set_cam_rot}
          camera_rotation_rate_y={camera_rotation_rate_y}
          set_camera_rotation_rate_y={set_camera_rotation_rate_y}
          camera_rotation_rate_x={camera_rotation_rate_x}
          set_camera_rotation_rate_x={set_camera_rotation_rate_x}
          move_forward={move_forward}
          move_backward={move_backward}
          move_right={move_right}
          move_left={move_left}
          set_move_forward={set_move_forward}
          set_move_backward={set_move_backward}
          set_move_right={set_move_right}
          set_move_left={set_move_left}
        />
        <ambientLight intensity={Math.PI / 2} />

        <Suspense fallback={null}>
          <Model />
        </Suspense>
        {polygon.map((p, i) => (
          <mesh position={p} scale={[0.5, 200, 0.5]}>
            <boxGeometry />
            <meshBasicMaterial color={i == 0 ? 0xff0000 : 0x00ff00} />
          </mesh>
        ))}
      </Canvas>
    </>
  );
};

render(<App></App>, document.querySelector("#app"));
