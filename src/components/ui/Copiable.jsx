import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState, useEffect } from "react";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

export const Copiable = ({ text, children, type = "single-line" }) => {
  const [copy, setCopy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCopy(false), 700);
    return () => clearTimeout(timer);
  });

  return (
    <CopyToClipboard text={text} onCopy={() => setCopy(true)}>
      <div
        className={`bg-zinc-900 ${
          type === "single-line" ? "rounded-full" : "rounded-3xl"
        } px-4 flex gap-2 min-h-12 items-center hover:bg-zinc-900/80 cursor-pointer`}
      >
        <div className="w-full">{children}</div>
        <div
          className={`text-xs ${
            copy ? "opacity-0 transition-all duration-700" : "opacity-1"
          }`}
        >
          <span
            className={`text-sm ${
              copy ? "text-emerald-500" : "text-white/70"
            }`}
          >
            {!copy ? <LuCopy /> : <LuCopyCheck />}
          </span>
        </div>
      </div>
    </CopyToClipboard>
  );
};
