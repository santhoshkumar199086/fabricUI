import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Telemetry from "./pages/Telemetry/Telemetry";
import FabricConfig from "./pages/FabricConfig";

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <main className="p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/telemetry" element={<Telemetry />} />
              <Route path="/fabric" element={<FabricConfig />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
