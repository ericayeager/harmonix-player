// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import CSS files
import "./tailwind.css"; // ensure shadcn/tailwind styles are available
import "./styles/base.css";
import "./styles/theme-professional.css";
import "./styles/theme-cute.css";
import "./styles/theme-colorful.css";
import "./styles/aboutus.css";
import "./style.css"; // tailwind directives

const root = ReactDOM.createRoot(document.getElementById("root"));

// Hard redirect guard on initial load for unauthenticated users
try {
  const hasUser = Boolean(localStorage.getItem("auth-user"));
  if (!hasUser && location.hash !== "#/login") {
    location.hash = "#/login";
  }
} catch {}

root.render(<App />);
