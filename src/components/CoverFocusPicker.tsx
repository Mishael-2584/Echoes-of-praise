import { useCallback, type MouseEvent } from "react";

type Props = {
  src: string;
  focusX: number;
  focusY: number;
  onChange: (x: number, y: number) => void;
  label?: string;
};

/** Click the image to set which part stays in frame (object-position). */
export function CoverFocusPicker({
  src,
  focusX,
  focusY,
  onChange,
  label = "Click the photo to choose what stays in the crop",
}: Props) {
  const onClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.min(
        100,
        Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
      );
      const y = Math.min(
        100,
        Math.max(0, ((e.clientY - rect.top) / rect.height) * 100),
      );
      onChange(Math.round(x), Math.round(y));
    },
    [onChange],
  );

  return (
    <div className="cover-focus">
      <p className="cover-focus-label">{label}</p>
      <div className="cover-focus-grid">
        <button
          type="button"
          className="cover-focus-source"
          onClick={onClick}
          aria-label="Set cover focal point"
        >
          <img src={src} alt="" draggable={false} />
          <span
            className="cover-focus-pin"
            style={{ left: `${focusX}%`, top: `${focusY}%` }}
            aria-hidden
          />
        </button>
        <div className="cover-focus-preview">
          <span>Preview crop</span>
          <div className="cover-focus-frame">
            <img
              src={src}
              alt=""
              style={{ objectPosition: `${focusX}% ${focusY}%` }}
            />
          </div>
        </div>
      </div>
      <div className="cover-focus-sliders">
        <label>
          Horizontal {focusX}%
          <input
            type="range"
            min={0}
            max={100}
            value={focusX}
            onChange={(e) => onChange(Number(e.target.value), focusY)}
          />
        </label>
        <label>
          Vertical {focusY}%
          <input
            type="range"
            min={0}
            max={100}
            value={focusY}
            onChange={(e) => onChange(focusX, Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
