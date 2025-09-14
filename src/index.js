// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import CSS files
import "./styles/base.css";
import "./styles/theme-professional.css";
import "./styles/theme-cute.css";
import "./styles/theme-colorful.css";
import "./styles/aboutus.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
