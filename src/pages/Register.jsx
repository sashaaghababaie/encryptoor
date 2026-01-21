import { useState } from "react";
import InputPassword from "../components/InputPassword";
import Button from "../components/Button";
import { AiFillSafetyCertificate } from "react-icons/ai";

export default function Register() {
  const [newPass, setNewPass] = useState("");
  const [checkPass, setCheckPass] = useState("");
  const [matched, setMatched] = useState(false);

  const handleNewPass = (e) => {
    setNewPass(e.target.value);
    setMatched(e.target.value !== checkPass);
  };

  const handleCheckPass = (e) => {
    setCheckPass(e.target.value);
    setMatched(newPass !== e.target.value);
  };

  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="flex w-full justify-center items-center">
        {/* <h1 className="text-2xl text-center font-extrabold text-black">MY VAULT!</h1> */}
        <div className="p-4 flex rounded-xl flex-col items-center justify-center shadow-md w-full mx-0 max-w-[500px] sm:mx-auto bg-white">
          <h1 className="text-md flex gap-2 items-center text-emerald-400 font-bold mb-12">
            Create your vault <AiFillSafetyCertificate />
          </h1>
          <div className="py-2 w-full">
            <label className="text-sm mb-1">
              Set a <b>STRONG</b> password
            </label>
            <InputPassword autoFocus name="pass-1" onChange={handleNewPass} />
          </div>
          <div className="mt-6 py-2 w-full">
            <label className="text-sm mb-1">Type the password again</label>
            <InputPassword name="pass-2" onChange={handleCheckPass} />
          </div>
          <Button type="submit" disabled={!matched}>
            CREATE VAULT
          </Button>
          <p className="text-xs h-4 mt-2">
            {newPass.length > 0 && checkPass.length > 0 && (
              <>
                {matched ? (
                  <span className="text-emerald-400 font-bold">All good!</span>
                ) : (
                  <span className="text-rose-500">
                    Passwords are not the same.
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
