import Router from "./router/Router";

import { ContextProvider } from "./components/Context";

export default function App() {
  return (
    <ContextProvider>
      <Router />
    </ContextProvider>
  );
}
