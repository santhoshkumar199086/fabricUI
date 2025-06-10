import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../src/pages/Login";
import ProtectedRoute from "../src/Routes/ProtectedRoute";
import Dashboard from "../src/pages/Dashboard";
import Telemetry from "../src/pages/Telemetry/Telemetry"
import FabricConfig from "../src/pages/FabricConfig";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";


function App() {
  return (
    <Router>
  <Routes>
    <Route path="/login" element={<Login />} />
    
    <Route element={<ProtectedRoute />}>
      <Route 
        path="/*" 
        element={
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Topbar />
              <main className="p-6 overflow-auto">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/telemetry" element={<Telemetry />} />
                  <Route path="/fabric" element={<FabricConfig />} />
                </Routes>
              </main>
            </div>
          </div>
        } 
      />
    </Route>
    
    <Route path="/" element={<Navigate to="/login" />} />
  </Routes>
</Router>
  );
}

export default App;
