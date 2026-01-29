import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/Context";
import { ItemView } from "./RenderItems";
import Fuse from "fuse.js";
import Modal from "./ui/Modal";
import { LuX } from "react-icons/lu";

/**
 *
 */
export const Panel = ({
  setEditorState,
  setPanelState,
  editor,
  panelState,
}) => {
  const [removingId, setRemovingId] = useState("");
  const [showFirstTime, setShowFirstTime] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(["login", "note"]);
  const [error, setError] = useState("");

  const { data, setData, session } = useAppContext();

  useEffect(() => setShowFirstTime(true), []);

  return (
    <motion.div
      className={`px-2 py-2 mt-2 absolute w-full left-0 top-16 z-20 backdrop-blur-md text-white border border-lime-100/10 bg-lime-500/10 rounded-3xl`}
      animate={panelState}
      // initial={{ y: 400, opacity: 0.5 }}
      // variants={{
      //   active: { y: 0, opacity: 1 },
      //   topover: { y: 30, opacity: 1 },
      //   inactive: { y: 400, opacity: 1 },
      // }}
      // transition={{
      //   delay: !showFirstTime ? 0.3 : 0,
      // }}
      initial={{ transform: "translateY(400px)", opacity: 0.5 }}
      transition={{
        delay: !showFirstTime ? 0.3 : 0,
        type: "spring",
        stiffness: 500,
        damping: 28,
      }}
      variants={{
        active: { transform: "translateY(0px)", opacity: 1 },
        topover: { transform: "translateY(30px)", opacity: 1 },
        inactive: { transform: "translateY(400px)", opacity: 1 },
      }}
      onClick={() => {
        if (editor.show) {
          setEditorState({ ...editor, animate: "disable" });
          setPanelState("topover");
        }
      }}
    >
      <ErrorModal
        isOpen={!!error}
        errorMsg={error}
        onClose={() => setError("")}
      />
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
      <div className="pb-2 flex gap-2 items-center">
        <motion.input
          placeholder="Search..."
          className="h-8 w-full border border-zinc-500/10 outline-none rounded-full bg-zinc-500/10 text-white/70 px-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-xs shrink-0 h-8">
          <button
            className={`${
              filter.length === 2
                ? "bg-zinc-500/30"
                : "hover:bg-zinc-500/20 bg-zinc-500/10"
            } rounded-l-full border-y duration-200 border-white/10 border-l h-full px-2`}
            onClick={() => setFilter(["note", "login"])}
          >
            All
          </button>
          <button
            className={`${
              filter.length === 1 && filter.includes("login")
                ? "bg-zinc-500/30"
                : "hover:bg-zinc-500/20 bg-zinc-500/10"
            } border h-full px-2 duration-200 border-white/10`}
            onClick={() => setFilter(["login"])}
          >
            Logins
          </button>
          <button
            className={`${
              filter.length === 1 && filter.includes("note")
                ? "bg-zinc-500/30"
                : "hover:bg-zinc-500/20 bg-zinc-500/10"
            } rounded-r-full duration-200 border-y border-r h-full px-2 border-white/10`}
            onClick={() => setFilter(["note"])}
          >
            Notes
          </button>
        </div>
      </div>
      <div
        style={{ height: "calc(100vh - 128px)" }}
        className={`overflow-auto ${
          editor.animate === "disable" ? "pb-12" : "pb-4"
        }`}
      >
        <motion.ul>
          <ItemViewContainer search={search} filter={filter}>
            {(results) => {
              return results.map((r, i) => (
                <div key={i}>
                  {r.data.length > 0 && (
                    <div key={`data-${i}`} className="pb-4">
                      {r.title.length > 0 && (
                        <h1 className="text-xs text-white/50 border-white/50 mt-2 border-b font-bold">
                          {r.title}
                        </h1>
                      )}
                      {r.data.map((item, index) => (
                        <ItemView
                          key={item.id}
                          setPanelState={setPanelState}
                          setEditorState={setEditorState}
                          removingId={removingId}
                          index={index}
                          setRemovingId={setRemovingId}
                          isRemoving={removingId === item.id}
                          onRemoveComplete={() => {
                            // setData((prev) =>
                            //   prev.filter((d) => d.id !== item.id)
                            // );
                            // const copy = [...data];

                            (async () => {
                              const res = await window.api.remove(
                                session,
                                item.id
                              );

                              if (res.success === true) {
                                setData(res.data);
                              } else {
                                // setData(copy);
                                setError(res.error);
                              }
                              setRemovingId("");
                            })();
                            // const copy = [...data];
                            // setData((prev) =>
                            //   prev.filter((d) => d.id !== item.id)
                            // );
                            // setRemovingId("");
                            // (async () => {
                            //   const res = await window.api.update(
                            //     session,
                            //     data.filter((d) => d.id !== item.id)
                            //   );
                            //   if (res.success === true) {
                            //     setData((prev) =>
                            //       prev.filter((d) => d.id !== item.id)
                            //     );
                            //   } else {
                            //     setData(copy);
                            //     if (res.error.match("ENOSPC")) {
                            //       setError(
                            //         "There is no space left on the device to complete this action."
                            //       );
                            //     } else {
                            //       setError(
                            //         "Unexpected Error :(, Cannot delete right now."
                            //       );
                            //     }
                            //   }
                            // })();
                          }}
                          {...item}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ));
            }}
          </ItemViewContainer>
        </motion.ul>
      </div>
    </motion.div>
  );
};

/**
 *
 */
const ItemViewContainer = ({ search, filter, children }) => {
  const { data } = useAppContext();

  if (search.trim() === "") {
    return children([
      { title: "", data: data.filter((d) => filter.includes(d.type)) },
    ]);
  }

  const notes = data.filter((d) => d.type === "note");
  const logins = data.filter((d) => d.type === "login");

  const notesResults = new Fuse(notes, {
    keys: ["title"],
  });

  const loginsResults = new Fuse(logins, {
    keys: ["title"],
  });

  return children(
    [
      { title: "Notes", data: notesResults.search(search).map((s) => s.item) },
      {
        title: "Logins",
        data: loginsResults.search(search).map((s) => s.item),
      },
    ].filter((results) =>
      filter.includes(results.title.toLowerCase().slice(0, -1))
    )
  );
};

/**
 *
 */
const ErrorModal = ({ isOpen, onClose, errorMsg }) => {
  return (
    <Modal isOpen={isOpen}>
      <div>
        <div className="flex justify-between">
          <h1 className="font-bold text-base text-white">Something is wrong</h1>
          <button
            className="hover:text-white/50 duration-200"
            onClick={onClose}
          >
            <LuX />
          </button>
        </div>
        <p className="text-rose-500 text-sm my-12">{errorMsg}</p>
      </div>
    </Modal>
  );
};
