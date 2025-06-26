import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import ServerIcon from "../assets/icons/server_icon.png";
import FabricIcon from "../assets/icons/fabric_icon.png";
import FabricNMSIcon from "../assets/icons/fabric_nms.png";
import TelemetryIcon from "../assets/icons/telemetry.png";

const DashboardContent = () => {
  const [screenSize, setScreenSize] = useState("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getGridClasses = () => {
    if (screenSize === "mobile") {
      return "grid-cols-1";
    } else if (screenSize === "tablet") {
      return "grid-cols-1 md:grid-cols-2";
    } else {
      return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
    }
  };

  const getAboutUsSpan = () => {
    if (screenSize === "mobile") {
      return "col-span-1";
    } else if (screenSize === "tablet") {
      return "md:col-span-2";
    } else {
      return "xl:col-span-2";
    }
  };

  const getFeatureCardsSpan = () => {
    if (screenSize === "mobile") {
      return "col-span-1";
    } else if (screenSize === "tablet") {
      return "md:col-span-2";
    } else {
      return "xl:col-span-1";
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Welcome Message */}
      <div className="mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-3xl font-semibold text-gray-800">
          Welcome to PalC Fabric Manager
        </h2>
      </div>

      {/* Main Grid Container */}
      <div
        className={`grid ${getGridClasses()} gap-4 lg:gap-6 transition-all duration-300`}
      >
        {/* About Us Section */}
        <div className={`${getAboutUsSpan()} transition-all duration-300`}>
          <div
            className="rounded-lg shadow-sm p-4 lg:p-6 h-full"
            style={{ backgroundColor: "#f4f1ff" }}
          >
            <div className="space-y-3 lg:space-y-4 text-gray-600">
              <p className="text-sm lg:text-base leading-relaxed">
                <strong>PalC Fabric Manager</strong> is a next-generation,
                AI-driven solution purpose-built to simplify, automate, and
                assure the full lifecycle management of modern data center
                fabrics.
              </p>
              <p className="text-sm lg:text-base leading-relaxed">
                It combines modularity, openness, and deep analytics to deliver
                intent-based operations across multi-vendor environments.
              </p>
              <p className="text-sm lg:text-base leading-relaxed">
                The architecture is centered around three tightly integrated
                functional components, managed seamlessly through a unified
                orchestration portal.
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
            <div
              className="rounded-lg p-4 lg:p-6 border border-pink-200 relative transition-transform hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: "#faecf1" }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Icon */}
                  <img src={FabricIcon} alt="Datacenter-server" width={50} />

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2 text-base lg:text-lg">
                      Fabric NMS
                    </h4>
                    <p className="text-sm lg:text-sm text-gray-600 leading-relaxed">
                      Build the different types of racks that you will be
                      deploying, operating, and managing in your network with
                      Net Fabric.
                    </p>
                  </div>
                </div>

                {/* Arrow at bottom right */}
                <div className="flex justify-end mt-auto">
                  <button className="w-6 h-6 lg:w-8 lg:h-8 bg-pink-300 rounded-full flex items-center justify-center hover:bg-pink-400 transition-colors">
                    <ChevronRight
                      size={12}
                      className="lg:w-4 lg:h-4 text-pink-700"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Telemetry Card */}
            <div
              className="rounded-lg p-4 lg:p-6 border border-purple-200 relative transition-transform hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: "#f4f1ff" }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Icon */}
                  <img src={TelemetryIcon} alt="Datacenter-server" width={50} />

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2 text-base lg:text-lg">
                      Telemetry
                    </h4>
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
                    <ChevronRight
                      size={12}
                      className="lg:w-4 lg:h-4 text-blue-600"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Fabric Configuration Card */}
            <div
              className="rounded-lg p-4 lg:p-6 border border-purple-200 relative transition-transform hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: "#f5ecfc" }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Icon */}
                  <img src={FabricNMSIcon} alt="Datacenter-server" width={50} />

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2 text-base lg:text-lg">
                      Fabric Configuration
                    </h4>
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
                    <ChevronRight
                      size={12}
                      className="lg:w-4 lg:h-4 text-purple-600"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
