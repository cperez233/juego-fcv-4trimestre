import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../max-heroes-doomsday.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
