
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../src/pages/Login";
import ProtectedRoute from "../src/Routes/ProtectedRoute";
import Dashboard from "../src/pages/Dashboard";
import Telemetry from "../src/pages/Telemetry/Telemetry";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import FabricConfigApp from "./pages/Fabric";
import SKUManagementApp from "./pages/SKU";
import SiteConfigurationApp from "./pages/CreateSIte";
import Spine from "./pages/Telemetry/SpineTelemetry"

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
                      <Route path="/SKU" element={<SKUManagementApp />} />
                      <Route path="/Fabric" element={<FabricConfigApp />} />
                      <Route
                        path="/CreateSite"
                        element={<SiteConfigurationApp />}
                      />
                      <Route path="/spine" element={<Spine />} />
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