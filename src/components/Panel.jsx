import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/Context";
import { ItemView } from "./RenderItems";
import Fuse from "fuse.js";

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

  const { data, setData, passKey } = useAppContext();

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

      <div className="pb-2 flex gap-2 items-center">
        <motion.input
          className="h-8 w-full rounded-full bg-zinc-500/10 text-white/70 px-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-xs shrink-0 h-8">
          <button
            className={`${
              filter.length === 2
                ? "bg-zinc-500/30"
                : "hover:bg-zinc-500/20 bg-zinc-500/10"
            } rounded-l-3xl border-y border-white/10 border-l box-border h-full px-2`}
            onClick={() => setFilter(["note", "login"])}
          >
            All
          </button>

          <button
            className={`${
              filter.length === 1 && filter.includes("login")
                ? "bg-zinc-500/30"
                : "hover:bg-zinc-500/20 bg-zinc-500/10"
            } border h-full px-2 box-border border-white/10`}
            onClick={() => setFilter(["login"])}
          >
            Logins
          </button>
          <button
            className={`${
              filter.length === 1 && filter.includes("note")
                ? "bg-zinc-500/30"
                : "hover:bg-zinc-500/20 bg-zinc-500/10"
            } rounded-r-3xl box-border border-y border-r h-full px-2 border-white/10`}
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
        <motion.ul
        // transition={{
        //   delayChildren: stagger(0.1),
        // }}
        >
          <ItemViewContainer search={search} filter={filter}>
            {
              // (results) => <>{JSON.stringify(results)}</>
              (results) =>
                results.map((r) => (
                  <>
                    {r.data.length > 0 && (
                      <div className="pb-4">
                        {r.title.length > 0 && (
                          <h1 className="text-xs text-white/50 border-white/50 mt-2 border-b font-bold">
                            {r.title}
                          </h1>
                        )}
                        {r.data.map((item, index) => (
                          <ItemView
                            setPanelState={setPanelState}
                            setEditorState={setEditorState}
                            removingId={removingId}
                            key={item.id}
                            index={index}
                            setRemovingId={setRemovingId}
                            isRemoving={removingId === item.id}
                            onRemoveComplete={() => {
                              setData((prev) =>
                                prev.filter((d) => d.id !== item.id)
                              );
                              setRemovingId("");
                              (async () => {
                                await window.api.encryptVault(
                                  passKey,
                                  data.filter((d) => d.id !== item.id)
                                );

                                const res = await window.api.decryptVault(
                                  passKey
                                );

                                if (res.success) {
                                  setData(res.data);
                                }
                              })();
                            }}
                            {...item}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ))
            }
          </ItemViewContainer>
        </motion.ul>
      </div>
    </motion.div>
  );
};

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
