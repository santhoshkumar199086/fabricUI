import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Radio, Settings, Menu, X } from "lucide-react";
import Palcwhite from "../assets/icons/PalclogoWhite.png";

const Sidebar = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) => {
  const [hoveredNav, setHoveredNav] = useState(null);
  const [screenSize, setScreenSize] = useState("desktop");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
        setSidebarCollapsed(true);
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  const handleFabricClick = () => {
    navigate("/fabricconfig");
    // Close mobile sidebar after navigation
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const navigationItems = [
    {
      id: "fabric",
      label: "Fabric NMS",
      icon: null, // Custom icon
      path: "/fabricconfig",
      isActive: false,
      onClick: handleFabricClick,
    },
    {
      id: "telemetry",
      label: "Telemetry",
      icon: Radio,
      path: "/spine",
      isActive: false,
    },
    {
      id: "config",
      label: "Fabric Config",
      icon: Settings,
      path: "/config",
      isActive: false,
    },
  ];

  const renderCustomFabricIcon = () => (
    <div className="w-4 h-4 lg:w-7 lg:h-7 flex items-center justify-center flex-shrink-0">
      <div className="grid grid-cols-2 gap-0.5">
        <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
        <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
        <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
        <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
      </div>
    </div>
  );

  const renderTooltip = (label) => (
    <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap">
      {label}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 border-4 border-transparent border-r-gray-900"></div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          ${sidebarCollapsed ? "w-16 lg:w-20" : "w-64 lg:w-72"} 
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 
          fixed lg:static 
          inset-y-0 left-0 
          z-50 lg:z-auto
          h-full 
          text-white 
          transition-all duration-300 ease-in-out 
          lg:flex-shrink-0
        `}
        style={{ backgroundColor: "#5955b3" }}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-purple-600 rounded-lg z-10"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className={`${sidebarCollapsed ? "p-3 lg:p-4" : "p-4 lg:p-6"}`}>
          <Link to="/dashboard">
            <div className="flex items-center space-x-3">
              <img src={Palcwhite} alt="PalcWhiteLogo" width={50} />
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="transition-opacity duration-300 overflow-hidden">
                  <h1 className="font-medium text-4xl xl:text-5xl whitespace-nowrap">
                    PalC
                  </h1>
                  <p className="text-purple-200 text-xs lg:text-sm whitespace-nowrap">
                    Fabric Manager
                  </p>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-4 lg:mt-8">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              onClick={item.onClick || (() => handleNavClick(item.path))}
              className={`${
                sidebarCollapsed ? "px-3 lg:px-4" : "px-4 lg:px-6"
              } py-3 cursor-pointer relative overflow-visible transition-all duration-300 ease-in-out ${
                item.isActive ? "bg-purple-700 border-r-4 border-white" : ""
              }`}
              style={{
                backgroundColor:
                  hoveredNav === item.id && !item.isActive
                    ? "rgba(255,255,255,0.1)"
                    : item.isActive
                    ? "#6d28d9"
                    : "transparent",
              }}
              onMouseEnter={() => setHoveredNav(item.id)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <div className="flex items-center space-x-3 relative z-10">
                {item.id === "fabric" ? (
                  renderCustomFabricIcon()
                ) : (
                  <item.icon
                    size={18}
                    className="lg:w-7 lg:h-7 flex-shrink-0"
                  />
                )}
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="font-medium transition-opacity duration-300 text-xl 2xl:text-base whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </div>

              {/* Hover indicator for non-active items */}
              {hoveredNav === item.id &&
                !sidebarCollapsed &&
                !item.isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white transition-all duration-300 ease-in-out"></div>
                )}

              {/* Active indicator for dashboard */}
              {item.isActive && !sidebarCollapsed && (
                <div className="absolute inset-0 bg-white bg-opacity-10 transition-all duration-300 ease-in-out"></div>
              )}

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed &&
                hoveredNav === item.id &&
                !mobileSidebarOpen &&
                renderTooltip(item.label)}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
