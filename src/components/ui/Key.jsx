import { LuCommand, LuCornerDownLeft } from "react-icons/lu";
import { useAppContext } from "../../context/Context";

const Ctrl = ({ className }) => <span className={className}>ctrl</span>;
const Esc = ({ className }) => <span className={className}>esc</span>;
const keys = {
  cmd: LuCommand,
  ctrl: Ctrl,
  enter: LuCornerDownLeft,
  esc: Esc,
};

const baseClass = "inline";
const sizes = {
  xs: "w-3 h-3 border p-px rounded-sm text-[9px]",
  sm: "w-4 h-4 border p-px rounded-[3px] text-[10px]",
  md: "w-5 h-5 border p-[1.5px] rounded-[4px] text-[12px]",
};
export default function Key({
  keyCode,
  size = "sm",
  className = "text-white border-white",
}) {
  const { platform } = useAppContext();

  const platformBaseKeyCode =
    keyCode === "cmd" || keyCode === "ctrl"
      ? platform === "darwin"
        ? "cmd"
        : "ctrl"
      : keyCode;

  if (platformBaseKeyCode in keys) {
    const KeyComponent = keys[platformBaseKeyCode];
    return (
      <KeyComponent
        className={`${baseClass} ${sizes[size] || ""} ${className}`}
      />
    );
  }
  return null;
}
