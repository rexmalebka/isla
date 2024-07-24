import { useEffect, useState } from "react";

import { GiJoystick } from "@react-icons/all-files/gi/GiJoystick";
import { GiKeyboard } from "@react-icons/all-files/gi/GiKeyboard";
import { GiArrowCursor } from "@react-icons/all-files/gi/GiArrowCursor";

import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import "./css/menu.css";

const Menu = ({
  enable_pointer_control,
  set_enable_pointer_control,
  region,
}: {
  enable_pointer_control: boolean;
  set_enable_pointer_control: (d: boolean) => void;
  region: string;
}) => {
  const [closed, set_closed] = useState(false);

  useEffect(() => {
    set_enable_pointer_control(false);
  }, []);

  return closed ? (
    <p className="menu-closed">
      <span>Menu</span>
      <GiHamburgerMenu
        onClick={() => {
          set_closed(false);
          set_enable_pointer_control(false);
        }}
      />{" "}
    </p>
  ) : (
    <div id="menu">
      <h1>
        <span>Isla</span>
        <IoMdClose
          onClick={() => {
            set_closed(true);
            setTimeout(() => set_enable_pointer_control(true), 100);
          }}
        />
      </h1>

      <hr />
      <p>by rexmalebka</p>
      <p>
        <GiJoystick /> Use Joystick to navigate.
      </p>
      <p>
        <GiArrowCursor /> If your devices supports it, click on the screen to
        use your pointer to control the camera.
      </p>
      <p>
        <GiKeyboard /> You can also use your keyboard for moving around (WASD)
        and rotate camera (IJKL).
      </p>
    </div>
  );
};

export default Menu;
