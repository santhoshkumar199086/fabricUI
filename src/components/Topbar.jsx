import React from "react";
import { FaUserCircle, FaBell, FaQuestionCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Topbar() {
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <div className="flex space-x-8">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-lg font-semibold pb-1 ${
              isActive ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"
            }`
          }
        >
          Fabric NMS
        </NavLink>

        <NavLink
          to="/telemetry"
          className={({ isActive }) =>
            `text-lg pb-1 ${isActive ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"}`
          }
        >
          Telemetry
        </NavLink>

        <NavLink
          to="/fabric"
          className={({ isActive }) =>
            `text-lg pb-1 ${isActive ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"}`
          }
        >
          Fabric Config
        </NavLink>
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
4;
