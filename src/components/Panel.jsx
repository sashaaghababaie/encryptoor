import { motion } from "motion/react";
export const Panel = ({
  setEditorState,
  setPanelState,
  editor,
  panelState,
}) => {
  return (
    <motion.div
      className="p-2 mt-2 absolute w-full left-0 top-16 z-20 backdrop-blur-md text-white border border-lime-100/10 bg-lime-500/10 rounded-3xl h-full"
      initial={{ y: 400, opacity: 0.5 }}
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
      {editor.show && (
        <div
          onClick={() => {
            if (editor.show) {
              setEditorState({ ...editor, animate: "disable" });
              setPanelState("topover");
            }
          }}
          className="h-full w-full absolute left-0 top-10 ursor-pointer"
        ></div>
      )}
      <motion.input className="h-8 w-full rounded-full bg-zinc-500/10 text-white/70 px-4" />
    </motion.div>
  );
};
