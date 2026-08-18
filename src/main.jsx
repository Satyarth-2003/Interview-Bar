import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CommandPaletteProvider } from "./context/CommandPaletteContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CommandPaletteProvider>
      <App />
    </CommandPaletteProvider>
  </BrowserRouter>
);
