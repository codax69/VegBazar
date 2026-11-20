import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { AuthProvider } from "./Context/AuthContext.jsx";
import "./index.css";
import App from "./App.jsx";

const apiBase = import.meta.env.VITE_API_URL || "";
if (apiBase) {
  axios.defaults.baseURL = apiBase;
}
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
