import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./app/App.css";
import { browserPlatform } from "./platform/browser/browserPlatform";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App platform={browserPlatform} />
  </React.StrictMode>,
);
