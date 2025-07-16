import Router from "./router/Router";
import { ContextProvider } from "./context/Context";

export default function App() {
  return (
    <ContextProvider>
      <Router />
    </ContextProvider>
  );
}
