import React from 'react';
import { FaUserCircle, FaBell, FaQuestionCircle } from 'react-icons/fa';

function Topbar() {
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <div className="flex space-x-8">
        <span className="text-lg font-semibold text-blue-600">Fabric NMS</span>
        <span className="text-gray-500">Telemetry</span>
        <span className="text-gray-500">Fabric Config</span>
      </div>
      <div className="flex items-center space-x-4">
        <FaQuestionCircle className="text-gray-600" />
        <FaBell className="text-gray-600" />
        <span className="text-gray-700">Hi PalC</span>
        <FaUserCircle className="text-blue-600 text-2xl" />
      </div>
    </header>
  );
}

export default Topbar;