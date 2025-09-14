// src/App.js
import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import About from "./components/About";

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
