import { createRoot } from "react-dom/client";
import { App } from "./components/index.ts";
import { BrowserRouter } from "react-router";
import { SocketProvider } from "@client/hooks";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found!");
}

const root = createRoot(rootElement);
root.render(
  <BrowserRouter>
    <SocketProvider url={`ws://localhost:3015/socket`}>
      <App />
    </SocketProvider>
  </BrowserRouter>,
);
