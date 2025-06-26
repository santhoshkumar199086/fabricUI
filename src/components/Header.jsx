import React from "react";
import { Bell, MessageSquare, User, Menu } from "lucide-react";

const Header = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileSidebarOpen,
}) => {
  return (
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
            <span className="text-xs lg:text-sm text-gray-600 hidden sm:block">
              Hi Palc
            </span>
            <div
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#5955b3" }}
            >
              <User size={14} className="lg:w-4 lg:h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
