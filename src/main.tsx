import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import AxiosInterceptorProvider from "./providers/AxiosInterceptorProvider";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> 
        <AxiosInterceptorProvider>
          <App />
        </AxiosInterceptorProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

