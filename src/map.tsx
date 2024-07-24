import "./css/map.css";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const Map = ({ region, pos_norm }: { region: string; pos_norm: number[] }) => {
  const [ctx, set_ctx] = useState<CanvasRenderingContext2D>();

  useEffect(() => {
    if (!ctx) return;

    ctx.clearRect(0, 0, 200, 200);
    ctx.fillRect(pos_norm[0] * 144 + 10, pos_norm[1] * 100 + 10, 4, 4);
  }, [ctx, pos_norm]);

  return (
    <div id="map">
      <canvas
        width="164px"
        height="120px"
        ref={(canvas_ref) => {
          if (!canvas_ref) return;

          const ctx = canvas_ref.getContext("2d");
          ctx.strokeStyle = "#8caaf5cc";
          ctx.lineWidth = 4;
          ctx.fillStyle = "red";

          set_ctx(ctx);
        }}
      />
      <img
        src={`${location.href}/img/${region}.png`}
        alt=""
        width="144px"
        height="136px"
      />
      <p>{region}</p>
    </div>
  );
};

export default Map;
