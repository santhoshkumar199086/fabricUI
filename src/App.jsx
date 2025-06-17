import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import FabricConfigApp from './pages/Fabric';
import SKUManagementApp from './pages/SKU';
import SiteConfigurationApp from './pages/CreateSIte';

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
              {/* <Route path="/Fabric" element={<FabricConfigApp />} /> */}
              <Route path="/SKU" element={<SKUManagementApp />} />
              <Route path="/Fabric" element={<FabricConfigApp />} />
               <Route path="/CreateSite" element={<SiteConfigurationApp/>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;