import { useState } from "react";
import { VscEye } from "react-icons/vsc";
import { VscEyeClosed } from "react-icons/vsc";

const InputPassword = ({ className, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex border-b w-full">
      <input
        type={show ? "text" : "password"}
        className={`mt-1 h-8 text-sm w-full focus:outline-none ${className}`}
        {...props}
      />
      <button
        tabIndex={-1}
        type="button"
        className="focus:outline-none hover:text-gray-600 duration-200 transition px-2"
        onClick={() => setShow(!show)}
      >
        {show ? <VscEye /> : <VscEyeClosed />}
      </button>
    </div>
  );
};

export default InputPassword;
