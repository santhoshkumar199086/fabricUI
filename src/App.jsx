import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "../src/pages/Login";
import ProtectedRoute from "../src/Routes/ProtectedRoute";
import Layout from "./components/Layout";
import DashboardContent from "./pages/DashboardNew";
import Telemetry from "../src/pages/Telemetry/Telemetry";
import FabricConfigApp from "./pages/Fabric";
import SKUManagementApp from "./pages/SKU";
import SiteConfigurationApp from "./pages/CreateSIte";
import Spine from "./pages/Telemetry/SpineTelemetry";
import PalCFabricManager from "./pages/NewFabric";
import IntentBasedNetworkDesigner from "./pages/FabricNewDesign";
import FabricConfigTabs from "./pages/FabricNMS/FabricConfig";

// function ProtectedTelemetryRoute() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!location.state?.fromButtonClick) {
//       navigate('/spine', { replace: true });
//     }
//   }, [location.state, navigate]);

//   return location.state?.fromButtonClick ? <Telemetry /> : null;
// }

// In your router:

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardContent />} />
                  <Route path="/telemetry" element={<Telemetry />} />
                  {/* <Route path="/telemetry" element={<ProtectedTelemetryRoute />} /> */}

                  <Route path="/SKU" element={<SKUManagementApp />} />
                  <Route path="/Fabric" element={<FabricConfigApp />} />
                  <Route path="/PalcFabric" element={<PalCFabricManager />} />
                  <Route path="/fabricconfig" element={<FabricConfigTabs />} />
                  <Route
                    path="/FabricNewDesign"
                    element={<IntentBasedNetworkDesigner />}
                  />
                  <Route
                    path="/CreateSite"
                    element={<SiteConfigurationApp />}
                  />
                  <Route path="/spine" element={<Spine />} />
                </Routes>
              </Layout>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
