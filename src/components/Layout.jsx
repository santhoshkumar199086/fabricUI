import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif]">
      {/* Import Poppins font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="flex h-screen">
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            setMobileSidebarOpen={setMobileSidebarOpen}
          />

          {/* Content */}
          <div className="flex-1 overflow-auto">{children}</div>

          {/* Footer - positioned at bottom right */}
          <div className="fixed bottom-2 lg:bottom-4 right-2 lg:right-6 z-30">
            <div className="text-xs lg:text-sm text-gray-500 bg-white px-2 lg:px-3 py-1 rounded shadow-sm">
              © 2025 PalC Networks. All Rights Reserved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
