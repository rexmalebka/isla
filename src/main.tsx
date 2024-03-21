import { render } from 'react-dom'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Joystick } from 'react-joystick-component';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { PointerLockControls, PointerLockControlsProps } from '@react-three/drei'
import { GiJoystick } from "@react-icons/all-files/gi/GiJoystick";
import { GiKeyboard } from "@react-icons/all-files/gi/GiKeyboard";
import { GiArrowCursor } from "@react-icons/all-files/gi/GiArrowCursor";
import { GoChevronDown } from "@react-icons/all-files/go/GoChevronDown";
import { GoChevronUp } from "@react-icons/all-files/go/GoChevronUp";

import { FogExp2 } from 'three';


import './css/style.css'
const Model = () => {
    const gltf = useLoader(GLTFLoader, `${location.href}/models/tuneles.glb`, (loader) => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(`${location.href}/js/`);
        loader.setDRACOLoader(dracoLoader);
    })

    return <>
        <primitive object={gltf.scene} />
    </>

}

const Mobile_control = ({
    set_enable_pointer_control,

    set_camera_rotation_rate_y,

    set_move_forward,
    set_move_backward

}: {
    set_enable_pointer_control: (d: boolean) => void,
    set_camera_rotation_rate_y: (d: number) => void,
    set_move_forward: (d: boolean) => void,
    set_move_backward: (d: boolean) => void
}) => {

    const stop_moving: (evt: any) => void = useCallback(() => {
        set_move_forward(false)
        set_move_backward(false)
        set_camera_rotation_rate_y(0)
        setTimeout(() => {
            set_enable_pointer_control(true)
        }, 100)
    }, [])

    const handle_joystick: ({ x, y }: { x: number, y: number }) => void = useCallback(({ x, y }) => {
        set_camera_rotation_rate_y((Math.PI * 2 * x))

        set_move_forward(y >= 0)
        set_move_backward(y < 0)
        set_enable_pointer_control(false)

    }, [])

    return (
        <div id="angle-control">
            <Joystick move={handle_joystick} stop={stop_moving} stickColor='#ffffff5e' baseColor='#ffffff5e' />
        </div>
    )
}

const Camera = ({
    enable_pointer_control,

    camera_rotation_rate_y, set_camera_rotation_rate_y,
    camera_rotation_rate_x, set_camera_rotation_rate_x,

    move_forward, move_backward,
    move_right, move_left,

    set_move_forward, set_move_backward,
    set_move_right, set_move_left,
}: {
    enable_pointer_control: boolean,

    camera_rotation_rate_y: number,
    set_camera_rotation_rate_y: (t: number) => void,

    camera_rotation_rate_x: number,
    set_camera_rotation_rate_x: (t: number) => void,

    move_forward: boolean, move_backward: boolean,
    move_right: boolean, move_left: boolean,

    set_move_forward: (t: boolean) => void, set_move_backward: (t: boolean) => void,
    set_move_right: (t: boolean) => void, set_move_left: (t: boolean) => void,
}) => {
    const { camera } = useThree()
    const [last, set_last] = useState(0)
    const controls = useRef<PointerLockControlsProps>(null)

    const vel = 0.165

    useFrame(() => {
        if (!controls.current) return
        if ((performance.now() - last) < (1000 / 60)) {
            return
        }
        set_last(performance.now())
        camera.rotation.y += 0.0025 * -camera_rotation_rate_y
        camera.rotation.x += 0.0025 * -camera_rotation_rate_x

        controls.current.moveForward((Number(move_forward) - Number(move_backward)) * vel)
        controls.current.moveRight((Number(move_right) - Number(move_left)) * vel)
    })

    useEffect(() => {

        camera.rotation.order = 'YXZ'
        const handler_keydown = (evt: KeyboardEvent) => {
            switch (evt.key.toLowerCase()) {
                case 'w':
                    set_move_forward(true)
                    break
                case 's':
                    set_move_backward(true)
                    break
                case 'a':
                    set_move_left(true)
                    break
                case 'd':
                    set_move_right(true)
                    break
                case 'j':
                    set_camera_rotation_rate_y(Math.PI * -2)
                    break
                case 'l':
                    set_camera_rotation_rate_y(Math.PI * 2)
                    break
                case 'i':
                    set_camera_rotation_rate_x(Math.PI * -2)
                    break
                case 'k':
                    set_camera_rotation_rate_x(Math.PI * 2)
                    break
            }
        }

        const handler_keyup = (evt: KeyboardEvent) => {
            switch (evt.key.toLowerCase()) {
                case 'w':
                    set_move_forward(false)
                    break
                case 's':
                    set_move_backward(false)
                    break
                case 'a':
                    set_move_left(false)
                    break
                case 'd':
                    set_move_right(false)
                    break
                case 'j':
                    set_camera_rotation_rate_y(0)
                    break
                case 'l':
                    set_camera_rotation_rate_y(0)
                    break
                case 'i':
                    set_camera_rotation_rate_x(0)
                    break
                case 'k':
                    set_camera_rotation_rate_x(0)
                    break
            }
        }

        document.body.addEventListener('keydown', handler_keydown)
        document.body.addEventListener('keyup', handler_keyup)

        return () => {
            document.body.removeEventListener('keydown', handler_keydown)
            document.body.removeEventListener('keyup', handler_keyup)
        }
    }, [])

    return (<>
        <PointerLockControls onLock={() => {
            if (!enable_pointer_control) controls.current.unlock()
        }} selector={"#app"} ref={controls} />
        <camera />
    </>)
}

