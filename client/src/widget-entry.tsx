import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Widget from "./Widget";
import "./index.css";

createRoot(document.getElementById("widget-root")!).render(
  <StrictMode>
    <Widget />
  </StrictMode>
);
