import { useState } from "react";
import { IoLockClosedSharp } from "react-icons/io5";
import InputPassword from "../components/InputPassword";
import Button from "../components/Button";

const Login = () => {
  const [pass, setPass] = useState("");
  const handleInput = (e) => setPass(e.target.value);

  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="flex w-full justify-center items-center">
        {/* <h1 className="text-2xl text-center font-extrabold text-black">MY VAULT!</h1> */}
        <div className="p-4 flex rounded-xl flex-col items-center justify-center shadow-md w-full mx-0 max-w-[500px] sm:mx-auto bg-white">
          <h1 className="text-md flex gap-2 items-center text-emerald-400 font-bold mb-12">
            Vault is safe! <IoLockClosedSharp />
          </h1>
          <div className="py-2 w-full">
            <label className="font-semibold text-sm mb-1">
              Enter Password to open
            </label>
            <InputPassword name="auth" onChange={handleInput} />
          </div>
          <Button type="submit" disabled={pass.length === 0}>
            UNLOCK THE VAULT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
