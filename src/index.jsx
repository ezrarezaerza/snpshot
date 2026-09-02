import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";  
import App from "./App"; 
import { BrowserRouter as Router } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);
