import { useState, useRef, useEffect } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

/**
 *
 */
export const TextInput = ({
  label,
  error,
  shouldAlign,
  className,
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (error && error.length > 0) {
      ref.current.focus();
    }
  }, [error]);

  return (
    <div
      className={`${
        error
          ? "outline outline-rose-500 bg-rose-700/20"
          : "outline-none bg-zinc-700/20"
      } w-full h-12 px-4 rounded-full shadow-inner-lg font-bold flex gap-2 items-center duration-200`}
    >
      <div className="flex gap-2">
        {label && (
          <label className={`text-zinc-400 ${shouldAlign && "w-24"}`}>
            {label}
          </label>
        )}
      </div>
      <input
        {...props}
        className={`w-full bg-transparent placeholder-zinc-500 outline-none text-zinc-300 ${className}`}
        ref={ref}
      />
      {error && <span className="text-rose-500">{error}</span>}
    </div>
  );
};

/**
 *
 */
export const PasswordInput = ({
  label,
  shouldAlign,
  className,
  type,
  error,
  ...props
}) => {
  const [showPass, setShowPass] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    if (error && error.length > 0) {
      ref.current.focus();
    }
  }, [error]);

  return (
    <div
      className={`${
        error
          ? "outline outline-rose-500 bg-rose-700/20"
          : "outline-none bg-zinc-700/20"
      } w-full h-12 px-4 rounded-full font-bold flex gap-2 items-center duration-200`}
    >
      {
        <label className={`text-zinc-400 shrink-0 ${shouldAlign && "w-24"}`}>
          {label}
        </label>
      }
      <input
        {...props}
        type={showPass ? "text" : "password"}
        className={`w-full bg-transparent placeholder-zinc-500 outline-none text-zinc-300 ${className}`}
        ref={ref}
      />
      {error && <span className="text-rose-500">{error}</span>}
      <button
        className="text-lg duration-200 text-white/50 hover:text-white/70"
        onClick={() => setShowPass(!showPass)}
      >
        {showPass ? <LuEyeOff /> : <LuEye />}
      </button>
    </div>
  );
};