const Menu = ({
    enable_pointer_control,
    set_enable_pointer_control
}: {
    enable_pointer_control: boolean,
    set_enable_pointer_control: (d: boolean) => void
}) => {


    const [closed, set_closed] = useState(false)

    useEffect(() => {
        console.debug("asdfsd")
        set_enable_pointer_control(false)
    }, [])

    return (

        closed ? (
            <h1 className='menu-closed'> Isla <GoChevronUp onClick={() => {
                console.debug("ASDFSDf")
                set_closed(false)
                set_enable_pointer_control(false)
            }
            } /> </h1 >
        ) : (
            <div id="menu">
                <h1>Isla <GoChevronDown onClick={() => {
                    set_closed(true)
                    setTimeout(() => set_enable_pointer_control(true), 100)
                }} /></h1>

                <hr />
                <p>by rexmalebka</p>
                <p>
                    <GiJoystick /> Use Joystick to navigate.
                </p>
                <p>
                    <GiArrowCursor /> If your devices supports it, click on the screen to use your pointer to control the camera.
                </p>
                <p>
                    <GiKeyboard /> You can also use your keyboard for moving around (WASD) and rotate camera (IJKL).
                </p>

            </div >

        )
    )
}

const Scene = () => {
    const { scene } = useThree()

    useEffect(() => {
        scene.fog = new FogExp2(0xcccccc, 0.01)
    }, [])

    return (
        <scene />
    )
}

const App = () => {

    const [camera_rotation_rate_y, set_camera_rotation_rate_y] = useState(0)
    const [camera_rotation_rate_x, set_camera_rotation_rate_x] = useState(0)

    const [move_forward, set_move_forward] = useState(false)
    const [move_backward, set_move_backward] = useState(false)
    const [move_right, set_move_right] = useState(false)
    const [move_left, set_move_left] = useState(false)

    const [enable_pointer_control, set_enable_pointer_control] = useState(false)

    return (
        <>
            <Menu enable_pointer_control={enable_pointer_control} set_enable_pointer_control={set_enable_pointer_control} />
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
                <mesh position={[5, 0, 0]} >
                    <boxGeometry />
                    <meshBasicMaterial color={0xff0000} />
                </mesh>
                <Suspense fallback={null}>

                    <Model />
                </Suspense>
            </Canvas>
        </>
    )
}

render(<App></App>, document.querySelector("#app"))                                                                                                                                      