import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./app/App.css";
import { getRuntimePlatform } from "./platform/runtimePlatform";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App platform={getRuntimePlatform()} />
  </React.StrictMode>,
);
