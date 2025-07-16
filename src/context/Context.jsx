import { useContext, createContext, useState } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [passKey, setPassKey] = useState("");
  const [data, setData] = useState([]);

  return (
    <Context.Provider value={{ passKey, setPassKey, data, setData }}>
      {children}
    </Context.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }
  return context;
};
