import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Router } from "wouter";
import { useHashLocation } from "./lib/useHashLocation";


createRoot(document.getElementById("root")!).render(<App />);
 <Router hook={useHashLocation}>
    <App />
  </Router>