import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PointerLockControls,
  PointerLockControlsProps,
} from "@react-three/drei";
import TWEEN from "@tweenjs/tween.js";

import { Vector3 } from "three";

type limit_place = {
  name: string;
  y: number;
  polygon: number[][];
};

type limits = {
  [floor: string]: limit_place[];
};

const Camera = ({
  enable_pointer_control,

  set_polygon,
  set_region,
  region,
  floor,
  set_floor,

  set_pos_norm,
  set_cam_rot,

  camera_rotation_rate_y,
  set_camera_rotation_rate_y,
  camera_rotation_rate_x,
  set_camera_rotation_rate_x,

  move_forward,
  move_backward,
  move_right,
  move_left,

  set_move_forward,
  set_move_backward,
  set_move_right,
  set_move_left,
}: {
  enable_pointer_control: boolean;

  set_polygon: (fx: (d: Vector3[]) => Vector3[]) => void;
  set_region: (r: string) => void;
  region: string;
  floor: string;
  set_floor: (r: string) => void;

  set_pos_norm: (d: [number, number]) => void;
  set_cam_rot: (d: number) => void;

  camera_rotation_rate_y: number;
  set_camera_rotation_rate_y: (t: number) => void;

  camera_rotation_rate_x: number;
  set_camera_rotation_rate_x: (t: number) => void;

  move_forward: boolean;
  move_backward: boolean;
  move_right: boolean;
  move_left: boolean;

  set_move_forward: (t: boolean) => void;
  set_move_backward: (t: boolean) => void;
  set_move_right: (t: boolean) => void;
  set_move_left: (t: boolean) => void;
}) => {
  const { camera, scene } = useThree();
  const [last, set_last] = useState(0);
  const controls = useRef<PointerLockControlsProps>(null);
  const [limits, set_limits] = useState<limits>({});

  const [m_region, set_m_region] = useState("");

  const vel = 0.165;

  const point_inside_limits = useCallback(
    (point: [number, number, number]): { name: "unknown" } | limit_place => {
      const x = point[0],
        y = point[1],
        z = point[2];

      let insides: boolean[] = [];

      if (!limits[floor]) return { name: "unknown" };

      const floor_limits = limits[floor];

      for (let place of floor_limits) {
        let inside = false;
        const polygon = place.polygon;

        if (Math.abs(place.y - camera.position.y) > 10) {
          insides.push(false);
          continue;
        }

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          let xi = polygon[i][0],
            zi = polygon[i][1];
          let xj = polygon[j][0],
            zj = polygon[j][1];

          let intersect =
            zi > z != zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
          if (intersect) inside = !inside;
        }

        insides.push(inside);
      }

      // console.debug(floor_limits.map((l, i) => `${l.name}: ${insides[i]} `).join(' '))
      const place: limit_place | { name: "unknown" } = insides.some((t) => t)
        ? floor_limits[insides.indexOf(true)]
        : { name: "unknown" };

      return place;
    },
    [limits, floor]
  );

  useFrame(() => {
    TWEEN.update();
  });

  useFrame(() => {
    if (!controls.current) return;
    if (performance.now() - last < 1000 / 60) {
      return;
    }
    set_last(performance.now());

    const pos = [camera.position.x, camera.position.z];

    camera.rotation.y += 0.0025 * -camera_rotation_rate_y;
    camera.rotation.x += 0.0025 * -camera_rotation_rate_x;

    controls.current.moveForward(
      (Number(move_forward) - Number(move_backward)) * vel
    );
    controls.current.moveRight((Number(move_right) - Number(move_left)) * vel);

    const place = point_inside_limits([
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ]);

    set_m_region(place["name"]);

    if (place.name == "unknown") {
      camera.position.setX(pos[0])
      camera.position.setZ(pos[1])
    } else {
      new TWEEN.Tween(camera.position)
        .to({ y: (place as { y: number }).y }, 150)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .start();
    }

    const x_min = -237.98529838684982,
      z_min = -266.4529615979886;
    const x_max = 162.55989823299316,
      z_max = 111.03816240392462;

    set_pos_norm([
      (camera.position.x - x_min) / (x_max - x_min),
      (camera.position.z - z_min) / (z_max - z_min),
    ]);

    const r = (camera.rotation.y % Math.PI) * 2;

    set_cam_rot(r < 0 ? r + Math.PI / 2 : r);
  });

  useEffect(() => {
    set_region(m_region);
  }, [m_region]);

  useEffect(() => {
    if (!floor) return;
    console.info("camera", camera);
    console.info("scene", scene);

    import("./json/limits.json").then((data) => {
      set_limits(data.default);
    });

    camera.rotation.order = "YXZ";
    const handler_keydown = (evt: KeyboardEvent) => {
      switch (evt.key.toLowerCase()) {
        case "w":
          set_move_forward(true);
          break;
        case "s":
          set_move_backward(true);
          break;
        case "a":
          set_move_left(true);
          break;
        case "d":
          set_move_right(true);
          break;
        case "j":
          set_camera_rotation_rate_y(Math.PI * -2);
          break;
        case "l":
          set_camera_rotation_rate_y(Math.PI * 2);
          break;
        case "i":
          set_camera_rotation_rate_x(Math.PI * -2);
          break;
        case "k":
          set_camera_rotation_rate_x(Math.PI * 2);
          break;
      }
    };

    const handler_keyup = (evt: KeyboardEvent) => {
      switch (evt.key.toLowerCase()) {
        case "w":
          set_move_forward(false);
          break;
        case "s":
          set_move_backward(false);
          break;
        case "a":
          set_move_left(false);
          break;
        case "d":
          set_move_right(false);
          break;
        case "j":
          set_camera_rotation_rate_y(0);
          break;
        case "l":
          set_camera_rotation_rate_y(0);
          break;
        case "i":
          set_camera_rotation_rate_x(0);
          break;
        case "k":
          set_camera_rotation_rate_x(0);
          break;
        case " ":
          const pos = new Vector3();
          pos.copy(camera.position);

          set_polygon((vts) => [...vts, pos]);
          break;
      }
    };

    camera.position.set(-138.82398805534916, 1.7, -41.829489760242346);

    document.body.addEventListener("keydown", handler_keydown);
    document.body.addEventListener("keyup", handler_keyup);

    return () => {
      document.body.removeEventListener("keydown", handler_keydown);
      document.body.removeEventListener("keyup", handler_keyup);
    };
  }, []);

  useEffect(() => {
    if (!limits[floor]) return;

    let lims: Vector3[] = [];

    for (let [name, place] of Object.entries(limits[floor])) {
      if (
        name == "vein A" ||
        name == "vein B" ||
        name == "vein C" ||
        name == "vein D"
      ) {
        place.polygon.forEach((p) => lims.push(new Vector3(p[0], 2, p[1])));
      }
    }
  }, [limits, floor]);

  return (
    <>
      <PointerLockControls
        onLock={() => {
          if (!enable_pointer_control) controls.current.unlock();
        }}
        selector={"#app"}
        ref={controls as any}
      />
      <camera />
    </>
  );
};

export default Camera;
