import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/Context";
import { ItemView } from "./RenderItems";

export const Panel = ({
  setEditorState,
  setPanelState,
  editor,
  panelState,
}) => {
  const [removingId, setRemovingId] = useState("");
  const [showFirstTime, setShowFirstTime] = useState(false);

  const { data, setData } = useAppContext();

  useEffect(() => setShowFirstTime(true), []);

  return (
    <motion.div
      className={`px-2 py-2 mt-2 absolute w-full left-0 top-16 z-20 backdrop-blur-md text-white border border-lime-100/10 bg-lime-500/10 rounded-3xl`}
      initial={{ y: 400, opacity: 0.5 }}
      transition={{ delay: !showFirstTime ? 0.3 : 0 }}
      animate={panelState}
      variants={{
        active: { y: 0, opacity: 1 },
        topover: { y: 30, opacity: 1 },
        inactive: { y: 400, opacity: 0.5 },
      }}
      onClick={() => {
        if (editor.show) {
          setEditorState({ ...editor, animate: "disable" });
          setPanelState("topover");
        }
      }}
    >
      {editor.show && editor.animate !== "disable" && (
        <div
          onClick={() => {
            if (editor.show) {
              setEditorState({ ...editor, animate: "disable" });
              setPanelState("topover");
            }
          }}
          className="h-full w-full absolute left-0 top-10 cursor-pointer"
        ></div>
      )}

      <div className="pb-2">
        <motion.input className="h-8 w-full rounded-full bg-zinc-500/10 text-white/70 px-2" />
      </div>
      <div
        style={{ height: "calc(100vh - 128px)" }}
        className={`overflow-auto ${
          editor.animate === "disable" ? "pb-12" : "pb-4"
        }`}
      >
        <motion.ul
        // transition={{
        //   delayChildren: stagger(0.1),
        // }}
        >
          {data.map((item, index) => (
            <ItemView
              setPanelState={setPanelState}
              setEditorState={setEditorState}
              removingId={removingId}
              key={item.id}
              index={index}
              setRemovingId={setRemovingId}
              isRemoving={removingId === item.id}
              onRemoveComplete={() => {
                setData((prev) => prev.filter((d) => d.id !== item.id));
                setRemovingId("");
                (async () => {
                  await window.api.encryptVault(
                    "1234",
                    data.filter((d) => d.id !== item.id)
                  );

                  const res = await window.api.decryptVault("1234");

                  if (res.success) {
                    setData(res.data);
                  }
                })();
              }}
              {...item}
            />
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
};
