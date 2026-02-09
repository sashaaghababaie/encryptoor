import Main from "./components/Main";
import { ContextProvider } from "./context/Context";

export default function App() {
  return (
    <ContextProvider>
      <Main />
    </ContextProvider>
  );
}
