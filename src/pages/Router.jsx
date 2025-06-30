import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
// import Home from "./Home";
// import Login from "./Login";
// import Register from "./Register";
// import Start from "./Start";
import Main from "./Main";

const Router = () => {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route exact path="/" element={<Main />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
};

export default Router;
