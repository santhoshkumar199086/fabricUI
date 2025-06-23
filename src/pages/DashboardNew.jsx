import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Radio, 
  Settings, 
  User, 
  Bell, 
  MessageSquare,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import ServerIcon from "../assets/icons/server_icon.png";
import FabricIcon from "../assets/icons/fabric_icon.png";
import FabricNMSIcon from "../assets/icons/fabric_nms.png";
import TelemetryIcon from "../assets/icons/telemetry.png";
import Palcwhite from "../assets/icons/PalclogoWhite.png";

const NewDashboard = () => {
  const [hoveredNav, setHoveredNav] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        setSidebarCollapsed(true); // Auto-collapse on mobile
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGridClasses = () => {
    if (screenSize === 'mobile') {
      return 'grid-cols-1';
    } else if (screenSize === 'tablet') {
      return 'grid-cols-1 md:grid-cols-2';
    } else {
      // Desktop
      return sidebarCollapsed ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    }
  };

  const getAboutUsSpan = () => {
    if (screenSize === 'mobile') {
      return 'col-span-1';
    } else if (screenSize === 'tablet') {
      return 'md:col-span-2';
    } else {
      return sidebarCollapsed ? 'xl:col-span-2' : 'xl:col-span-2';
    }
  };

  const getFeatureCardsSpan = () => {
    if (screenSize === 'mobile') {
      return 'col-span-1';
    } else if (screenSize === 'tablet') {
      return 'md:col-span-2';
    } else {
      return 'xl:col-span-1';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif]">
      {/* Import Poppins font */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="flex h-screen">
        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarCollapsed ? 'w-16 lg:w-20' : 'w-64 lg:w-72'} 
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          fixed lg:static 
          inset-y-0 left-0 
          z-50 lg:z-auto
          h-full 
          text-white 
          transition-all duration-300 ease-in-out 
          lg:flex-shrink-0
        `} style={{backgroundColor: '#5955b3'}}>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-purple-600 rounded-lg z-10"
          >
            <X size={20} />
          </button>

          {/* Logo */}
          <div className={`${sidebarCollapsed ? 'p-3 lg:p-4' : 'p-4 lg:p-6'}`}>
            <div className="flex items-center space-x-3">
             <img src={Palcwhite} alt="PalcWhiteLogo" width={50} />
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="transition-opacity duration-300 overflow-hidden">
                  <h1 className="font-medium text-4xl xl:text-5xl whitespace-nowrap">PalC</h1>
                  <p className="text-purple-200 text-xs lg:text-sm whitespace-nowrap">Fabric Manager</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 lg:mt-8">
            {/* Dashboard */}
            <div 
              className={`${sidebarCollapsed ? 'px-3 lg:px-4' : 'px-4 lg:px-6'} py-3 bg-purple-700 border-r-4 border-white relative overflow-visible`}
              onMouseEnter={() => setHoveredNav('dashboard')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <div className="flex items-center space-x-3 relative z-10">
                <LayoutDashboard size={18} className="lg:w-7 lg:h-7 flex-shrink-0" />
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="font-medium transition-opacity duration-300 text-xl 2xl:text-base whitespace-nowrap overflow-hidden">Dashboard</span>
                )}
              </div>
              {hoveredNav === 'dashboard' && !sidebarCollapsed && (
                <div className="absolute inset-0 bg-white bg-opacity-10 transition-all duration-300 ease-in-out"></div>
              )}
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && hoveredNav === 'dashboard' && !mobileSidebarOpen && (
                <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap">
                  Dashboard
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
            
            {/* Fabric NMS */}
            <div 
              className={`${sidebarCollapsed ? 'px-3 lg:px-4' : 'px-4 lg:px-6'} py-3 cursor-pointer relative overflow-visible transition-all duration-300 ease-in-out`}
              style={{
                backgroundColor: hoveredNav === 'fabric' ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
              onMouseEnter={() => setHoveredNav('fabric')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-4 h-4 lg:w-7 lg:h-7 flex items-center justify-center flex-shrink-0">
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
                    <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
                    <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
                    <div className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-white rounded-sm"></div>
                  </div>
                </div>
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="transition-opacity duration-300 text-xl 2xl:text-base whitespace-nowrap overflow-hidden">Fabric NMS</span>
                )}
              </div>
              {hoveredNav === 'fabric' && !sidebarCollapsed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white transition-all duration-300 ease-in-out"></div>
              )}
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && hoveredNav === 'fabric' && !mobileSidebarOpen && (
                <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap">
                  Fabric NMS
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
            
            {/* Telemetry */}
            <div 
              className={`${sidebarCollapsed ? 'px-3 lg:px-4' : 'px-4 lg:px-6'} py-3 cursor-pointer relative overflow-visible transition-all duration-300 ease-in-out`}
              style={{
                backgroundColor: hoveredNav === 'telemetry' ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
              onMouseEnter={() => setHoveredNav('telemetry')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <div className="flex items-center space-x-3 relative z-10">
                <Radio size={18} className="lg:w-7 lg:h-7 flex-shrink-0" />
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="transition-opacity duration-300 text-xl 2xl:text-base whitespace-nowrap overflow-hidden">Telemetry</span>
                )}
              </div>
              {hoveredNav === 'telemetry' && !sidebarCollapsed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white transition-all duration-300 ease-in-out"></div>
              )}
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && hoveredNav === 'telemetry' && !mobileSidebarOpen && (
                <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap">
                  Telemetry
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
            
            {/* Fabric Config */}
            <div 
              className={`${sidebarCollapsed ? 'px-3 lg:px-4' : 'px-4 lg:px-6'} py-3 cursor-pointer relative overflow-visible transition-all duration-300 ease-in-out`}
              style={{
                backgroundColor: hoveredNav === 'config' ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
              onMouseEnter={() => setHoveredNav('config')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <div className="flex items-center space-x-3 relative z-10">
                <Settings size={18} className="lg:w-7 lg:h-7 flex-shrink-0" />
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="transition-opacity duration-300 text-xl 2xl:text-base whitespace-nowrap overflow-hidden">Fabric Config</span>
                )}
              </div>
              {hoveredNav === 'config' && !sidebarCollapsed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white transition-all duration-300 ease-in-out"></div>
              )}
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && hoveredNav === 'config' && !mobileSidebarOpen && (
                <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap">
                  Fabric Config
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              {/* Left side - Menu buttons */}
              <div className="flex items-center space-x-3">
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={20} className="text-gray-600" />
                </button>
                
                {/* Desktop Collapse Button */}
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                    <div className="w-full h-0.5 bg-gray-600 transition-all duration-300"></div>
                    <div className="w-full h-0.5 bg-gray-600 transition-all duration-300"></div>
                    <div className="w-full h-0.5 bg-gray-600 transition-all duration-300"></div>
                  </div>
                </button>
              </div>
              
              {/* Right side - User controls */}
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MessageSquare size={18} className="lg:w-5 lg:h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell size={18} className="lg:w-5 lg:h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-xs lg:text-sm text-gray-600 hidden sm:block">Hi Rahul</span>
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#5955b3'}}>
                    <User size={14} className="lg:w-4 lg:h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6">
              {/* Welcome Message */}
              <div className="mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-semibold text-gray-800">Welcome to PalC Fabric Manager</h2>
              </div>
              
              {/* Main Grid Container */}
              <div className={`grid ${getGridClasses()} gap-4 lg:gap-6 transition-all duration-300`}>
                {/* About Us Section */}
                <div className={`${getAboutUsSpan()} transition-all duration-300`}>
                  <div className="rounded-lg shadow-sm p-4 lg:p-6 h-full" style={{backgroundColor: '#f4f1ff'}}>
                    
                    <div className="space-y-3 lg:space-y-4 text-gray-600">
                      <p className="text-sm lg:text-base leading-relaxed">
                        <strong>PalC Fabric Manager</strong> is a next-generation, AI-driven solution purpose-built to simplify, automate, and assure the full 
                        lifecycle management of modern data center fabrics.
                      </p>
                      <p className="text-sm lg:text-base leading-relaxed">
                        It combines modularity, openness, and deep analytics to deliver intent-based operations across multi-vendor 
                        environments.
                      </p>
                      <p className="text-sm lg:text-base leading-relaxed">
                        The architecture is centered around three tightly integrated functional components, managed seamlessly through a 
                        unified orchestration portal.
                      </p>
                    </div>
                    
                    {/* Server Infrastructure Image - Responsive */}
                    <div className="mt-6 lg:mt-8 flex justify-end">
                      <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                         <img src={ServerIcon} alt="Datacenter-server" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Cards Container */}
                <div className={`${getFeatureCardsSpan()} transition-all duration-300`}>
                  <div className="space-y-4 lg:space-y-6">
                    {/* Fabric NMS Card */}
                    <div className="rounded-lg p-4 lg:p-6 border border-pink-200 relative transition-transform hover:scale-105 hover:shadow-lg" style={{backgroundColor: '#faecf1'}}>
                      <div className="flex flex-col h-full">
                        <div className="flex items-start space-x-4 mb-4">
                          {/* Icon */}
                          <img src={FabricIcon} alt="Datacenter-server" width={50} />
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2 text-base lg:text-lg">Fabric NMS</h4>
                            <p className="text-sm lg:text-sm text-gray-600 leading-relaxed">
                              Build the different types of racks that you will be 
                              deploying, operating, and managing in your network 
                              with Net Fabric.
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow at bottom right */}
                        <div className="flex justify-end mt-auto">
                          <button className="w-6 h-6 lg:w-8 lg:h-8 bg-pink-300 rounded-full flex items-center justify-center hover:bg-pink-400 transition-colors">
                            <ChevronRight size={12} className="lg:w-4 lg:h-4 text-pink-700" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Card */}
                    <div className="rounded-lg p-4 lg:p-6 border border-purple-200 relative transition-transform hover:scale-105 hover:shadow-lg" style={{backgroundColor: '#f4f1ff'}}>
                      <div className="flex flex-col h-full">
                        <div className="flex items-start space-x-4 mb-4">
                          {/* Icon */}
                          <img src={TelemetryIcon} alt="Datacenter-server" width={50} />
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2 text-base lg:text-lg">Telemetry</h4>
                            <p className="text-sm lg:text-sm text-gray-600 leading-relaxed">
                              Create a design for your architecture, input the intent by 
                              choosing the services, the network structure, and build 
                              the overall design.
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow at bottom right */}
                        <div className="flex justify-end mt-auto">
                          <button className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-200 rounded-full flex items-center justify-center hover:bg-blue-300 transition-colors">
                            <ChevronRight size={12} className="lg:w-4 lg:h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fabric Configuration Card */}
                    <div className="rounded-lg p-4 lg:p-6 border border-purple-200 relative transition-transform hover:scale-105 hover:shadow-lg" style={{backgroundColor: '#f5ecfc'}}>
                      <div className="flex flex-col h-full">
                        <div className="flex items-start space-x-4 mb-4">
                          {/* Icon */}
                        <img src={FabricNMSIcon} alt="Datacenter-server" width={50} />
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2 text-base lg:text-lg">Fabric Configuration</h4>
                            <p className="text-sm lg:text-sm text-gray-600 leading-relaxed">
                              Once a design has been finalized, deploy the blueprint to 
                              push the design into production, assign resources, build 
                              as described, and validate the network is working as 
                              intended.
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow at bottom right */}
                        <div className="flex justify-end mt-auto">
                          <button className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-200 rounded-full flex items-center justify-center hover:bg-purple-300 transition-colors">
                            <ChevronRight size={12} className="lg:w-4 lg:h-4 text-purple-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

export default NewDashboard;