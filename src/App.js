import Main from "electron/main";
import { ContextProvider } from "./context/Context";

export default function App() {
  return (
    <ContextProvider>
      <Main />
    </ContextProvider>
  );
}
