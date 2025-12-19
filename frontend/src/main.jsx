import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // App ko yahin import karte hain
import "./index.css"; // Tailwind / global CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
