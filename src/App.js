import Router from "./pages/Router";
import Layout from "./components/Layout";
import { ContextProvider } from "./components/Context";

const App = () => {
  return (
    <Layout>
      <ContextProvider>
        <Router />
      </ContextProvider>
    </Layout>
  );
};

export default App;
