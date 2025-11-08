import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";

const rootElement = document.querySelector("#root");

console.log(rootElement);

if (!rootElement) {
  throw new Error("Root element not found!");
}

const root = createRoot(rootElement);
root.render(<App />);
